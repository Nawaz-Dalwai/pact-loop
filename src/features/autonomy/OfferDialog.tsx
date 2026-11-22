import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useDemo } from '@/store'
import { cn } from '@/lib/utils'

const APPROVALS = [
  { to: 'Maya Okafor, Halcyon Labs', how: 'Approved, opener cut', when: 'Yesterday' },
  { to: 'Ivo Marten, Ferrous', how: 'Approved as written', when: '3 weeks ago' },
  { to: 'Sara Whitfield, Mosaic Pay', how: 'Approved as written', when: '2 months ago' },
]

/** Earned autonomy: Pact asks to take a task on. The founder must set a monthly cap to grant it. */
export function OfferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const step = useDemo((s) => s.step)
  const cap = useDemo((s) => s.autonomyCap)
  const notifyEachRun = useDemo((s) => s.notifyEachRun)
  const pauseOnEdits = useDemo((s) => s.pauseOnEdits)
  const learnedUndone = useDemo((s) => s.learnedUndone)
  const patch = useDemo((s) => s.patch)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-5" aria-describedby="offer-desc">
        <span className="flex size-8 items-center justify-center rounded-md bg-violet-50">
          <ShieldCheck className="size-4 text-violet-600" />
        </span>
        <DialogTitle className="mt-3 text-[15px] font-medium">Let Pact send first notes on its own?</DialogTitle>
        <DialogDescription id="offer-desc" className="mt-1 text-xs leading-relaxed text-muted-foreground">
          You've approved the last 6 first notes to new leads. When a task keeps earning your yes, Pact asks before taking it
          on. You decide, and can take it back any time.
        </DialogDescription>

        <ul className="mt-4 divide-y rounded-lg border">
          {APPROVALS.map((a) => (
            <li key={a.to} className="flex items-center gap-2.5 px-3 py-2">
              <Check className="size-3.5 text-green-600" />
              <span className="flex-1 text-[13px]">{a.to}</span>
              <span className="text-xs text-muted-foreground">{a.how}</span>
              <span className="w-24 text-right text-xs text-muted-foreground">{a.when}</span>
            </li>
          ))}
          <li className="px-3 py-2 text-xs text-muted-foreground">Plus 3 earlier first notes, all approved as written</li>
        </ul>
        {!learnedUndone && <p className="mt-2 text-xs text-muted-foreground">Openers stay under 15 words, the way you write them.</p>}

        <div className="mt-4 space-y-1.5">
          <Label>Monthly spending cap</Label>
          <Select
            value={cap ?? undefined}
            onValueChange={(v) => patch({ autonomyCap: v })}
            placeholder="Choose a cap (required)"
            options={['$25', '$50', '$100'].map((v) => ({ value: v, label: `${v} a month` }))}
            className={cn(!cap && 'demo-pulse')}
          />
          <p className="text-xs text-muted-foreground">
            Suggestions and approvals are always free. Only tasks Pact runs on its own count, beyond your plan's allowance. At
            the cap, Pact stops and asks.
          </p>
        </div>

        <div className="mt-4 space-y-2.5 rounded-lg border px-3 py-3">
          <label className="flex items-center justify-between gap-3 text-[13px]">
            Tell me after each send
            <Switch checked={notifyEachRun} onCheckedChange={(v) => patch({ notifyEachRun: v })} />
          </label>
          <label className="flex items-center justify-between gap-3 text-[13px]">
            Pause it if I edit 2 in a row
            <Switch checked={pauseOnEdits} onCheckedChange={(v) => patch({ pauseOnEdits: v })} />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              patch({ offerDeferred: true })
              onOpenChange(false)
              toast('Not now', { description: 'Pact keeps drafting first notes for your approval. You can grant it later.' })
            }}
          >
            Not now
          </Button>
          <Button
            disabled={!cap}
            className={cn(cap && 'demo-pulse')}
            onClick={() => {
              patch({ autonomyOn: true, offerDeferred: false })
              onOpenChange(false)
              toast.success('First notes now run on their own', { description: `Within your ${cap} monthly cap. Take it back any time.` })
              // the first grant moves the story on; granting again later (after "Take back") doesn't
              if (step === 'offer') {
                next()
                navigate('/autonomy')
              }
            }}
          >
            <ShieldCheck /> Grant autonomy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
