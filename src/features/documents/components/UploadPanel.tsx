import { CircleCheck, FileText, TriangleAlert, Upload, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { Alert, Button, IconButton, Progress } from '@/components/ui'
import { seedComposer } from '@/features/chat/store'
import { ACCEPTED_UPLOAD_EXT, ACCEPTED_UPLOAD_MIME, MAX_UPLOAD_BYTES } from '@/lib/constants'
import { cn, formatBytes, formatNumber, stripExtension } from '@/lib/utils'
import { useUploadDocument, validateFile } from '../hooks/useUploadDocument'

interface UploadPanelProps {
  onDone?: () => void
}

export function UploadPanel({ onDone }: UploadPanelProps) {
  const input = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [rejected, setRejected] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const { upload, progress, isUploading, result, error, cancel, reset } = useUploadDocument()

  const choose = (next: File | undefined) => {
    if (!next) return
    const problem = validateFile(next)
    setRejected(problem)
    setFile(problem ? null : next)
  }

  const startOver = () => {
    setFile(null)
    setRejected(null)
    reset()
    input.current?.focus()
  }

  if (result) {
    const filename = result.filename || result.document?.filename || file?.name || 'Document'
    const question = `Summarise ${stripExtension(filename)}`
    const isDuplicate = Boolean(result.duplicate)
    const isQueued = result.status === 'PENDING' || result.status === 'PROCESSING'
    const skipped = (result.chunksSkipped ?? 0) > 0

    return (
      <div className="flex flex-col gap-4">
        {isDuplicate ? (
          <Alert
            tone="info"
            icon={<CircleCheck className="size-4" />}
            title="Already uploaded and indexed"
          >
            <p>
              <span className="font-medium text-fg">{filename}</span> has already been indexed in your
              workspace. Its vector passages are ready to answer questions.
            </p>
          </Alert>
        ) : isQueued ? (
          <Alert
            tone="info"
            icon={<CircleCheck className="size-4" />}
            title="Upload accepted — processing queued"
          >
            <p>
              <span className="font-medium text-fg">{filename}</span> was uploaded successfully.
              {result.queuePosition !== undefined ? ` Queue position: ${result.queuePosition}.` : ''}{' '}
              Background text extraction and vector embedding are in progress.
            </p>
          </Alert>
        ) : (
          <Alert
            tone={skipped ? 'warning' : 'success'}
            icon={skipped ? <TriangleAlert className="size-4" /> : <CircleCheck className="size-4" />}
            title={skipped ? 'Uploaded, with some passages skipped' : 'Ready to answer questions'}
          >
            <p>
              <span className="font-medium text-fg">{filename}</span> was split into{' '}
              {formatNumber(result.totalChunks ?? 0)} passages;{' '}
              {formatNumber(result.chunksProcessed ?? result.totalChunks ?? 0)} were embedded
              {result.pages ? ` from ${formatNumber(result.pages)} pages` : ''}.
            </p>
            {skipped && (
              <p className="mt-1">
                {formatNumber(result.chunksSkipped ?? 0)} could not be embedded — usually scanned images or
                pages with no extractable text. Those parts will not appear in answers.
              </p>
            )}
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            onClick={() => {
              seedComposer(question)
              onDone?.()
            }}
          >
            <Link to="/app">Ask about it</Link>
          </Button>
          <Button variant="secondary" onClick={startOver}>
            Upload another
          </Button>
          <Button asChild variant="ghost" onClick={onDone}>
            <Link to="/app/documents">All documents</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={input}
        type="file"
        accept={`${ACCEPTED_UPLOAD_MIME},${ACCEPTED_UPLOAD_EXT}`}
        className="sr-only"
        onChange={(event) => choose(event.target.files?.[0])}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-surface-raised p-3">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-md bg-accent-wash text-accent"
          >
            <FileText className="size-4" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium text-fg">{file.name}</span>
            <span className="text-xs text-fg-muted">{formatBytes(file.size)}</span>
          </span>
          {!isUploading && (
            <IconButton
              label="Choose a different file"
              icon={<X />}
              size="sm"
              onClick={startOver}
            />
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(event) => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault()
            setDragging(false)
            choose(event.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors duration-(--dur-fast)',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--border-focus)',
            dragging
              ? 'border-accent bg-accent-wash'
              : 'border-line bg-surface-raised/40 hover:border-line-strong hover:bg-surface-raised',
          )}
        >
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-full bg-accent-wash text-accent"
          >
            <Upload className="size-5" />
          </span>
          <span className="text-sm font-medium text-fg">
            Drop a PDF here, or click to choose one
          </span>
          <span className="text-xs text-fg-muted">
            PDF only · up to {formatBytes(MAX_UPLOAD_BYTES)}
          </span>
        </button>
      )}

      {rejected && (
        <Alert tone="error" title="That file cannot be used">
          {rejected}
        </Alert>
      )}

      {error && !isUploading && (
        <Alert tone="error" title="The upload failed">
          {error.message}
        </Alert>
      )}

      {isUploading && (
        <div className="flex flex-col gap-2">
          <Progress
            label="Upload progress"
            value={Math.round(progress * 100)}
            showValue
            tone="accent"
          />
          <p className="text-xs text-fg-muted">
            {progress >= 1
              ? 'Uploaded. Extracting text and building embeddings — this can take a minute for a long document.'
              : 'Sending the file…'}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          disabled={!file || isUploading}
          loading={isUploading}
          leftIcon={<Upload />}
          onClick={() => file && upload(file)}
        >
          {isUploading ? 'Uploading…' : 'Upload and index'}
        </Button>
        {isUploading && (
          <Button variant="ghost" onClick={cancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
