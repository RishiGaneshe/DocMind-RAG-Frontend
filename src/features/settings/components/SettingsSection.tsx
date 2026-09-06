import { cn } from '@/lib/utils'
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from '@/components/ui'

/**
 * The shape every settings pane shares: a titled card, a body, and — where it
 * applies — one line saying which part of this is read-only and why.
 *
 * Most of `/app/settings` is read-only, because the API has no update routes for
 * a tenant or a user. Saying so once per pane is better than a form that looks
 * editable and fails on submit.
 */
export function SettingsSection({
  title,
  description,
  footnote,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  footnote?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {children}
        {footnote && <p className="text-xs text-fg-muted">{footnote}</p>}
      </CardBody>
    </Card>
  )
}

/**
 * One labelled fact. A `<dl>` rather than a two-column grid of `<div>`s so the
 * label and the value are associated for a screen reader, not just aligned.
 */
export function InfoRow({
  label,
  children,
  mono = false,
  action,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line/70 pb-3 last:border-0 last:pb-0">
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-xs text-fg-muted">{label}</dt>
        <dd className={cn('text-sm break-words text-fg', mono && 'font-mono text-xs')}>
          {children}
        </dd>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function InfoList({ children }: { children: React.ReactNode }) {
  return <dl className="flex flex-col gap-3">{children}</dl>
}
