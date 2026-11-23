import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useDemo, type SourceId } from '@/store'
import { cn } from '@/lib/utils'
import { sourceById } from './sources'

/**
 * Where a skipped tool would have helped: say what Pact can't see, and offer to connect it
 * right here. Connecting re-renders the journey with the richer data.
 */
export function ConnectNudge({ id, className }: { id: SourceId; className?: string }) {
  const connected = useDemo((s) => s.connected)
  const connect = useDemo((s) => s.connect)
  if (connected.includes(id)) return null
  const s = sourceById(id)
  return (
    <div className={cn('flex items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-3 py-2.5', className)}>
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background">
        <s.icon className="size-4 text-muted-foreground" />
      </span>
      <p className="flex-1 text-[13px] leading-snug">
        <span className="font-medium">{s.name} isn't connected.</span>{' '}
        <span className="text-muted-foreground">Connect it to {s.adds}.</span>
      </p>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          connect(id)
          toast.success(`${s.name} connected`, { description: 'Pact reads it into the same live record.' })
        }}
      >
        Connect
      </Button>
    </div>
  )
}
