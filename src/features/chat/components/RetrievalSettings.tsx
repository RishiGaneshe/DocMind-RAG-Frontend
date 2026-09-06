import { SlidersHorizontal } from 'lucide-react'
import {
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Slider,
  Switch,
  Tooltip,
} from '@/components/ui'
import { MIN_SIMILARITY_SCORE, TOP_K_MAX, TOP_K_MIN } from '@/lib/constants'
import { formatPercent } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'

/**
 * Retrieval controls, next to the send button.
 *
 * Both settings are real: `topK` is forwarded on every request and honoured for
 * integers in [1, 20], and turning streaming off switches the transport to the
 * plain JSON route. The similarity floor is shown but not editable — the server
 * owns it, and a control that silently does nothing is worse than none.
 */
export function RetrievalSettings({ disabled = false }: { disabled?: boolean }) {
  const topK = useUiStore((s) => s.topK)
  const setTopK = useUiStore((s) => s.setTopK)
  const streaming = useUiStore((s) => s.streaming)
  const setStreaming = useUiStore((s) => s.setStreaming)

  return (
    <Popover>
      <Tooltip content="Retrieval settings">
        <PopoverTrigger asChild>
          <IconButton
            label="Retrieval settings"
            icon={<SlidersHorizontal />}
            size="sm"
            variant="ghost"
            disabled={disabled}
          />
        </PopoverTrigger>
      </Tooltip>

      <PopoverContent title="Retrieval" side="top" align="end">
        <div className="flex flex-col gap-4">
          <Slider
            label="Passages retrieved"
            valueLabel={topK}
            min={TOP_K_MIN}
            max={TOP_K_MAX}
            step={1}
            value={[topK]}
            onValueChange={([next]) => setTopK(next)}
            hint="How many document chunks are searched for and passed to the model. More context, slower answers."
          />

          <Separator />

          <Switch
            label="Stream the answer"
            hint="Words appear as they are generated. Turn off to receive the whole answer at once."
            labelPosition="left"
            checked={streaming}
            onCheckedChange={setStreaming}
          />

          <p className="text-xs text-fg-muted">
            Passages scoring below {formatPercent(MIN_SIMILARITY_SCORE)} similarity are discarded by
            the server, so a question with no good match is answered honestly rather than guessed.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
