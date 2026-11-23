import { useState } from 'react'
import { toast } from 'sonner'
import { ScrollText, ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { EmptyState, KpiTiles, SectionCard } from '@/components/shared/record'
import { StatusBadge } from '@/components/shared/pills'
import { reached } from '@/demo/script'
import { useDemo } from '@/store'
import { OfferDialog } from './OfferDialog'

const RUNS = [
  { to: 'Lena Park, Corvid', when: 'Yesterday, 9:12 AM', words: 11, outcome: 'Replied' },
  { to: 'Theo Grant, Pathwise', when: '3 days ago', words: 12, outcome: 'Opened' },
  { to: 'Rina Sato, Kelp', when: '4 days ago', words: 10, outcome: 'Opened' },
  { to: 'Marco Diaz, Tallybook', when: '6 days ago', words: 13, outcome: 'No reply yet' },
]

/** /autonomy — what runs without asking, within the founder's limits; take anything back. */
export default function AutonomyPage() {
  const step = useDemo((s) => s.step)
  const cap = useDemo((s) => s.autonomyCap)
  const autonomyOn = useDemo((s) => s.autonomyOn)
  const pauseOnEdits = useDemo((s) => s.pauseOnEdits)
  const notifyEachRun = useDemo((s) => s.notifyEachRun)
  const patch = useDemo((s) => s.patch)
  const [confirm, setConfirm] = useState(false)
  const [offerOpen, setOfferOpen] = useState(false)

  const granted = reached(step, 'autonomy')
  const takenBack = granted && !autonomyOn
  const runs = autonomyOn && reached(step, 'usage') ? RUNS : []
  const offered = reached(step, 'offer')

  const firstNotesStatus = autonomyOn ? 'Autonomous' : offered && !granted ? 'Offered' : 'Needs approval'

  return (
    <>
      <PageHeader icon={ShieldCheck} crumbs={[{ label: 'Autonomy' }]} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1040px] space-y-6 px-6 pb-16 pt-8">
          <div>
            <h1 className="text-2xl font-medium">Autonomy</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              What Pact runs without asking, within limits you set. Earned one task at a time; take anything back any time.
            </p>
          </div>

          <KpiTiles
            items={[
              { label: 'Monthly cap', value: cap ?? 'Not set' },
              { label: 'Spent this month', value: cap ? `$0 of ${cap}` : '$0' },
              { label: 'Included tasks used', value: `${runs.length} of 100`, hint: 'Your plan includes 100 autonomous tasks a month; beyond that, from $0.25 a task, up to your cap' },
              { label: 'Tasks running on their own', value: autonomyOn ? 1 : 0 },
              { label: 'Taken back', value: takenBack ? 1 : 0 },
            ]}
          />

          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-[13px]">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="h-9 px-3 text-left font-normal">Task</th>
                  <th className="px-3 text-left font-normal">Status</th>
                  <th className="px-3 text-left font-normal">Track record</th>
                  <th className="whitespace-nowrap px-3 text-right font-normal">Runs this month</th>
                  <th className="w-36 px-3 text-right font-normal" />
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="h-12 px-3 font-medium">Send first notes to new leads</td>
                  <td className="px-3">
                    <StatusBadge status={firstNotesStatus} />
                  </td>
                  <td className="px-3 text-muted-foreground">6 of 6 approved · 5 as written, 1 edited</td>
                  <td className="px-3 text-right tabular-nums">{runs.length}</td>
                  <td className="px-3 text-right">
                    {autonomyOn ? (
                      <Button size="sm" variant="outline" onClick={() => setConfirm(true)}>
                        Take back
                      </Button>
                    ) : offered ? (
                      <Button size="sm" variant="outline" onClick={() => setOfferOpen(true)}>
                        {takenBack ? 'Hand over again' : 'Review offer'}
                      </Button>
                    ) : null}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="h-12 px-3 font-medium">Draft follow-ups after calls</td>
                  <td className="px-3">
                    <StatusBadge status="Needs approval" />
                  </td>
                  <td className="px-3 text-muted-foreground">9 of 11 approved · Pact asks after 3 more clean approvals</td>
                  <td className="px-3 text-right text-muted-foreground">—</td>
                  <td />
                </tr>
                <tr className="border-b">
                  <td className="h-12 px-3 font-medium">Prepare call briefs</td>
                  <td className="px-3">
                    <Badge tone="neutral">No approval needed</Badge>
                  </td>
                  <td className="px-3 text-muted-foreground">Internal only: nothing is sent to anyone</td>
                  <td className="px-3 text-right tabular-nums">{reached(step, 'offer') ? 3 : 0}</td>
                  <td />
                </tr>
                <tr>
                  <td className="h-12 px-3 font-medium">Answer buyers' AI agents</td>
                  <td className="px-3">
                    <Badge tone="violet">Next</Badge>
                  </td>
                  <td className="px-3 text-muted-foreground">Pre-approved answers only, each approved once</td>
                  <td className="px-3 text-right text-muted-foreground">—</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SectionCard title="Guardrails" icon={SlidersHorizontal}>
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  <span>
                    Pause a task if I edit 2 in a row
                    <span className="block text-xs text-muted-foreground">It goes back to drafting for your approval</span>
                  </span>
                  <Switch checked={pauseOnEdits} onCheckedChange={(v) => patch({ pauseOnEdits: v })} />
                </label>
                <label className="flex items-center justify-between gap-3 text-[13px]">
                  <span>
                    Tell me after each run
                    <span className="block text-xs text-muted-foreground">A notification with what was sent</span>
                  </span>
                  <Switch checked={notifyEachRun} onCheckedChange={(v) => patch({ notifyEachRun: v })} />
                </label>
                <p className="border-t pt-3 text-xs text-muted-foreground">
                  Suggestions and approvals are always free. Runs beyond your plan's allowance count toward the cap; at the cap,
                  Pact stops and asks.
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Run log" icon={ScrollText}>
              {runs.length === 0 ? (
                <EmptyState
                  icon={ScrollText}
                  title={autonomyOn ? 'No runs yet' : 'Nothing runs on its own'}
                  hint={autonomyOn ? 'Every send Pact makes on its own will be listed here.' : 'Grant a task and every run is logged here.'}
                />
              ) : (
                <ul className="-my-1 divide-y">
                  {runs.map((r) => (
                    <li key={r.to} className="flex items-center gap-2.5 py-2">
                      <ShieldCheck className="size-3.5 text-violet-600" />
                      <span className="flex-1">
                        <span className="block text-[13px]">First note to {r.to}</span>
                        <span className="block text-xs text-muted-foreground">
                          {r.when} · opener {r.words} words
                        </span>
                      </span>
                      <StatusBadge status={r.outcome === 'Replied' ? 'Completed' : 'Sent'} />
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        </div>
      </div>

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="max-w-sm p-5">
          <DialogTitle className="text-[15px] font-medium">Take back first notes?</DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Pact goes back to drafting first notes for your approval. Nothing already sent changes. You can hand it over again any
            time.
          </DialogDescription>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                patch({ autonomyOn: false })
                setConfirm(false)
                toast('Taken back', { description: 'First notes need your approval again.' })
              }}
            >
              Take back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <OfferDialog
        open={offerOpen}
        onOpenChange={(v) => {
          setOfferOpen(v)
        }}
      />
    </>
  )
}
