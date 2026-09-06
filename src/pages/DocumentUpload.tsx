import { useNavigate } from 'react-router'
import { Dialog, DialogContent } from '@/components/ui'
import { UploadPanel } from '@/features/documents/components'
import { useDocumentTitle } from '@/hooks'
import { formatBytes } from '@/lib/utils'
import { MAX_UPLOAD_BYTES } from '@/lib/constants'

/**
 * `/app/documents/upload` — a modal route.
 *
 * On a URL rather than in component state so that "upload" is linkable, shows up
 * in history, and can be reached from the command palette and the empty state
 * without those two places each owning a copy of the dialog. Closing it returns
 * to the list, which is rendered underneath by the parent route.
 */
export default function DocumentUploadPage() {
  useDocumentTitle('Upload a document')
  const navigate = useNavigate()

  const close = () => {
    void navigate('/app/documents')
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close()
      }}
    >
      <DialogContent
        title="Upload a document"
        description={`PDF, up to ${formatBytes(MAX_UPLOAD_BYTES)}. Text is extracted, split into passages and embedded so answers can cite it.`}
      >
        <UploadPanel onDone={close} />
      </DialogContent>
    </Dialog>
  )
}
