import { AlertTriangle, Check, Copy, RefreshCw } from 'lucide-react'
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
} from '@/components/ui'
import { useCopyToClipboard } from '@/hooks'
import { DEFAULT_ROTATION_GRACE_HOURS, MAX_ROTATION_GRACE_HOURS } from '@/lib/constants'
import { useRotateApiKey } from '../hooks/useApiKeys'
import type { ApiKey, RotateApiKeyResult } from '@/lib/api'

interface ApiKeyRotateModalProps {
  apiKey: ApiKey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApiKeyRotateModal({ apiKey, open, onOpenChange }: ApiKeyRotateModalProps) {
  const rotateMutation = useRotateApiKey()
  const { copy, copied } = useCopyToClipboard()

  const [graceHours, setGraceHours] = useState<number>(DEFAULT_ROTATION_GRACE_HOURS)
  const [result, setResult] = useState<RotateApiKeyResult | null>(null)

  const reset = () => {
    setGraceHours(DEFAULT_ROTATION_GRACE_HOURS)
    setResult(null)
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const handleRotate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKey) return

    rotateMutation.mutate(
      { keyId: apiKey.id, graceHours: Number(graceHours) },
      {
        onSuccess: (data) => {
          setResult(data)
          toast.success('API key rotated successfully')
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to rotate API key')
        },
      },
    )
  }

  if (!apiKey) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        title={result ? 'New API Key Generated' : `Rotate "${apiKey.name}"`}
        description={
          result
            ? 'Deploy the new key to your website before the old key expires.'
            : 'Generate a replacement key with a grace period for zero-downtime rotation.'
        }
      >
        {result ? (
          <div className="flex flex-col gap-4 py-2">
            <Alert
              tone="warning"
              icon={<AlertTriangle className="size-5 text-warning" />}
              title="Store your new key now"
            >
              This is the only time the new key will be shown. The previous key will expire in{' '}
              <strong>{graceHours} hours</strong>.
            </Alert>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-rotated-key">New API Key</Label>
              <div className="flex items-center gap-2">
                <input
                  id="new-rotated-key"
                  readOnly
                  value={result.key}
                  className="min-w-0 flex-1 rounded-md border border-line bg-surface-raised px-3 py-2.5 font-mono text-xs text-fg focus-visible:outline-2 focus-visible:outline-(--border-focus)"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <IconButton
                  label={copied ? 'Copied' : 'Copy API key'}
                  icon={copied ? <Check /> : <Copy />}
                  onClick={() => {
                    void copy(result.key).then((ok) => {
                      if (ok) toast.success('New API key copied')
                    })
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleClose(false)}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRotate} className="flex flex-col gap-5 py-2">
            <Alert tone="info" title="Zero-Downtime Rotation">
              A replacement key row is generated inheriting all scopes and allowed origins. The old
              key remains valid during the grace period so your current site stays online until you
              redeploy.
            </Alert>

            <Input
              id="grace-hours"
              label="Grace Period (Hours)"
              type="number"
              min={0}
              max={MAX_ROTATION_GRACE_HOURS}
              value={graceHours}
              onChange={(e) => setGraceHours(Number(e.target.value))}
              required
              hint="Set to 0 to revoke the old key immediately (use in case of suspected leak). Default is 24 hours."
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleClose(false)}
                disabled={rotateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={rotateMutation.isPending}
                leftIcon={<RefreshCw />}
              >
                Rotate Key
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
