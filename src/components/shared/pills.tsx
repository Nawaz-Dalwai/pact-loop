import { Loader2, Sparkles } from 'lucide-react'
import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { Health } from '@/data/types'
import { cn } from '@/lib/utils'

type Tone = NonNullable<BadgeProps['tone']>

const healthStyle: Record<Health, { dot: string; tone: Tone }> = {
  Healthy: { dot: 'bg-green-500', tone: 'green' },
  'Needs attention': { dot: 'bg-amber-500', tone: 'amber' },
  'At risk': { dot: 'bg-red-500', tone: 'red' },
}

/** Health status: colored dot + label on a tinted pill. */
export function HealthBadge({ health }: { health: Health }) {
  const s = healthStyle[health]
  return (
    <Badge tone={s.tone}>
      <span className={cn('size-1.5 rounded-full', s.dot)} />
      {health === 'Needs attention' ? 'Needs Attention' : health}
    </Badge>
  )
}

/** Generic status badge for records (Draft / Active / Paused / Ready / Warming / Deal …). */
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const tone: Tone =
    status === 'Active' || status === 'Ready' || status === 'Deal' || status === 'Interested' || status === 'Completed' || status === 'Customer' || status === 'Sent' || status === 'Approved'
      ? 'green'
      : status === 'Draft' || status === 'Pilot' || status === 'Meeting booked'
        ? 'blue'
        : status === 'Risk' || status === 'At risk'
          ? 'red'
          : status === 'Insight' || status === 'New signal' || status === 'Autonomous'
            ? 'violet'
            : status === 'Paused' || status === 'Warming' || status === 'Suggestion' || status === 'Offered' || status === 'Digest'
              ? 'amber'
              : 'neutral'
  return (
    <Badge tone={tone} className={className}>
      {status}
    </Badge>
  )
}

/** Table cell placeholder while a field is being enriched. */
export function EnrichingCell() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 className="size-3 animate-spin" />
      Enrichment in progress
    </span>
  )
}

/** Small "AI" marker used next to AI-generated values. */
export function AiMark({ className }: { className?: string }) {
  return <Sparkles className={cn('size-3.5 text-brand', className)} />
}
