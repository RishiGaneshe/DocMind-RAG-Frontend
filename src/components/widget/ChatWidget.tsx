import {
  AlertCircle,
  Bot,
  ChevronRight,
  Clock,
  Maximize2,
  Minimize2,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ApiError,
  streamPublicChat,
  type PublicSource,
  type WidgetConfig,
} from '@/lib/api'
import { Markdown } from '@/features/chat/components/Markdown'
import { StreamingCursor, TypingIndicator } from '@/features/chat/components/StreamingIndicator'
import { cn } from '@/lib/utils'

export interface ChatWidgetProps {
  config?: Partial<WidgetConfig>
  limits?: {
    maxQueryLength?: number
    maxHistoryTurns?: number
  }
  workspaceName?: string
  mode?: 'preview' | 'live'
  apiKey?: string
  initiallyOpen?: boolean
  className?: string
  embedded?: boolean
  onClose?: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: PublicSource[]
  status?: 'streaming' | 'complete' | 'failed' | 'incomplete'
  timestamp: string
}

interface BlockedState {
  reason: string
  message: string
  retryIn?: number
}

const FATAL_CODES = new Set([
  'API_KEY_MISSING',
  'API_KEY_INVALID',
  'API_KEY_REVOKED',
  'API_KEY_EXPIRED',
  'SCOPE_FORBIDDEN',
  'ORIGIN_REQUIRED',
  'ORIGIN_NOT_ALLOWED',
  'WORKSPACE_UNAVAILABLE',
])

