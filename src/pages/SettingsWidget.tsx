import {
  Check,
  Code2,
  Copy,
  ExternalLink,
  Laptop,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import {
  Alert,
  Button,
  ErrorState,
  IconButton,
  Input,
  RadioGroup,
  Select,
  Skeleton,
  Switch,
  Textarea,
  type RadioOption,
  type SelectOption,
} from '@/components/ui'
import { ChatWidget } from '@/components/widget/ChatWidget'
import { useApiKeysList } from '@/features/settings/hooks/useApiKeys'
import {
  useUpdateWidgetConfig,
  useWidgetConfig,
} from '@/features/settings/hooks/useWidgetConfig'
import { useCopyToClipboard, useDocumentTitle } from '@/hooks'
import {
  WIDGET_GREETING_MAX,
  WIDGET_PLACEHOLDER_MAX,
  WIDGET_TITLE_MAX,
} from '@/lib/constants'
import type { SourceMode, WidgetConfig } from '@/lib/api'

const COLOR_PRESETS = [
  { name: 'DocMind Sky', hex: '#4E77B8' },
  { name: 'Ocean Cyan', hex: '#0EA5E9' },
  { name: 'Emerald Teal', hex: '#10B981' },
  { name: 'Indigo Dream', hex: '#6366F1' },
  { name: 'Violet Purple', hex: '#8B5CF6' },
  { name: 'Rose Red', hex: '#F43F5E' },
  { name: 'Amber Glow', hex: '#F59E0B' },
  { name: 'Gunmetal Dark', hex: '#1E293B' },
]

const SOURCE_MODE_OPTIONS: RadioOption[] = [
  {
    value: 'labels',
    label: 'Compact Badges (Recommended)',
    hint: 'Displays clean source tags with document filename and page numbers.',
  },
  {
    value: 'full',
    label: 'Rich Cards',
    hint: 'Expands source snippets and breadcrumbs for in-depth verification.',
  },
  {
    value: 'hidden',
    label: 'Hidden Citations',
    hint: 'Conversational responses only. Source cards are omitted from visitors.',
  },
]

const POSITION_OPTIONS: RadioOption[] = [
  {
    value: 'right',
    label: 'Bottom Right',
    hint: 'Standard location for web chat widgets.',
  },
  {
    value: 'left',
    label: 'Bottom Left',
    hint: 'Useful if other widgets occupy the bottom-right.',
  },
]

/**
 * `/app/settings/widget` — Embeddable Chat Widget Customizer & Preview.
 *
 * Configures colors, greetings, position, citation modes, and suggested questions.
 * Includes side-by-side interactive preview and embed code generator with public API key integration.
 */
export default function SettingsWidgetPage() {
  useDocumentTitle('Chat Widget')

  const { data: serverConfig, isPending, isError, error, refetch } = useWidgetConfig()
  const { data: apiKeysData } = useApiKeysList()
  const updateMutation = useUpdateWidgetConfig()
  const { copy, copied } = useCopyToClipboard()

  // Form draft state
  const [draft, setDraft] = useState<Partial<WidgetConfig>>({
    title: 'DocMind AI',
    greeting: 'Hello! Ask me anything about our documents.',
    placeholder: 'Ask a question...',
    accentColor: '#4E77B8',
    position: 'right',
    sourceMode: 'labels',
    showBranding: true,
    enabled: true,
    suggestions: [
      'What are the key features?',
      'How does pricing work?',
      'How do I get started?',
    ],
  })

  // Selected public API key for embed script
  const [selectedKeyId, setSelectedKeyId] = useState<string>('')
  // Preview device mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  // New question input field
  const [newQuestion, setNewQuestion] = useState('')

  // Sync draft from server
  useEffect(() => {
    if (serverConfig) {
      setDraft(serverConfig)
    }
  }, [serverConfig])

  // Set default selected public key
  useEffect(() => {
    if (apiKeysData?.apiKeys && !selectedKeyId) {
      const firstPublic = apiKeysData.apiKeys.find(
        (k) => k.type === 'public' && k.status === 'active',
      )
      if (firstPublic) setSelectedKeyId(firstPublic.id)
    }
  }, [apiKeysData, selectedKeyId])

  const publicKeys = (apiKeysData?.apiKeys ?? []).filter(
    (k) => k.type === 'public' && k.status === 'active',
  )
  const activeKey = publicKeys.find((k) => k.id === selectedKeyId) || publicKeys[0]

  const keySelectOptions: SelectOption[] = publicKeys.map((k) => ({
    value: k.id,
    label: `${k.name} (${k.maskedKey})`,
  }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(draft)
  }

  const handleReset = () => {
    if (serverConfig) {
      setDraft(serverConfig)
      toast.info('Draft reset to saved configuration')
    }
  }

  const handleAddQuestion = () => {
    const q = newQuestion.trim()
    if (!q) return
    const current = draft.suggestions ?? []
    if (current.length >= 4) {
      toast.error('Maximum of 4 starter questions allowed')
      return
    }
    setDraft({ ...draft, suggestions: [...current, q] })
    setNewQuestion('')
  }

  const handleRemoveQuestion = (idx: number) => {
    const current = draft.suggestions ?? []
    setDraft({ ...draft, suggestions: current.filter((_, i) => i !== idx) })
  }

  const embedScriptSnippet = `<script
  src="https://cdn.docmind.ai/widget.js"
  data-api-key="${activeKey?.maskedKey ? activeKey.keyPrefix + '...' : 'YOUR_PUBLIC_KEY'}"
  data-position="${draft.position ?? 'right'}"
  defer>
</script>`

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-fg">Chat Widget</h2>
          <p className="text-sm text-fg-muted">
            Customize the AI chat assistant and embed it into your website with a single script tag.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleReset}
            disabled={updateMutation.isPending || !serverConfig}
            leftIcon={<RotateCcw />}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            loading={updateMutation.isPending}
            leftIcon={<Save />}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {isPending && !serverConfig ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton lines={6} />
        </div>
      ) : isError ? (
        <ErrorState
          title="Could not load widget configuration"
          description={error?.message || 'Failed to fetch widget settings for this workspace.'}
          onRetry={() => void refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Configuration Form */}
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {/* Widget Status Switch */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <Switch
                label="Enable Chat Widget"
                hint="When disabled, the widget will not respond to visitor queries."
                checked={draft.enabled ?? true}
                onCheckedChange={(checked) => setDraft({ ...draft, enabled: checked })}
                labelPosition="left"
              />
            </div>

            {/* Section 1: Copy & Content */}
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
              <h3 className="text-base font-semibold text-fg">Copy & Text</h3>

              <Input
                id="widget-title"
                label="Widget Title"
                maxLength={WIDGET_TITLE_MAX}
                value={draft.title ?? ''}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. DocMind Support"
                hint="Displayed in the top navigation header of the chat bubble."
              />

              <Textarea
                id="widget-greeting"
                label="Welcome Greeting"
                rows={3}
                value={draft.greeting ?? ''}
                onChange={(e) => setDraft({ ...draft, greeting: e.target.value })}
                placeholder="Hello! How can I help you today?"
                hint="Initial greeting message sent automatically when the chat opens."
                counter={{
                  value: draft.greeting?.length ?? 0,
                  max: WIDGET_GREETING_MAX,
                }}
              />

              <Input
                id="widget-placeholder"
                label="Input Placeholder"
                maxLength={WIDGET_PLACEHOLDER_MAX}
                value={draft.placeholder ?? ''}
                onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })}
                placeholder="Ask a question..."
                hint="Ghost text shown in the question input bar."
              />
            </div>

            {/* Section 2: Visual Styling */}
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center gap-2">
                <Palette className="size-4 text-accent" />
                <h3 className="text-base font-semibold text-fg">Appearance</h3>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-fg-secondary">Accent Color</span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {COLOR_PRESETS.map((p) => {
                    const isSelected =
                      (draft.accentColor ?? '#4E77B8').toLowerCase() === p.hex.toLowerCase()

                    return (
                      <button
                        key={p.hex}
                        type="button"
                        onClick={() => setDraft({ ...draft, accentColor: p.hex })}
                        title={p.name}
                        className={`size-8 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                          isSelected
                            ? 'border-fg scale-110 shadow-sm'
                            : 'border-transparent hover:border-line-strong'
                        }`}
                        style={{ backgroundColor: p.hex }}
                      />
                    )
                  })}

                  <div className="flex items-center gap-2 pl-2">
                    <input
                      type="color"
                      id="custom-color-picker"
                      value={draft.accentColor ?? '#4E77B8'}
                      onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })}
                      className="size-8 cursor-pointer rounded-md border border-line bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      maxLength={7}
                      value={draft.accentColor ?? '#4E77B8'}
                      onChange={(e) => setDraft({ ...draft, accentColor: e.target.value })}
                      className="w-24 rounded-md border border-line bg-surface-raised px-2.5 py-1 font-mono text-xs text-fg uppercase focus-visible:outline-2 focus-visible:outline-(--border-focus)"
                    />
                  </div>
                </div>
              </div>

              <RadioGroup
                label="Launcher Position"
                variant="card"
                options={POSITION_OPTIONS}
                value={draft.position ?? 'right'}
                onValueChange={(val) =>
                  setDraft({ ...draft, position: val as 'left' | 'right' })
                }
              />

              <Switch
                label="Show DocMind Branding"
                hint="Displays 'Powered by DocMind' footer in the widget."
                checked={draft.showBranding ?? true}
                onCheckedChange={(checked) => setDraft({ ...draft, showBranding: checked })}
                labelPosition="left"
              />
            </div>

            {/* Section 3: Grounded AI & Citations */}
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
              <h3 className="text-base font-semibold text-fg">Citations & Discovery</h3>

              <RadioGroup
                label="Citation Display Mode"
                variant="card"
                options={SOURCE_MODE_OPTIONS}
                value={draft.sourceMode ?? 'labels'}
                onValueChange={(val) => setDraft({ ...draft, sourceMode: val as SourceMode })}
              />

              <div className="flex flex-col gap-2 pt-2">
                <span className="text-sm font-medium text-fg-secondary">
                  Suggested Questions (Max 4)
                </span>
                <p className="text-xs text-fg-muted">
                  Shown to visitors before they type their first question.
                </p>

                <div className="flex flex-col gap-2">
                  {(draft.suggestions ?? []).map((q: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-raised/40 px-3 py-2 text-xs text-fg"
                    >
                      <span className="truncate">{q}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-fg-muted hover:text-error transition-colors"
                        title="Remove question"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {(draft.suggestions ?? []).length < 4 && (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddQuestion()
                        }
                      }}
                      placeholder="Add a starter question..."
                      className="flex-1 rounded-md border border-line bg-surface-raised px-3 py-1.5 text-xs text-fg focus-visible:outline-2 focus-visible:outline-(--border-focus)"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddQuestion}
                      disabled={!newQuestion.trim()}
                      leftIcon={<Plus />}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Embed Code */}
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="size-4 text-accent" />
                  <h3 className="text-base font-semibold text-fg">Embed Code</h3>
                </div>
                <Link
                  to="/app/settings/api-keys"
                  className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                >
                  Manage Keys
                  <ExternalLink className="size-3" />
                </Link>
              </div>

              {publicKeys.length === 0 ? (
                <Alert
                  tone="warning"
                  title="Public API Key Required"
                  action={
                    <Link to="/app/settings/api-keys">
                      <Button size="sm">Create Key</Button>
                    </Link>
                  }
                >
                  You need a public API key (starting with <code>pk_live_</code>) with origin
                  allowlisting to embed this widget.
                </Alert>
              ) : (
                <>
                  <Select
                    label="Public API Key"
                    options={keySelectOptions}
                    value={selectedKeyId}
                    onValueChange={setSelectedKeyId}
                    hint="Requests from your embedded widget authenticate using this key."
                  />

                  <div className="relative mt-2">
                    <pre className="overflow-x-auto rounded-lg border border-line bg-surface-raised p-3.5 font-mono text-xs text-fg-secondary">
                      {embedScriptSnippet}
                    </pre>
                    <div className="absolute top-2.5 right-2.5">
                      <IconButton
                        label={copied ? 'Copied' : 'Copy snippet'}
                        icon={copied ? <Check /> : <Copy />}
                        size="sm"
                        onClick={() => {
                          void copy(embedScriptSnippet).then((ok) => {
                            if (ok) toast.success('Embed code copied to clipboard')
                          })
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </form>

          {/* Right Column: Live Interactive Preview */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <span className="text-sm font-semibold text-fg">Live Preview</span>
              </div>

              <div className="flex items-center rounded-lg border border-line bg-surface-raised p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-surface text-fg shadow-xs'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  <Laptop className="size-3.5" />
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-surface text-fg shadow-xs'
                      : 'text-fg-muted hover:text-fg'
                  }`}
                >
                  <Smartphone className="size-3.5" />
                  Mobile
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div
              className={`relative flex flex-col overflow-hidden rounded-2xl border border-line bg-bg transition-all ${
                previewDevice === 'mobile'
                  ? 'mx-auto w-[360px] h-[640px] shadow-2xl'
                  : 'w-full h-[620px] shadow-lg'
              }`}
            >
              {/* Simulated Browser Bar */}
              <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2 text-xs text-fg-muted">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-rose-500/80" />
                  <span className="size-2.5 rounded-full bg-amber-500/80" />
                  <span className="size-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="mx-auto rounded-md bg-surface-raised px-3 py-0.5 font-mono text-[11px] text-fg-secondary">
                  https://your-website.com
                </div>
              </div>

              {/* Simulated Customer Website Content */}
              <div className="relative flex-1 overflow-y-auto p-6 text-left">
                <div className="flex flex-col gap-4 opacity-40 select-none pointer-events-none">
                  <div className="h-6 w-32 rounded-md bg-fg-muted/20" />
                  <div className="h-8 w-3/4 rounded-md bg-fg-muted/30" />
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-fg-muted/15" />
                    <div className="h-4 w-5/6 rounded bg-fg-muted/15" />
                    <div className="h-4 w-4/6 rounded bg-fg-muted/15" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="h-24 rounded-xl border border-line bg-surface-raised/50" />
                    <div className="h-24 rounded-xl border border-line bg-surface-raised/50" />
                  </div>
                </div>

                {/* Floating ChatWidget Inside Preview */}
                <ChatWidget
                  config={draft}
                  mode="preview"
                  initiallyOpen={true}
                  className="!absolute"
                />
              </div>
            </div>

            <span className="text-center text-xs text-fg-muted">
              Interactive sandbox — try asking questions and switching styling options.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
