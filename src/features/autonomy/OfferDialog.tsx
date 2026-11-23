import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { BrainCircuit, CalendarCheck, Check, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useDemo } from '@/store'

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
  const openerWords = useDemo((s) => s.openerWords)
  const calendar = useDemo((s) => s.connected.includes('calendar'))
  const chosen = cap ?? '$50'
  const patch = useDemo((s) => s.patch)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-lg overflow-y-auto p-5" aria-describedby="offer-desc">
        {step === 'offer' && (
          <div className="mb-4 border-b pb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">A day later</p>
            <p className="mt-1.5 flex items-start gap-2 text-[13px] leading-snug">
              <CalendarCheck className="mt-0.5 size-4 shrink-0 text-green-600" />
              <span>
                {calendar
                  ? 'Maya replied and booked Thursday, 2:00 PM. Pact prepared the call brief.'
                  : 'Maya replied: "Thursday at 2:00 works." Pact sent the invite from your Gmail and prepared the call brief.'}
              </span>
            </p>
            <ul className="mt-3 space-y-2 rounded-lg bg-violet-50/60 px-3 py-2.5 text-[13px] leading-snug">
              <li className="flex items-start gap-2">
                <BrainCircuit className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
                <span>
                  <b className="font-medium">Pact learned</b> you open first notes in under 15 words: you cut its opener to {openerWords}.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <BrainCircuit className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
                <span>
                  Past champions at new companies reply <b className="font-medium">31%</b> of the time, against 4% for cold notes, so
                  Pact now sources from champion moves.
                </span>
              </li>
            </ul>
          </div>
        )}
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
            value={chosen}
            onValueChange={(v) => patch({ autonomyCap: v })}
            options={['$25', '$50', '$100'].map((v) => ({ value: v, label: `${v} a month` }))}
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
            className="demo-pulse"
            onClick={() => {
              patch({ autonomyOn: true, autonomyCap: chosen, offerDeferred: false })
              onOpenChange(false)
              toast.success('First notes now run on their own', { description: `Within your ${chosen} monthly cap. Take it back any time.` })
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
