import { AlertTriangle, Check, Copy, KeyRound, ShieldAlert } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  Alert,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Input,
  Label,
  RadioGroup,
  Textarea,
  type RadioOption,
} from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import {
  API_KEY_NAME_MAX,
  PUBLIC_DEFAULT_DAILY_QUOTA,
  PUBLIC_DEFAULT_RATE_PER_MINUTE,
  PUBLIC_MAX_ORIGINS,
} from '@/lib/constants'
import { useCreateApiKey } from '../hooks/useApiKeys'
import type { ApiKeyDefaults, CreateApiKeyResult } from '@/lib/api'

interface ApiKeyCreateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaults?: ApiKeyDefaults
  availableScopes?: string[]
}

export function ApiKeyCreateModal({
  open,
  onOpenChange,
  defaults,
  availableScopes = ['chat:query', 'chat:config', 'chat:filter', 'documents:read', 'documents:write'],
}: ApiKeyCreateModalProps) {
  const createMutation = useCreateApiKey()
  const { copy, copied } = useCopyToClipboard()

  const [createdResult, setCreatedResult] = useState<CreateApiKeyResult | null>(null)

  // Form fields
  const [name, setName] = useState('')
  const [type, setType] = useState<'public' | 'secret'>('public')
  const [scopes, setScopes] = useState<string[]>(['chat:query', 'chat:config'])
  const [originsText, setOriginsText] = useState('')
  const [rateLimit, setRateLimit] = useState<number | ''>(
    defaults?.ratePerMinute ?? PUBLIC_DEFAULT_RATE_PER_MINUTE,
  )
  const [dailyQuota, setDailyQuota] = useState<number | ''>(
    defaults?.dailyQuota ?? PUBLIC_DEFAULT_DAILY_QUOTA,
  )

  const resetForm = () => {
    setName('')
    setType('public')
    setScopes(['chat:query', 'chat:config'])
    setOriginsText('')
    setRateLimit(defaults?.ratePerMinute ?? PUBLIC_DEFAULT_RATE_PER_MINUTE)
    setDailyQuota(defaults?.dailyQuota ?? PUBLIC_DEFAULT_DAILY_QUOTA)
    setCreatedResult(null)
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) resetForm()
    onOpenChange(nextOpen)
  }

  const toggleScope = (scope: string) => {
    if (scopes.includes(scope)) {
      setScopes(scopes.filter((s) => s !== scope))
    } else {
      setScopes([...scopes, scope])
    }
  }

  const handleTypeChange = (newType: 'public' | 'secret') => {
    setType(newType)
    if (newType === 'public') {
      // Remove any document scopes
      setScopes((prev) => prev.filter((s) => !s.startsWith('documents:')))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const allowedOrigins = originsText
      .split(/[\n,]/)
      .map((o) => o.trim())
      .filter(Boolean)

    createMutation.mutate(
      {
        name: name.trim(),
        type,
        scopes,
        allowedOrigins,
        rateLimitPerMinute: rateLimit === '' ? null : Number(rateLimit),
        dailyQuota: dailyQuota === '' ? null : Number(dailyQuota),
      },
      {
        onSuccess: (data) => {
          setCreatedResult(data)
          toast.success('API key created')
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to create API key')
        },
      },
    )
  }

  const TYPE_OPTIONS: RadioOption[] = [
    {
      value: 'public',
      label: 'Public Key (pk_live_...)',
      hint: "Designed for your website's frontend. Protected by origin allowlisting and daily quotas.",
    },
    {
      value: 'secret',
      label: 'Secret Key (sk_live_...)',
      hint: 'For server-to-server integrations. Exempt from origin checks. Never ship to a browser bundle.',
    },
  ]

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        title={createdResult ? 'Store Your API Key' : 'Create API Key'}
        description={
          createdResult
            ? 'This is the only time the plaintext key will ever be displayed. Store it securely now.'
            : 'Mint an API key to embed the chat widget or access the API programmatically.'
        }
        size="lg"
      >
        {createdResult ? (
          <div className="flex flex-col gap-5 py-2">
            <Alert
              tone="warning"
              icon={<AlertTriangle className="size-5 text-warning" />}
              title="Save this key now — it cannot be recovered"
            >
              For security, only the SHA-256 hash is stored on our servers. If you lose this key,
              you will have to rotate it or create a new one.
            </Alert>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="revealed-api-key">Plaintext API Key</Label>
              <div className="flex items-center gap-2">
                <input
                  id="revealed-api-key"
                  readOnly
                  value={createdResult.key}
                  className="min-w-0 flex-1 rounded-md border border-line bg-surface-raised px-3 py-2.5 font-mono text-xs text-fg focus-visible:outline-2 focus-visible:outline-(--border-focus)"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <IconButton
                  label={copied ? 'Copied' : 'Copy API key'}
                  icon={copied ? <Check /> : <Copy />}
                  onClick={() => {
                    void copy(createdResult.key).then((ok) => {
                      if (ok) toast.success('API key copied to clipboard')
                    })
                  }}
                />
              </div>
            </div>

            <div className="rounded-lg border border-line bg-surface-raised/40 p-4">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-fg-muted">Name</dt>
                  <dd className="font-medium text-fg">{createdResult.apiKey.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Type</dt>
                  <dd className="font-medium text-fg uppercase">{createdResult.apiKey.type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Prefix</dt>
                  <dd className="font-mono text-xs text-fg">{createdResult.apiKey.keyPrefix}</dd>
                </div>
                <div>
                  <dt className="text-xs text-fg-muted">Allowed Origins</dt>
                  <dd className="text-fg">
                    {createdResult.apiKey.unrestricted
                      ? 'Unrestricted (Any)'
                      : `${createdResult.apiKey.allowedOrigins.length} origins`}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleClose(false)}>I have stored this key</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
            {/* Key Name */}
            <Input
              id="key-name"
              label="Key Name"
              required
              maxLength={API_KEY_NAME_MAX}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Marketing Website Widget"
              hint="A human label to help you identify where this key is deployed."
            />

            {/* Key Type */}
            <RadioGroup
              label="Key Type"
              variant="card"
              options={TYPE_OPTIONS}
              value={type}
              onValueChange={(val) => handleTypeChange(val as 'public' | 'secret')}
            />

            {/* Allowed Origins */}
            {type === 'public' && (
              <div className="flex flex-col gap-1.5">
                <Textarea
                  id="allowed-origins"
                  label={`Allowed Origins (Max ${PUBLIC_MAX_ORIGINS})`}
                  rows={3}
                  value={originsText}
                  onChange={(e) => setOriginsText(e.target.value)}
                  placeholder={'https://acme.com\nhttps://www.acme.com\nhttp://localhost:5173'}
                  className="font-mono text-xs"
                  hint={
                    !originsText.trim()
                      ? 'Empty allows calls from ANY website or tool (unrestricted).'
                      : 'One origin per line. Must include scheme (e.g. https://).'
                  }
                />
                {!originsText.trim() && (
                  <p className="flex items-center gap-1.5 text-xs text-warning">
                    <ShieldAlert className="size-3.5 shrink-0" />
                    Leaving this empty allows requests from ANY website (unrestricted).
                  </p>
                )}
              </div>
            )}

            {/* Scopes */}
            <div className="flex flex-col gap-2">
              <Label>Granted Scopes</Label>
              <div className="flex flex-wrap gap-2">
                {availableScopes.map((scope) => {
                  const isDocumentScope = scope.startsWith('documents:')
                  const disabled = type === 'public' && isDocumentScope
                  const selected = scopes.includes(scope)

                  return (
                    <button
                      key={scope}
                      type="button"
                      disabled={disabled}
                      onClick={() => toggleScope(scope)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-mono transition-colors ${
                        disabled
                          ? 'cursor-not-allowed border border-line bg-surface-raised opacity-40 text-fg-disabled'
                          : selected
                            ? 'border border-accent bg-accent text-on-accent'
                            : 'border border-line bg-surface text-fg-secondary hover:border-line-strong hover:text-fg'
                      }`}
                    >
                      {scope}
                    </button>
                  )
                })}
              </div>
              {type === 'public' && (
                <span className="text-xs text-fg-muted">
                  Public keys can only hold chat scopes (document scopes require a secret key).
                </span>
              )}
            </div>

            {/* Limits & Quotas */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="rate-limit"
                label="Rate Limit (per min)"
                type="number"
                min={1}
                max={6000}
                value={rateLimit}
                onChange={(e) =>
                  setRateLimit(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="30"
                hint="Messages allowed per minute."
              />

              <Input
                id="daily-quota"
                label="Daily Quota (per day)"
                type="number"
                min={1}
                max={1000000}
                value={dailyQuota}
                onChange={(e) =>
                  setDailyQuota(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="500"
                hint="Resets daily at 00:00 UTC."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleClose(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createMutation.isPending}
                disabled={!name.trim() || scopes.length === 0}
                leftIcon={<KeyRound />}
              >
                Mint API Key
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
