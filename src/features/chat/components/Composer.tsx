import { ArrowUp, Square, WifiOff } from 'lucide-react'
import { useId } from 'react'
import { Alert, Button, IconButton, Tooltip } from '@/components/ui'
import { useAutosizeTextarea, useOnline } from '@/hooks'
import { MAX_QUERY_CHARS, QUERY_WARN_RATIO } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { RetrievalSettings } from './RetrievalSettings'

interface ComposerProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (value: string) => void
  onStop: () => void
  isStreaming: boolean
  ready?: boolean
  autoFocus?: boolean
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  isStreaming,
  ready = true,
  autoFocus = false,
}: ComposerProps) {
  const fieldId = useId()
  const hintId = `${fieldId}-hint`
  const counterId = `${fieldId}-counter`
  const online = useOnline()
  const ref = useAutosizeTextarea(value, { minRows: 1, maxRows: 8 })

  const length = value.length
  const ratio = length / MAX_QUERY_CHARS
  const warn = ratio >= QUERY_WARN_RATIO
  const over = length > MAX_QUERY_CHARS
  const canSend = Boolean(value.trim()) && !over && !isStreaming && ready && online

  const submit = () => {
    if (!canSend) return
    onSubmit(value)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
      return
    }
    if (event.key === 'Escape' && isStreaming) {
      event.preventDefault()
      onStop()
    }
  }

  return (
    <div className="shrink-0 border-t border-line bg-surface-glass px-4 pt-3 pb-4 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
        {!online && (
          <Alert tone="warning" icon={<WifiOff className="size-4" />}>
            You are offline. Your question will send once the connection is back.
          </Alert>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault()
            submit()
          }}
        >
          <label htmlFor={fieldId} className="sr-only">
            Ask a question about your documents
          </label>

          <div
            className={cn(
              'rounded-2xl border bg-surface px-3 pt-2.5 pb-2 shadow-sm transition-colors duration-(--dur-fast)',
              'focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/15',
              over ? 'border-error' : 'border-line hover:border-line-strong',
            )}
          >
            <textarea
              ref={ref}
              id={fieldId}
              autoFocus={autoFocus}
              rows={1}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                ready ? 'Ask anything about your documents…' : 'Create a workspace to start asking…'
              }
              disabled={!ready}
              aria-describedby={`${hintId} ${counterId}`}
              aria-invalid={over || undefined}
              className={cn(
                'block w-full resize-none bg-transparent text-base leading-relaxed text-fg',
                'outline-hidden placeholder:text-fg-disabled disabled:cursor-not-allowed disabled:text-fg-disabled',
              )}
            />

            <div className="mt-1.5 flex items-end justify-between gap-2">
              <p id={hintId} className="hidden text-xs text-fg-muted sm:block">
                <kbd className="font-sans font-medium">Enter</kbd> to send ·{' '}
                <kbd className="font-sans font-medium">Shift</kbd> +{' '}
                <kbd className="font-sans font-medium">Enter</kbd> for a new line
              </p>

              <div className="flex items-center gap-1">
                <p
                  id={counterId}
                  aria-live={warn ? 'polite' : 'off'}
                  className={cn(
                    'mr-1 font-mono text-xs tabular-nums',
                    over ? 'text-error' : warn ? 'text-warning' : 'text-fg-muted',
                    !warn && 'hidden sm:block',
                  )}
                >
                  {length.toLocaleString()} / {MAX_QUERY_CHARS.toLocaleString()}
                </p>

                <RetrievalSettings disabled={!ready} />

                {isStreaming ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    leftIcon={<Square className="fill-current" />}
                    onClick={onStop}
                  >
                    Stop
                  </Button>
                ) : (
                  <Tooltip content="Send" shortcut="Enter">
                    <IconButton
                      type="submit"
                      label="Send question"
                      icon={<ArrowUp />}
                      size="sm"
                      variant="primary"
                      disabled={!canSend}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </form>

        {over && (
          <p role="alert" className="text-xs text-error">
            That question is {(length - MAX_QUERY_CHARS).toLocaleString()} characters over the{' '}
            {MAX_QUERY_CHARS.toLocaleString()} limit the API accepts. Trim it and send again.
          </p>
        )}
      </div>
    </div>
  )
}
