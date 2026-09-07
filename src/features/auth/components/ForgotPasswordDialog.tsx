import { useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogTrigger } from '@/components/ui/Dialog'
import { Button } from '@/components/ui'

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded text-sm font-medium text-accent underline decoration-accent/40 underline-offset-4 transition-colors hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)"
        >
          Forgot password?
        </button>
      </DialogTrigger>

      <DialogContent
        size="sm"
        title="Password recovery"
        description="Self-service reset is not available yet."
        footer={
          <DialogClose asChild>
            <Button variant="secondary" fullWidth className="sm:w-auto">
              Got it
            </Button>
          </DialogClose>
        }
      >
        <p className="text-sm text-fg-secondary">
          This deployment has no password-reset email flow. Ask a workspace administrator to set a
          new password for you — they can do it directly against the account record.
        </p>
      </DialogContent>
    </Dialog>
  )
}
