import { useNavigate } from 'react-router'
import { Dialog, DialogContent } from '@/components/ui'
import { UploadPanel } from '@/features/documents/components'
import { useDocumentTitle } from '@/hooks'
import { formatBytes } from '@/lib/utils'
import { MAX_UPLOAD_BYTES } from '@/lib/constants'

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