export function ChatWidget({
  config = {},
  limits,
  workspaceName,
  mode = 'preview',
  apiKey,
  initiallyOpen = false,
  className,
  embedded = false,
  onClose,
}: ChatWidgetProps) {
  const {
    title = workspaceName ? `${workspaceName} Assistant` : 'DocMind AI',
    greeting = 'Hello! Ask me anything about our documents and services.',
    placeholder = 'Ask a question...',
    accentColor = '#4E77B8',
    position = 'right',
    showBranding = true,
    footerNote = '',
    suggestions = [
      'What are the key features?',
      'How does pricing work?',
      'How do I get started?',
    ],
  } = config

  const maxQueryLength = limits?.maxQueryLength ?? 1000
  const maxHistoryTurns = limits?.maxHistoryTurns ?? 6

  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [isMaximized, setIsMaximized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      status: 'complete',
      timestamp: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [blocked, setBlocked] = useState<BlockedState | null>(null)
  const [cooldown, setCooldown] = useState<number | null>(null)
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(2, 9)}`)

  const abortRef = useRef<AbortController | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const handleSendRef = useRef<((textToSend?: string) => Promise<void>) | null>(null)

  // Sync greeting when config updates
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'greeting') {
        return [
          {
            id: 'greeting',
            role: 'assistant',
            content: greeting,
            status: 'complete',
            timestamp: 'Just now',
          },
        ]
      }
      return prev
    })
  }, [greeting])

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown === null) return
    if (cooldown <= 0) {
      setCooldown(null)
      setBlocked(null)
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
      return
    }

    cooldownTimerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev === null || prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
          setBlocked(null)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current)
    }
  }, [cooldown])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    if (!isOpen || embedded) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, embedded])

  // Allow external page elements to trigger opening the chat widget
  useEffect(() => {
    const handleExternalOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>
      setIsOpen(true)
      if (customEvent.detail?.query) {
        setTimeout(() => {
          void handleSendRef.current?.(customEvent.detail.query)
        }, 200)
      }
    }
    window.addEventListener('docmind:open-chat', handleExternalOpen)
    return () => window.removeEventListener('docmind:open-chat', handleExternalOpen)
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, scrollToBottom])

  const handleResetChat = () => {
    abortRef.current?.abort()
    setLoading(false)
    setMessages([
      {
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        status: 'complete',
        timestamp: 'Just now',
      },
    ])
    if (blocked && blocked.reason !== 'QUOTA_EXCEEDED' && !FATAL_CODES.has(blocked.reason)) {
      setBlocked(null)
      setCooldown(null)
    }
  }

  const handleClose = () => {
    abortRef.current?.abort()
    setIsOpen(false)
    setIsMaximized(false)
    onClose?.()
  }

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend ?? input).trim()
    if (!messageText || loading || blocked) return

    if (messageText.length > maxQueryLength) {
      return
    }

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: 'Just now',
    }

    const botMessageId = `bot_${Date.now()}`
    const assistantMessage: ChatMessage = {
      id: botMessageId,
      role: 'assistant',
      content: '',
      sources: [],
      status: 'streaming',
      timestamp: 'Just now',
    }

    // Build history according to INTEGRATION_GUIDE.md B7:
    // - turns from completed messages (exclude greeting)
    // - slice to last maxHistoryTurns
    // - max 1000 chars per turn
    // - keep total under 6000 chars
    const priorHistory = messages
      .filter((m) => m.id !== 'greeting' && m.content.trim().length > 0)
      .slice(-maxHistoryTurns)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, maxQueryLength),
      }))

    let totalChars = priorHistory.reduce((acc, h) => acc + h.content.length, 0)
    while (totalChars > 6000 && priorHistory.length > 1) {
      const dropped = priorHistory.shift()
      if (dropped) totalChars -= dropped.content.length
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    if (!textToSend) setInput('')
    setLoading(true)

    abortRef.current = new AbortController()
    const { signal } = abortRef.current

    if (mode === 'live' && apiKey) {
      try {
        await streamPublicChat(
          apiKey,
          {
            query: messageText,
            sessionId,
            history: priorHistory,
            signal,
          },
          {
            onSources: (payload) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === botMessageId ? { ...m, sources: payload.sources } : m)),
              )
            },
            onToken: (token) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMessageId ? { ...m, content: m.content + token } : m,
                ),
              )
            },
            onDone: () => {
              setMessages((prev) =>
                prev.map((m) => (m.id === botMessageId ? { ...m, status: 'complete' } : m)),
              )
            },
            onIncomplete: () => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMessageId && m.status === 'streaming'
                    ? { ...m, status: 'incomplete' }
                    : m,
                ),
              )
            },
            onLimits: (limits) => {
              if (limits.quotaRemaining !== null && limits.quotaRemaining <= 0) {
                setBlocked({
                  reason: 'QUOTA_EXCEEDED',
                  message: 'Daily message limit reached for this workspace.',
                })
              }
            },
          },
        )
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          // Closed or reset by user; clean up quietly
          return
        }

        const apiErr = err instanceof ApiError ? err : null
        const errorCode = apiErr?.code || ''
        const errorStatus = apiErr?.status || 0
        const errorMessage = (err as Error)?.message || 'Something went wrong.'

        if (FATAL_CODES.has(errorCode)) {
          console.error(`[chat] configuration error: ${errorCode}`, errorMessage)
          setBlocked({
            reason: errorCode,
            message: 'Chat is unavailable right now.',
          })
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? { ...m, content: 'Chat is unavailable right now.', status: 'failed' }
                : m,
            ),
          )
        } else if (errorCode === 'QUOTA_EXCEEDED') {
          setBlocked({
            reason: 'QUOTA_EXCEEDED',
            message: errorMessage || 'Daily message limit reached. Please try tomorrow.',
          })
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: errorMessage || 'The assistant is busy today. Try again tomorrow.',
                    status: 'failed',
                  }
                : m,
            ),
          )
        } else if (errorCode === 'RATE_LIMITED' || errorStatus === 429) {
          const waitSeconds = apiErr?.retryAfter || 30
          setCooldown(waitSeconds)
          setBlocked({
            reason: 'RATE_LIMITED',
            message: `Too many questions. Please wait ${waitSeconds}s.`,
            retryIn: waitSeconds,
          })
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content:
                      m.content ||
                      `Too many questions. Please wait ${waitSeconds} seconds before asking again.`,
                    status: m.content ? 'incomplete' : 'failed',
                  }
                : m,
            ),
          )
        } else if (errorStatus === 413) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: 'This conversation got too long. Starting a new one will help.',
                    status: 'failed',
                  }
                : m,
            ),
          )
        } else if (
          errorStatus === 503 ||
          errorStatus === 504 ||
          errorCode === 'SERVICE_UNAVAILABLE' ||
          errorCode === 'QUOTA_UNAVAILABLE'
        ) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: 'The assistant is briefly unavailable. Please try again in a moment.',
                    status: 'failed',
                  }
                : m,
            ),
          )
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMessageId
                ? {
                    ...m,
                    content: m.content || errorMessage,
                    status: m.content ? 'incomplete' : 'failed',
                  }
                : m,
            ),
          )
        }
      } finally {
        setLoading(false)
        abortRef.current = null
      }
    } else {
      // Simulation mode for SettingsWidget preview
      const previewReply = `This is a preview response simulating grounded RAG retrieval for: "${messageText}". When connected to your live workspace, answers are synthesized directly from your indexed PDFs with exact citations [1].`
      const previewSources: PublicSource[] = [
        {
          citation: 1,
          filename: 'Company_Handbook.pdf',
          page: 4,
          breadcrumb: 'Overview > General Guidelines',
          snippet:
            'All documentation is parsed into semantic chunks and embedded for grounded vector retrieval.',
        },
      ]

      let currentText = ''
      const words = previewReply.split(' ')

      setMessages((prev) =>
        prev.map((m) => (m.id === botMessageId ? { ...m, sources: previewSources } : m)),
      )

      let wordIndex = 0
      const interval = setInterval(() => {
        if (signal.aborted) {
          clearInterval(interval)
          setLoading(false)
          return
        }

        if (wordIndex < words.length) {
          currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex]
          wordIndex++
          setMessages((prev) =>
            prev.map((m) => (m.id === botMessageId ? { ...m, content: currentText } : m)),
          )
        } else {
          clearInterval(interval)
          setMessages((prev) =>
            prev.map((m) => (m.id === botMessageId ? { ...m, status: 'complete' } : m)),
          )
          setLoading(false)
        }
      }, 40)
    }
  }

  handleSendRef.current = handleSend

  return (
    <div
      className={cn(
        embedded ? 'relative h-full w-full' : 'fixed z-[100]',
        !embedded && (position === 'left' ? 'bottom-5 left-5' : 'bottom-5 right-5'),
        className,
      )}
      style={{ '--widget-accent': accentColor } as React.CSSProperties}
    >
      {/* Floating launcher trigger (rendered ONLY when chat window is closed) */}
      {!embedded && !isOpen && (
        <div className="flex items-center gap-3">
          {/* Teaser pill next to launcher communicating purpose */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-line bg-surface/95 py-2 px-3.5 text-xs text-fg shadow-xl backdrop-blur-xl transition-all duration-200 hover:border-accent/50 hover:bg-surface-raised active:scale-95 group cursor-pointer"
          >
            <Sparkles className="size-3.5 text-accent animate-pulse" />
            <span className="font-medium">Ask about this website</span>
            <span className="rounded-full bg-accent-wash px-1.5 py-0.5 text-[10px] text-accent font-mono">
              Docs AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open document assistant"
            title="Ask questions about this website"
            className={cn(
              'group relative flex size-14 items-center justify-center rounded-full bg-accent text-on-accent shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-accent-hover active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer',
              position === 'left' ? 'mr-auto' : 'ml-auto',
            )}
          >
            <Bot className="size-6.5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-3.5 rounded-full border-2 border-surface bg-emerald-500" />
            </span>
          </button>
        </div>
      )}

      {/* Chat Window: Opens smoothly and contains the SINGLE close button */}
      {(isOpen || embedded) && (
        <div
          role="dialog"
          aria-label={title}
          className={cn(
            'flex flex-col overflow-hidden rounded-2xl border border-line bg-surface text-fg shadow-2xl shadow-black/15 dark:shadow-black/70 backdrop-blur-2xl transition-all duration-500 ease-out',
            embedded ? 'h-full w-full border-0 shadow-none' : 'fixed',
            !embedded && isMaximized && (
              position === 'left'
                ? 'left-1/2 bottom-1/2 w-[95vw] sm:w-[85vw] max-w-[1000px] h-[90vh] sm:h-[85vh] -translate-x-1/2 translate-y-1/2'
                : 'right-1/2 bottom-1/2 w-[95vw] sm:w-[85vw] max-w-[1000px] h-[90vh] sm:h-[85vh] translate-x-1/2 translate-y-1/2'
            ),
            !embedded && !isMaximized && (
              position === 'left'
                ? 'left-5 bottom-5 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[calc(100vh-5.5rem)] translate-x-0 translate-y-0 origin-bottom-left'
                : 'right-5 bottom-5 w-[calc(100vw-2rem)] sm:w-[410px] h-[580px] max-h-[calc(100vh-5.5rem)] translate-x-0 translate-y-0 origin-bottom-right'
            ),
            !embedded && !isMaximized && 'animate-in fade-in zoom-in-95 duration-300',
          )}
        >
          {/* Modern Theme Header */}
          <div className="relative flex items-center justify-between border-b border-line bg-surface-raised/90 px-4 py-3.5 backdrop-blur-md">
            {/* Ambient accent top border highlight */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            <div className="flex items-center gap-3 min-w-0">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-wash border border-accent/25 text-accent shadow-xs">
                <Bot className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-display font-semibold text-fg leading-tight">
                  {title}
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-fg-muted font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500 animate-pulse" />
                  <span>Document Knowledge Base</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                aria-label="Restart conversation"
                className="grid size-8 place-items-center rounded-lg text-fg-muted transition-all hover:bg-surface-raised hover:text-fg active:scale-95 cursor-pointer"
              >
                <RotateCcw className="size-3.5" />
              </button>
              {!embedded && (
                <button
                  type="button"
                  onClick={() => setIsMaximized(!isMaximized)}
                  title={isMaximized ? 'Minimize chat' : 'Maximize chat'}
                  aria-label={isMaximized ? 'Minimize chat' : 'Maximize chat'}
                  className="grid size-8 place-items-center rounded-lg text-fg-muted transition-all hover:bg-surface-raised hover:text-fg active:scale-95 cursor-pointer"
                >
                  {isMaximized ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
              )}
              {/* Single clean close button */}
              {!embedded && (
                <button
                  type="button"
                  onClick={handleClose}
                  title="Close chat (Esc)"
                  aria-label="Close chat"
                  className="grid size-8 place-items-center rounded-lg text-fg-muted transition-all hover:bg-surface-raised hover:text-fg active:scale-95 cursor-pointer"
                >
                  <X className="size-4.5" />
                </button>
              )}
            </div>
          </div>

          {/* Cooldown / Limit Banner */}
          {cooldown !== null && (
            <div className="flex items-center gap-2 border-b border-warning/30 bg-warning-wash/70 px-3.5 py-2 text-xs text-warning-strong">
              <Clock className="size-3.5 shrink-0 animate-spin" />
              <span>
                Rate limit reached. Please wait{' '}
                <strong className="font-mono">{cooldown}s</strong> before asking again.
              </span>
            </div>
          )}

          {blocked && blocked.reason === 'QUOTA_EXCEEDED' && (
            <div className="flex items-center gap-2 border-b border-error/30 bg-error-wash/70 px-3.5 py-2 text-xs text-error">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>Daily question quota reached. Please check back tomorrow.</span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-bg-base/40 text-xs">
            {/* Grounded AI purpose notice card */}
            <div className="rounded-xl border border-accent/20 bg-accent-wash/60 p-3 text-xs backdrop-blur-xs">
              <div className="flex items-center gap-2 font-medium text-accent">
                <Sparkles className="size-3.5 text-accent shrink-0" />
                <span>Knowledge Base Assistant</span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-fg-muted">
                Answers are strictly generated from this site's uploaded documentation and verified PDFs.
                Not a general web AI.
              </p>
            </div>

            {messages.map((msg) => {
              const isBot = msg.role === 'assistant'
              const isStreaming = msg.status === 'streaming'
              const hasText = msg.content.trim().length > 0

              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col gap-1.5', isBot ? 'items-start' : 'items-end')}
                >
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-3 leading-relaxed text-sm shadow-xs',
                      isMaximized ? 'max-w-[95%] lg:max-w-[800px]' : 'max-w-[88%]',
                      isBot
                        ? 'rounded-tl-xs border border-line bg-surface text-fg backdrop-blur-xs'
                        : 'rounded-tr-xs bg-accent text-on-accent font-medium shadow-xs',
                    )}
                  >
                    {isBot ? (
                      <div className="w-full min-w-0">
                        {hasText ? (
                          <div className="prose-chat text-fg break-words">
                            <Markdown content={msg.content} />
                            {isStreaming && <StreamingCursor />}
                          </div>
                        ) : (
                          isStreaming && (
                            <div className="flex items-center gap-2 text-xs text-accent py-1">
                              <TypingIndicator />
                              <span>Searching verified documents…</span>
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                    )}
                  </div>

                  <span className="text-[10px] text-fg-muted px-1">{msg.timestamp}</span>
                </div>
              )
            })}

            {/* Suggestions Chips (shown before first user interaction) */}
            {messages.length === 1 && suggestions && suggestions.length > 0 && !blocked && (
              <div className="pt-2 space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                  Suggested questions about this site:
                </span>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((q: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => void handleSend(q)}
                      disabled={loading}
                      className="group flex items-center justify-between rounded-xl border border-line bg-surface px-3.5 py-2.5 text-left text-xs text-fg-secondary transition-all hover:border-accent/40 hover:bg-surface-raised hover:text-fg disabled:opacity-50 active:scale-[0.99] cursor-pointer shadow-2xs"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <ChevronRight className="size-3.5 text-fg-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSend()
            }}
            className="border-t border-line bg-surface-raised/90 p-3.5 backdrop-blur-md"
          >
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-1.5 transition-all focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-ring">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={blocked ? blocked.message : placeholder}
                maxLength={maxQueryLength}
                disabled={loading || Boolean(blocked)}
                className="flex-1 bg-transparent py-1.5 text-xs text-fg placeholder:text-fg-muted focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || Boolean(blocked)}
                aria-label="Send question"
                className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent font-bold shadow-xs transition-all hover:bg-accent-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
              >
                <Send className="size-3.5" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1 text-[10px] text-fg-muted">
              {showBranding ? (
                <div className="flex items-center gap-1">
                  <span>Powered by</span>
                  <span className="inline-flex items-center gap-0.5 font-semibold text-fg">
                    <Sparkles className="size-2.5 text-accent" />
                    DocMind
                  </span>
                  <span className="text-fg-muted">·</span>
                  <span>Grounded Docs</span>
                </div>
              ) : (
                <span />
              )}
              {input.length > 0 && (
                <span className="font-mono text-fg-muted">
                  {input.length}/{maxQueryLength}
                </span>
              )}
            </div>

            {footerNote && (
              <p className="mt-1 text-center text-[10px] text-fg-muted truncate">{footerNote}</p>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
