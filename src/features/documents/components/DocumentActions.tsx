import { Copy, Ellipsis, MessageSquare, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Button,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@/components/ui'
import { seedComposer } from '@/features/chat/store'
import { useDeleteDocument } from '@/features/documents/hooks/useDeleteDocument'
import { useCopyToClipboard } from '@/hooks'
import type { DocumentRecord } from '@/lib/api'
import { stripExtension } from '@/lib/utils'

export function DocumentActions({ document }: { document: DocumentRecord }) {
  const navigate = useNavigate()
  const { copy } = useCopyToClipboard()
  const deleteMutation = useDeleteDocument()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isBusy = document.status === 'PENDING' || document.status === 'PROCESSING'

  const handleDelete = () => {
    deleteMutation.mutate(document.id, {
      onSuccess: () => setConfirmOpen(false),
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton label={`Actions for ${document.filename}`} icon={<Ellipsis />} size="sm" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            disabled={document.status !== 'COMPLETED'}
            onSelect={() => {
              seedComposer(`Summarise ${stripExtension(document.filename)}`)
              void navigate('/app')
            }}
          >
            <MessageSquare aria-hidden="true" />
            Ask about this document
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              void copy(document.id).then((ok) => {
                if (ok) toast.success('Document ID copied')
              })
            }}
          >
            <Copy aria-hidden="true" />
            Copy document ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isBusy}
            tone="danger"
            onSelect={() => setConfirmOpen(true)}
          >
            <Trash2 aria-hidden="true" />
            {isBusy ? 'Processing…' : 'Delete document'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          title="Delete document?"
          description={`Are you sure you want to delete "${document.filename}"? This will permanently remove its vector embeddings and text passages from your workspace.`}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setConfirmOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm text-fg-muted">
            Any questions answered in the future will no longer be able to reference or cite this document.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}
