import { Copy, Ellipsis, MessageSquare, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@/components/ui'
import { seedComposer } from '@/features/chat/store'
import type { DocumentRecord } from '@/lib/api'
import { useCopyToClipboard } from '@/hooks'
import { stripExtension } from '@/lib/utils'

/**
 * Row actions.
 *
 * Delete is present and disabled on purpose. The backend exposes no
 * `DELETE /api/tenants/:id/documents/:documentId` (§22 item 4), and silently
 * omitting the action would leave people hunting for it — an explicit
 * "not available yet", with the reason, is the honest version. Nothing here
 * pretends to do something it cannot.
 */
export function DocumentActions({ document }: { document: DocumentRecord }) {
  const navigate = useNavigate()
  const { copy } = useCopyToClipboard()

  return (
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

        <DropdownMenuItem disabled tone="danger" shortcut="Unavailable">
          <Trash2 aria-hidden="true" />
          Delete
        </DropdownMenuItem>
        <p className="px-2 pt-0.5 pb-1 text-xs text-fg-muted">
          The API has no delete route yet, so nothing here can remove a document.
        </p>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
