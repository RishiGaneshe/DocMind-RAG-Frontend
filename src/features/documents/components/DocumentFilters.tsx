import { Search, X } from 'lucide-react'
import { IconButton, Input, Select } from '@/components/ui'
import type { DocumentStatus } from '@/lib/api'
import { STATUS_LABELS } from './StatusPill'

/**
 * Search, status filter and sort for the library.
 *
 * All three are client-side: the list endpoint takes no query parameters, and a
 * workspace's document count is small enough that filtering in the browser is
 * both instant and honest about what it can do. If the endpoint ever paginates,
 * this is the component that changes.
 */

export type StatusFilter = DocumentStatus | 'ALL'
export type SortKey = 'newest' | 'oldest' | 'name' | 'largest' | 'chunks'

export const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest first',
  oldest: 'Oldest first',
  name: 'Name A–Z',
  largest: 'Largest first',
  chunks: 'Most passages',
}

interface DocumentFiltersProps {
  query: string
  onQueryChange: (query: string) => void
  status: StatusFilter
  onStatusChange: (status: StatusFilter) => void
  sort: SortKey
  onSortChange: (sort: SortKey) => void
}

export function DocumentFilters({
  query,
  onQueryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <Input
          type="search"
          label="Search documents"
          hideLabel
          placeholder="Search by filename…"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          leftIcon={<Search />}
          trailing={
            query ? (
              <IconButton
                label="Clear search"
                icon={<X />}
                size="sm"
                onClick={() => onQueryChange('')}
              />
            ) : undefined
          }
        />
      </div>

      <div className="flex gap-2">
        <Select
          label="Status"
          hideLabel
          className="min-w-36"
          value={status}
          onValueChange={(next) => onStatusChange(next as StatusFilter)}
          options={[
            { value: 'ALL', label: 'All statuses' },
            ...(Object.keys(STATUS_LABELS) as DocumentStatus[]).map((key) => ({
              value: key,
              label: STATUS_LABELS[key],
            })),
          ]}
        />

        <Select
          label="Sort by"
          hideLabel
          className="min-w-40"
          value={sort}
          onValueChange={(next) => onSortChange(next as SortKey)}
          options={(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
            value: key,
            label: SORT_LABELS[key],
          }))}
        />
      </div>
    </div>
  )
}
