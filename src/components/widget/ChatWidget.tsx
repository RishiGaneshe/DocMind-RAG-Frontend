import {
  Bot,
  ChevronRight,
  FileText,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { sendPublicChat, type PublicChatResult, type WidgetConfig } from '@/lib/api'
import { cn } from '@/lib/utils'

export interface ChatWidgetProps {
  config?: Partial<WidgetConfig>
  mode?: 'preview' | 'live'
  apiKey?: string
  initiallyOpen?: boolean
  className?: string
  embedded?: boolean
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: Array<{
    title: string
    page?: number | null
    breadcrumb?: string | null
    score?: number
    snippet?: string
  }>
  timestamp: string
}

export function ChatWidget({
  config = {},
  mode = 'preview',
  apiKey,
  initiallyOpen = false,
  className,
  embedded = false,
}: ChatWidgetProps) {
  const {
    title = 'DocMind AI',
    greeting = 'Hello! Ask me anything about our documents and services.',
    placeholder = 'Ask a question...',
    accentColor = '#4E77B8',
    position = 'right',
    sourceMode = 'labels',
    showBranding = true,
    footerNote = '',
    suggestions = [
      'What are the key features?',
      'How does pricing work?',
      'How do I get started?',
    ],
  } = config

  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting',
      role: 'assistant',
      content: greeting,
      timestamp: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(() => `sess_${Math.random().toString(36).substring(2, 9)}`)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'greeting') {
        return [{ id: 'greeting', role: 'assistant', content: greeting, timestamp: 'Just now' }]
      }
      return prev
    })
  }, [greeting])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (textToSend?: string) => {
    const messageText = (textToSend ?? input).trim()
    if (!messageText || loading) return

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: 'Just now',
    }

    const priorHistory = messages
      .filter((m) => m.id !== 'greeting' && m.content.trim().length > 0)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 1000),
      }))

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInput('')
    setLoading(true)

    if (mode === 'live' && apiKey) {
      try {
        const result: PublicChatResult = await sendPublicChat(apiKey, {
          query: messageText.slice(0, 1000),
          sessionId,
          history: priorHistory,
        })

        const assistantMessage: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: result.answer,
          sources: result.sources.map((s) => ({
            title: s.filename || 'Source Document',
            page: s.page,
            breadcrumb: s.breadcrumb,
            score: s.relevanceScore,
            snippet: s.snippet,
          })),
          timestamp: 'Just now',
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch (err: unknown) {
        const error = err as Error
        const errorMessage: ChatMessage = {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: error.message || 'Sorry, I encountered an error answering your question.',
          timestamp: 'Just now',
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setLoading(false)
      }
    } else {
      setTimeout(() => {
        const reply: ChatMessage = {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: `This is a preview response simulating grounded RAG generation for: "${messageText}". When deployed to your live website, answers are synthesized directly from your indexed PDFs and markdown files with exact citations.`,
          sources: [
            {
              title: 'User_Manual_v2.pdf',
              page: 4,
              breadcrumb: 'System Architecture > Retrieval Pipeline',
              score: 0.94,
              snippet:
                'Embeddings are indexed into pgvector with cosine distance matching and re-ranked before context injection.',
            },
            {
              title: 'Getting_Started.md',
              page: 1,
              breadcrumb: 'Installation > Widget Setup',
              score: 0.88,
              snippet:
                'Embed the script tag into your HTML body to initiate customer document search.',
            },
          ],
          timestamp: 'Just now',
        }
        setMessages((prev) => [...prev, reply])
        setLoading(false)
      }, 700)
    }
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: 'greeting',
        role: 'assistant',
        content: greeting,
        timestamp: 'Just now',
      },
    ])
  }

  return (
    <div
      className={cn(
        embedded ? 'relative h-full w-full' : 'fixed z-50',
        !embedded && (position === 'left' ? 'bottom-5 left-5' : 'bottom-5 right-5'),
        className,
      )}
      style={{ '--widget-accent': accentColor } as React.CSSProperties}
    >
      {!embedded && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? 'Close chat widget' : 'Open chat widget'}
          style={{ backgroundColor: accentColor }}
          className={cn(
            'group relative flex size-14 items-center justify-center rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2',
            position === 'left' ? 'mr-auto' : 'ml-auto',
          )}
        >
          {isOpen ? (
            <X className="size-6 text-white transition-transform group-hover:rotate-90" />
          ) : (
            <MessageSquare className="size-6 text-white" />
          )}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex size-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex size-3.5 rounded-full border-2 border-surface bg-sky-500" />
            </span>
          )}
        </button>
      )}

      {(isOpen || embedded) && (
        <div
          className={cn(
            'flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl transition-all',
            embedded
              ? 'h-full w-full border-0 shadow-none'
              : cn(
                  'mb-3 w-[calc(100vw-2.5rem)] sm:w-[380px] h-[520px]',
                  position === 'left' ? 'origin-bottom-left' : 'origin-bottom-right',
                ),
          )}
        >
          <div
            style={{ backgroundColor: accentColor }}
            className="relative flex items-center justify-between px-4 py-3 text-white"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-xs">
                <Bot className="size-4.5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold leading-tight">{title}</h3>
                <div className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  <span>Knowledge Base AI</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                className="grid size-7 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                <RotateCcw className="size-3.5" />
              </button>
              {!embedded && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close widget"
                  className="grid size-7 place-items-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-bg/40 text-xs">
            {messages.map((msg) => {
              const isBot = msg.role === 'assistant'

              return (
                <div
                  key={msg.id}
                  className={cn('flex flex-col gap-1.5', isBot ? 'items-start' : 'items-end')}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-sm shadow-xs',
                      isBot
                        ? 'rounded-tl-xs border border-line bg-surface-raised text-fg'
                        : 'rounded-tr-xs text-white',
                    )}
                    style={!isBot ? { backgroundColor: accentColor } : undefined}
                  >
                    {msg.content}
                  </div>

                  {isBot && msg.sources && msg.sources.length > 0 && sourceMode !== 'hidden' && (
                    <div className="w-full max-w-[90%] space-y-1 pt-1">
                      {sourceMode === 'labels' ? (
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((src, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 rounded-md border border-line bg-surface-raised/70 px-2 py-0.5 text-[10px] text-fg-secondary"
                            >
                              <FileText className="size-2.5 text-fg-muted" />
                              <span className="truncate max-w-[120px]">{src.title}</span>
                              {src.page && <span className="text-fg-muted">p.{src.page}</span>}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-muted">
                            Sources ({msg.sources.length})
                          </span>
                          <div className="grid gap-1.5">
                            {msg.sources.map((src, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-line bg-surface p-2 text-left"
                              >
                                <div className="flex items-center justify-between text-[11px] font-medium text-fg">
                                  <span className="flex items-center gap-1 truncate">
                                    <FileText className="size-3 text-accent shrink-0" />
                                    <span className="truncate">{src.title}</span>
                                  </span>
                                  {src.page && (
                                    <span className="text-fg-muted shrink-0 text-[10px]">
                                      p. {src.page}
                                    </span>
                                  )}
                                </div>
                                {src.breadcrumb && (
                                  <p className="mt-0.5 text-[10px] text-fg-muted truncate">
                                    {src.breadcrumb}
                                  </p>
                                )}
                                {src.snippet && (
                                  <p className="mt-1 line-clamp-2 text-[10px] text-fg-secondary italic">
                                    "{src.snippet}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <span className="text-[10px] text-fg-muted px-1">{msg.timestamp}</span>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs border border-line bg-surface-raised px-3.5 py-2.5 text-fg w-fit">
                <span className="size-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-fg-muted [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-fg-muted" />
              </div>
            )}

            {messages.length === 1 && suggestions && suggestions.length > 0 && (
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-medium text-fg-muted">Suggested questions:</span>
                <div className="flex flex-col gap-1.5">
                  {suggestions.map((q: string, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => void handleSend(q)}
                      className="group flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-left text-xs text-fg-secondary transition-colors hover:border-line-strong hover:bg-surface-raised hover:text-fg"
                    >
                      <span className="line-clamp-1">{q}</span>
                      <ChevronRight className="size-3 text-fg-muted transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSend()
            }}
            className="border-t border-line bg-surface p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                maxLength={1000}
                disabled={loading}
                className="flex-1 rounded-lg border border-line bg-surface-raised px-3 py-2 text-xs text-fg placeholder:text-fg-disabled focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--border-focus) disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{ backgroundColor: accentColor }}
                aria-label="Send message"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg text-white shadow-xs transition-opacity hover:opacity-90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>

            {footerNote && (
              <p className="mt-1.5 text-center text-[10px] text-fg-muted truncate">{footerNote}</p>
            )}
            {showBranding && (
              <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-fg-muted">
                <span>Powered by</span>
                <span className="inline-flex items-center gap-0.5 font-semibold text-fg">
                  <Sparkles className="size-2.5 text-accent" />
                  DocMind
                </span>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
