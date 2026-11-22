import { useState } from 'react'
import { Link } from 'react-router'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Info,
  Sparkles,
  Table2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './pills'
import type { SuggestedUpdate } from '@/data/types'
import { cn } from '@/lib/utils'

/* ---------- Record chip: small pill linking to a related record ---------- */
export function RecordChip({ icon: Icon, label, to }: { icon?: LucideIcon; label: string; to?: string }) {
  const body = (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md border bg-background px-1.5 text-xs font-medium hover:bg-accent">
      {Icon && <Icon className="size-3.5 text-muted-foreground" />}
      {label}
    </span>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

/* ---------- KPI tiles row (Amount / Close date / Days in stage / Next step date) ---------- */
export interface Kpi {
  label: string
  value: React.ReactNode
  hint?: string
}
export function KpiTiles({ items }: { items: Kpi[] }) {
  return (
    <div className="grid divide-x rounded-lg border" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((k) => (
        <div key={k.label} className="px-4 py-3.5">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {k.label}
            {k.hint && (
              <span title={k.hint}>
                <Info className="size-3" />
              </span>
            )}
          </div>
          <div className="mt-1.5 text-lg font-medium tabular-nums">{k.value}</div>
        </div>
      ))}
    </div>
  )
}

/* ---------- Stage tracker (stepper) ---------- */
export function StageTracker({
  stages,
  current,
  onSelect,
}: {
  stages: readonly string[]
  current: string
  onSelect?: (s: string) => void
}) {
  const idx = stages.indexOf(current)
  return (
    <div className="flex items-start px-2 pb-1 pt-2">
      {stages.map((s, i) => {
        const done = i < idx
        const active = i === idx
        return (
          <div key={s} className="flex min-w-0 flex-1 flex-col items-start">
            <div className="flex w-full items-center">
              <button
                type="button"
                onClick={() => onSelect?.(s)}
                title={onSelect ? `Move to ${s}` : undefined}
                disabled={!onSelect}
                className={cn(
                  'relative z-[1] flex size-3 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors',
                  done && 'border-foreground bg-foreground',
                  active && 'border-foreground bg-background',
                  !done && !active && 'border-neutral-300 bg-background hover:border-neutral-500',
                )}
              >
                {done && <Check className="size-2 text-background" strokeWidth={4} />}
                {active && <span className="size-1.5 rounded-full bg-foreground" />}
              </button>
              {i < stages.length - 1 && (
                <div className={cn('h-px flex-1', i < idx ? 'bg-foreground' : 'border-t border-dashed border-neutral-300')} />
              )}
            </div>
            <span
              className={cn(
                '-ml-2 mt-2 w-full truncate pr-2 text-[11px]',
                done || active ? 'text-foreground' : 'text-muted-foreground',
              )}
              title={s}
            >
              {s}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Suggested updates ---------- */
export function SuggestionsBanner({ pending, applied, onOpen }: { pending: number; applied: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-table-background-hover"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-violet-50">
        <Sparkles className="size-4 text-violet-600" />
      </span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium">Suggested updates</span>
        <span className="block text-xs text-muted-foreground">
          {pending > 0 ? `You have ${pending} suggested update${pending === 1 ? '' : 's'}` : 'No pending suggestions'}
          {applied > 0 && ` · ${applied} suggested update${applied === 1 ? ' was' : 's were'} applied today`}
        </span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  )
}

export function SuggestionCard({
  suggestion,
  detectedAt,
  onAccept,
  onReject,
}: {
  suggestion: SuggestedUpdate
  detectedAt: string
  onAccept: () => void
  onReject: () => void
}) {
  const [open, setOpen] = useState(true)
  const resolved = suggestion.status !== 'pending'
  return (
    <div className={cn('rounded-lg border', resolved && 'opacity-60')}>
      <div className="flex items-start justify-between gap-2 p-3">
        <div>
          <div className="flex items-center gap-2">
            <Table2 className="size-3.5 text-muted-foreground" />
            <StatusBadge status="Suggestion" />
            <span className="text-xs font-medium">{suggestion.label}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Detected {detectedAt}</p>
        </div>
        {resolved ? (
          <StatusBadge status={suggestion.status === 'accepted' ? 'Completed' : 'Rejected'} />
        ) : (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={onReject}>
              <X /> Reject
            </Button>
            <Button size="sm" onClick={onAccept}>
              <Check /> Accept
            </Button>
          </div>
        )}
      </div>
      <div className="space-y-2 px-3 pb-3">
        <div className="rounded-md border p-2.5">
          <p className="text-xs text-muted-foreground">Change</p>
          <p className="mt-1.5 flex items-center gap-2 text-[13px]">
            <span className="text-muted-foreground line-through">{suggestion.from}</span>
            <span>→</span>
            <span className="font-medium">{suggestion.to}</span>
          </p>
        </div>
        <div className="rounded-md border p-2.5">
          <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs text-muted-foreground">
            Evidence
            <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
          </button>
          {open && (
            <>
              <span className="mt-1.5 inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-1.5 text-xs">
                <Table2 className="size-3 text-muted-foreground" /> {suggestion.source}
              </span>
              <p className="mt-2 text-[13px] leading-relaxed">{suggestion.evidence}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ---------- Section card + empty state ---------- */
export function SectionCard({
  title,
  icon: Icon,
  actions,
  children,
  className,
}: {
  title?: React.ReactNode
  icon?: LucideIcon
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-lg border bg-background', className)}>
      {(title || actions) && (
        <header className="flex h-11 items-center justify-between border-b px-4">
          <h3 className="flex items-center gap-2 text-[13px] font-medium">
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            {title}
          </h3>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  )
}

export function EmptyState({ icon: Icon, title, hint, action }: { icon: LucideIcon; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <span className="flex size-10 items-center justify-center rounded-lg border bg-muted/40">
        <Icon className="size-5 text-muted-foreground" />
      </span>
      <p className="mt-1 text-[13px] font-medium">{title}</p>
      {hint && <p className="max-w-sm text-xs text-muted-foreground">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
