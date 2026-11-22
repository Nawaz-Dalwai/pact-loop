import { useNavigate } from 'react-router'
import { BrainCircuit, CircleCheck, ExternalLink, Gauge as GaugeIcon, RotateCcw, Target, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { KpiTiles, SectionCard } from '@/components/shared/record'
import { Gauge } from '@/components/charts/Gauge'
import { TargetBarChart } from '@/components/charts/TargetBarChart'
import { Citation } from '@/components/chat/inline'
import { PLAN, progressFor } from '@/data/plan'
import { DIGEST } from '@/demo/useQueue'
import { reached } from '@/demo/script'
import { useDemo } from '@/store'
import { cn } from '@/lib/utils'

export const REPO_URL = 'https://github.com/Nawaz-Dalwai/pact-loop'
const kFormat = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}M` : `$${n}K`)

const LOOP_RECAP = [
  ['Signal', 'A past contact raised a round; a pilot fell behind on a promise.'],
  ['Act', 'Pact researched, drafted the notes and prepped the call brief.'],
  ['Surface', 'Each item reached the queue with its evidence and the next move.'],
  ['Decide', 'You edited, approved, set a cap and brought in an expert.'],
  ['Learn', 'Your edits and outcomes changed what Pact does next.'],
]

/** Shown when the demo is complete. */
function FinishCard() {
  const reset = useDemo((s) => s.reset)
  const navigate = useNavigate()
  return (
    <section className="rounded-xl border border-violet-200 bg-violet-50/40 p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="flex items-center gap-2 text-[15px] font-semibold">
            <CircleCheck className="size-4 text-violet-600" /> You ran the whole loop, twice
          </p>
          <p className="mt-1 max-w-[560px] text-[13px] text-muted-foreground">
            One turn found and won a new account; the next delivered on a pilot and turned it into revenue. Every turn left Pact
            sharper.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" asChild>
            <a href={REPO_URL} target="_blank" rel="noreferrer">
              <ExternalLink /> Code and case study
            </a>
          </Button>
          <Button
            onClick={() => {
              reset()
              navigate('/onboarding/connect')
            }}
          >
            <RotateCcw /> Replay demo
          </Button>
        </div>
      </div>
      <ol className="mt-4 grid grid-cols-5 gap-3">
        {LOOP_RECAP.map(([stage, text], i) => (
          <li key={stage} className="rounded-lg border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">
              {i + 1} · {stage}
            </p>
            <p className="mt-1 text-xs leading-relaxed">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/** /plan — progress against the agreed plan, and what Pact has learned. */
export default function PlanProgressPage() {
  const step = useDemo((s) => s.step)
  const learnedUndone = useDemo((s) => s.learnedUndone)
  const openerWords = useDemo((s) => s.openerWords)
  const autonomyOn = useDemo((s) => s.autonomyOn)
  const dismissed = useDemo((s) => s.dismissed)
  const p = progressFor(step, reached(step, 'usage'))
  const done = step === 'done'
  const pct = (a: number, b: number) => a / b

  const learned = [
    ...(reached(step, 'learned') && !learnedUndone
      ? [{ text: `You open first notes in under 15 words (you cut Pact's opener to ${openerWords}).`, source: "Your edit to Maya's note" }]
      : []),
    ...(reached(step, 'autonomy') && autonomyOn ? [{ text: 'First notes to new leads now run on their own, within your cap.', source: '6 of 6 clean approvals' }] : []),
    ...Object.entries(dismissed).map(([id, reason]) => ({
      text: `"${reason}" on ${DIGEST.find((d) => d.id === id)?.title.replace(/^\w/, (c) => c.toLowerCase()) ?? 'a digest item'}: Pact resurfaces it next week instead.`,
      source: 'Your dismissal',
    })),
    ...(reached(step, 'progress') ? [{ text: 'In fintech pilots, check alert setup on day 5, not at the week-2 deadline.', source: 'Quillstack pilot' }] : []),
    ...(done ? [{ text: 'Owning a missed promise early kept the pilot: alerts went from 1 to 6 teams in 4 days.', source: 'Quillstack outcome' }] : []),
  ]

  const rows = [
    { label: 'Qualified leads', actual: p.leads, plan: 32 },
    { label: 'Pilots started', actual: p.pilots, plan: 7 },
    { label: 'Paid conversions', actual: p.conversions, plan: 3 },
  ]

  return (
    <>
      <PageHeader icon={Target} crumbs={[{ label: 'Plan' }]} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1100px] space-y-6 px-6 pb-16 pt-8">
          {done && <FinishCard />}

          <div>
            <h1 className="text-2xl font-medium">Plan to $1M ARR</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">By {PLAN.deadline} · agreed in setup · Pact reports progress every turn</p>
          </div>

          <KpiTiles
            items={[
              { label: 'ARR', value: `$${p.arr}K` },
              { label: 'Gap to goal', value: `$${PLAN.goal - p.arr}K` },
              { label: 'Live pilots', value: done ? 3 : reached(step, 'usage') ? 4 : 3 },
              {
                label: 'Tasks Pact completed this week',
                value: `${p.tasksApproved + p.tasksOwn}`,
                hint: `North star. ${p.tasksApproved} you approved, ${p.tasksOwn} it ran on its own.`,
              },
            ]}
          />

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4">
            <SectionCard title="ARR against the goal" icon={GaugeIcon}>
              <Gauge value={p.arr * 1000} max={PLAN.goal * 1000} label={done ? 'Up $36K this turn: Quillstack converted' : `$${p.arr}K of $1M`} />
            </SectionCard>
            <SectionCard title="This month against the plan" icon={TrendingUp}>
              <table className="w-full text-[13px]">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    <th className="h-8 text-left font-normal">Stage</th>
                    <th className="text-right font-normal">Actual</th>
                    <th className="text-right font-normal">Plan</th>
                    <th className="w-48 pl-4 text-left font-normal">Attainment</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const a = pct(r.actual, r.plan)
                    return (
                      <tr key={r.label} className="border-b last:border-0">
                        <td className="h-10 font-medium">{r.label}</td>
                        <td className="text-right tabular-nums">{r.actual}</td>
                        <td className="text-right tabular-nums text-muted-foreground">{r.plan}</td>
                        <td className="pl-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                              <div className={cn('h-full rounded-full', a >= 0.8 ? 'bg-green-600' : a >= 0.5 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.min(100, a * 100)}%` }} />
                            </div>
                            <span className="w-10 text-right text-xs tabular-nums">{Math.round(a * 100)}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted-foreground">
                {reached(step, 'usage')
                  ? 'Leads are ahead of plan, mostly from first notes running on their own. Conversions are the gap: pilots decide the quarter.'
                  : 'Week one: the first signal is in. Leads and pilots build from here.'}
              </p>
            </SectionCard>
          </div>

          <SectionCard title="What Pact learned" icon={BrainCircuit} actions={<span className="text-xs text-muted-foreground">Only from your own deals and decisions</span>}>
            {learned.length === 0 ? (
              <p className="text-[13px] text-muted-foreground">Nothing yet. Every approve, edit, dismiss and outcome lands here.</p>
            ) : (
              <ul className="space-y-2.5">
                {learned.map((l) => (
                  <li key={l.text} className="flex items-start gap-2 text-[13px] leading-relaxed">
                    <BrainCircuit className="mt-0.5 size-3.5 shrink-0 text-violet-600" />
                    <span>
                      {l.text} <Citation label={l.source} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="ARR path to the goal" icon={TrendingUp} actions={<span className="text-xs text-muted-foreground">Red line: $1M goal</span>}>
            <TargetBarChart data={PLAN.path} target={1000} yLabel="ARR" format={kFormat} height={240} />
          </SectionCard>
        </div>
      </div>
    </>
  )
}
