import { Check, Copy, Eye, EyeOff, KeyRound } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Alert, Button, IconButton, Label } from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'

function mask(key: string): string {
  if (key.length <= 12) return '•'.repeat(key.length)
  return `${key.slice(0, 4)}${'•'.repeat(Math.min(24, key.length - 8))}${key.slice(-4)}`
}

export function ApiKeyField({ apiKey }: { apiKey: string }) {
  const [shown, setShown] = useState(false)
  const { copy, copied } = useCopyToClipboard()

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="workspace-api-key">Workspace API key</Label>

      <div className="flex items-center gap-2">
        {/* Read-only rather than plain text: it is selectable, announced as a
            field, and cannot be edited into something that looks valid. */}
        <input
          id="workspace-api-key"
          readOnly
          value={shown ? apiKey : mask(apiKey)}
          aria-label="Workspace API key"
          spellCheck={false}
          onFocus={(event) => event.currentTarget.select()}
          className="min-w-0 flex-1 rounded-md border border-line bg-surface-raised px-3 py-2.5 font-mono text-xs text-fg focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-(--border-focus)"
        />
        <IconButton
          label={shown ? 'Hide API key' : 'Show API key'}
          icon={shown ? <EyeOff /> : <Eye />}
          onClick={() => setShown((value) => !value)}
        />
        <IconButton
          label={copied ? 'Copied' : 'Copy API key'}
          icon={copied ? <Check /> : <Copy />}
          onClick={() => {
            void copy(apiKey).then((ok) => {
              if (ok) toast.success('API key copied')
              else toast.error('Could not copy the key. Reveal it and copy manually.')
            })
          }}
        />
      </div>

      <p aria-live="polite" className="text-xs text-fg-muted">
        {shown ? 'Visible — hide it before sharing your screen.' : 'Hidden. Copy works either way.'}
      </p>
    </div>
  )
}

/**
 * Shown when the key is missing from the response, and alongside it always: the
 * API has no rotate or revoke route, so the only honest guidance is "treat it
 * like a password".
 */
export function ApiKeyNotice() {
  return (
    <Alert tone="warning" icon={<KeyRound className="size-4" />} title="This key cannot be rotated">
      There is no endpoint to regenerate or revoke a workspace key, so if it leaks the only remedy
      is a new workspace. Keep it server-side; never ship it in a browser bundle.
    </Alert>
  )
}

export function ApiKeyUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert
      tone="info"
      title="The key is not in this response"
      action={
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      }
    >
      <code className="font-mono text-xs">GET /api/tenants/me</code> returns it — reload to fetch a
      fresh copy.
    </Alert>
  )
}
