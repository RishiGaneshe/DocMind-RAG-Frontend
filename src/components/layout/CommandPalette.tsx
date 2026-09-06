import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  FileText,
  KeyRound,
  LogOut,
  MessagesSquare,
  Palette,
  Search,
  Settings,
  Upload,
  Users,
} from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Kbd } from '@/components/ui'
import { useLogout } from '@/features/auth/hooks/useAuthMutations'
import { useDocuments } from '@/features/documents/hooks/useDocuments'
import { useHotkey } from '@/hooks'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/uiStore'

/**
 * ⌘K / Ctrl+K (§12.8).
 *
 * Built as a combobox over a listbox rather than a menu: the filter field keeps
 * focus while the highlighted option is announced through `aria-activedescendant`,
 * which is the pattern screen readers expect from a search-and-jump surface.
 */

interface Command {
  id: string
  label: string
  hint?: string
  group: string
  icon: React.ReactNode
  run: () => void
}

const NEXT_THEME = { system: 'dark', dark: 'light', light: 'system' } as const

export function CommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen)
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen)
  const theme = useUiStore((s) => s.theme)
  const setTheme = useUiStore((s) => s.setTheme)
  const { documents } = useDocuments()
  const logout = useLogout()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const listRef = useRef<HTMLUListElement>(null)

  useHotkey('mod+k', (event) => {
    event.preventDefault()
    setOpen(true)
  }, { enableInFormFields: true })

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => void navigate(to)

    const base: Command[] = [
      { id: 'chat', label: 'Go to chat', group: 'Navigate', icon: <MessagesSquare />, run: go('/app') },
      { id: 'documents', label: 'Go to documents', group: 'Navigate', icon: <FileText />, run: go('/app/documents') },
      { id: 'upload', label: 'Upload a document', group: 'Actions', icon: <Upload />, run: go('/app/documents/upload') },
      {
        id: 'theme',
        label: `Switch theme to ${NEXT_THEME[theme]}`,
        group: 'Actions',
        icon: <Palette />,
        run: () => setTheme(NEXT_THEME[theme]),
      },
      { id: 'workspace', label: 'Workspace settings', group: 'Settings', icon: <Settings />, run: go('/app/settings/workspace') },
      { id: 'api-keys', label: 'API key', group: 'Settings', icon: <KeyRound />, run: go('/app/settings/api-keys') },
      { id: 'members', label: 'Members', group: 'Settings', icon: <Users />, run: go('/app/settings/members') },
      {
        id: 'sign-out',
        label: 'Sign out',
        group: 'Actions',
        icon: <LogOut />,
        run: () => logout.mutate(undefined, { onSettled: () => void navigate('/login', { replace: true }) }),
      },
    ]

    for (const doc of documents) {
      base.push({
        id: `doc-${doc.id}`,
        label: doc.filename,
        hint: 'Open document',
        group: 'Documents',
        icon: <FileText />,
        run: go(`/app/documents/${doc.id}`),
      })
    }

    return base
  }, [documents, logout, navigate, setTheme, theme])

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return commands
    return commands.filter((command) => command.label.toLowerCase().includes(needle))
  }, [commands, query])

  // Reset when it closes rather than when it opens: a stale filter is confusing
  // and a stale highlight can point past the end of the next result set, and
  // doing it on the way out means every opener gets a clean palette without an
  // effect that fires a second render on top of the opening animation.
  const reset = () => {
    setQuery('')
    setActive(0)
  }

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [active, results])

  const run = (command: Command | undefined) => {
    if (!command) return
    setOpen(false)
    reset()
    command.run()
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => (results.length ? (index + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => (results.length ? (index - 1 + results.length) % results.length : 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      run(results[active])
    }
  }

  let lastGroup = ''

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out" />
        <DialogPrimitive.Content
          className={cn(
            'fixed top-[12dvh] left-1/2 z-50 flex max-h-[70dvh] w-[calc(100%-1.5rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden',
            'rounded-xl border border-line bg-surface shadow-lg',
            'data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out',
          )}
          aria-label="Command palette"
        >
          <DialogPrimitive.Title className="sr-only">Command palette</DialogPrimitive.Title>

          <div className="flex items-center gap-2.5 border-b border-line px-4">
            <Search aria-hidden="true" className="size-4 shrink-0 text-fg-muted" />
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={results[active] ? `${listId}-${results[active].id}` : undefined}
              aria-label="Search commands and documents"
              placeholder="Search commands and documents…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActive(0)
              }}
              onKeyDown={onKeyDown}
              className="h-12 min-w-0 flex-1 bg-transparent text-base text-fg outline-hidden placeholder:text-fg-disabled"
            />
            <Kbd className="hidden sm:inline-flex">Esc</Kbd>
          </div>

          <ul id={listId} role="listbox" aria-label="Results" ref={listRef} className="min-h-0 flex-1 overflow-y-auto p-2">
            {results.length === 0 && (
              <li role="presentation" className="px-3 py-6 text-center text-sm text-fg-muted">
                No matches for “{query}”
              </li>
            )}

            {results.map((command, index) => {
              const showGroup = command.group !== lastGroup
              lastGroup = command.group

              return (
                <li key={command.id} role="presentation">
                  {showGroup && (
                    <p className="px-3 pt-3 pb-1 text-xs font-semibold tracking-[0.08em] text-fg-muted uppercase">
                      {command.group}
                    </p>
                  )}
                  {/* Keyboard handling for the list lives on the combobox input
                      (Arrow keys move `active`, Enter runs it), which is the
                      pattern `aria-activedescendant` exists for — the options
                      must NOT be focusable, or focus would leave the field. */}
                  {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus */}
                  <div
                    id={`${listId}-${command.id}`}
                    role="option"
                    aria-selected={index === active}
                    data-active={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => run(command)}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm',
                      '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-fg-muted',
                      index === active ? 'bg-accent-wash text-fg [&_svg]:text-accent' : 'text-fg-secondary',
                    )}
                  >
                    {command.icon}
                    <span className="truncate">{command.label}</span>
                    {command.hint && (
                      <span className="ml-auto shrink-0 text-xs text-fg-muted">{command.hint}</span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
