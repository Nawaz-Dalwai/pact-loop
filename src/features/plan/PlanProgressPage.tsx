import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { BrainCircuit, CircleCheck, Send, ExternalLink, Gauge as GaugeIcon, RotateCcw, Target, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { KpiTiles, SectionCard } from '@/components/shared/record'
import { Gauge } from '@/components/charts/Gauge'
import { TargetBarChart } from '@/components/charts/TargetBarChart'
import { Citation } from '@/components/chat/inline'
import { PLAN, goalLabel, planFor, pointsFor, progressFor, trustedWork } from '@/data/plan'
import { DIGEST } from '@/demo/useQueue'
import { reached } from '@/demo/script'
import { pilotView } from '@/demo/sources'
import { useDemo, useGoal } from '@/store'
import { cn } from '@/lib/utils'
import { useRevealScroll } from '@/lib/useRevealScroll'

export const REPO_URL = 'https://github.com/Nawaz-Dalwai/pact-loop'
const kFormat = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}M` : `$${n}K`)

const LOOP_RECAP = [
  ['Signal', "A past champion's company raised a round; a pilot's health fell from 78 to 41."],
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
            One turn found and won a new account; the next delivered on a pilot, turned it into revenue and drafted the
            expansion. Every turn left Pact sharper.
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
  const connected = useDemo((s) => s.connected)
  const learnedUndone = useDemo((s) => s.learnedUndone)
  const openerWords = useDemo((s) => s.openerWords)
  const autonomyOn = useDemo((s) => s.autonomyOn)
  const dismissed = useDemo((s) => s.dismissed)
  const halcyonSent = useDemo((s) => s.halcyonSent)
  const checkinSent = useDemo((s) => s.checkinSent)
  const expansionSent = useDemo((s) => s.expansionSent)
  const patch = useDemo((s) => s.patch)
  const navigate = useNavigate()
  const goal = useGoal()
  const plan = planFor(goal)
  const p = progressFor(step, reached(step, 'usage'))
  const done = step === 'done'
  const topRef = useRevealScroll(done)
  const pct = (a: number, b: number) => a / b
  const work = trustedWork(step, {
    reachedUsage: reached(step, 'usage'),
    reachedBrief: reached(step, 'offer'),
    halcyonSent,
    autonomyOn,
    checkinSent,
    expansionSent,
  })

  const learned = [
    ...(reached(step, 'offer') && !learnedUndone
      ? [{ text: `You open first notes in under 15 words (you cut Pact's opener to ${openerWords}).`, source: "Your edit to Maya's note" }]
      : []),
    ...(reached(step, 'offer')
      ? [{ text: 'Past champions at new companies reply 31% of the time, against 4% for cold notes. Pact now sources from champion moves.', source: "Maya's reply · 18 months of sent mail" }]
      : []),
    ...(reached(step, 'autonomy') && autonomyOn ? [{ text: 'First notes to new leads now run on their own, within your cap.', source: '6 of 6 clean approvals' }] : []),
    ...Object.entries(dismissed).map(([id, reason]) => ({
      text: `"${reason}" on ${DIGEST.find((d) => d.id === id)?.title.replace(/^\w/, (c) => c.toLowerCase()) ?? 'a digest item'}: Pact resurfaces it next week instead.`,
      source: 'Your dismissal',
    })),
    ...(reached(step, 'progress') ? [{ text: pilotView(connected).dayFive, source: 'Quillstack pilot' }] : []),
    ...(done ? [{ text: pilotView(connected).outcome, source: 'Quillstack outcome' }] : []),
    ...(done ? [{ text: 'Converted pilots with room to grow get an expansion quote within 30 days: 14 seats drafted for Quillstack.', source: pilotView(connected).expansion.context }] : []),
  ]

  const rows = [
    { label: 'Qualified leads', actual: p.leads, plan: plan.perMonth.leads },
    { label: 'Pilots started', actual: p.pilots, plan: plan.perMonth.pilots },
    { label: 'Paid conversions', actual: p.conversions, plan: plan.perMonth.deals },
  ]

  return (
    <>
      <PageHeader icon={Target} crumbs={[{ label: 'Plan' }]} />
      <div className="flex-1 overflow-y-auto">
        <div ref={topRef} className="mx-auto w-full max-w-[1100px] scroll-mt-8 space-y-6 px-6 pb-16 pt-8">
          {done && !expansionSent && (
            <section className="flex items-center gap-4 rounded-xl border border-violet-200 bg-background p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <Send className="size-4 text-violet-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Grow · Quillstack just converted</p>
                <p className="mt-1 text-[13px] font-medium">Pact drafted an expansion quote to Grace Liu: 14 more seats, about $8K ARR</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{pilotView(connected).expansion.meta}</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/queue')}>
                View draft
              </Button>
              <Button
                className="demo-pulse"
                onClick={() => {
                  patch({ expansionSent: true })
                  toast.success('Expansion quote sent to Grace Liu', { description: '14 seats, about $8K ARR · Pact will watch for the reply.' })
                }}
              >
                <Send /> Approve & send
              </Button>
            </section>
          )}
          {done && <FinishCard />}

          <div>
            <h1 className="text-2xl font-medium">Plan to {goalLabel(goal)} in new ARR</h1>
            <p className="mt-1 text-xs font-medium text-muted-foreground">By {PLAN.deadline} · agreed in setup · Pact reports progress every turn</p>
          </div>

          <KpiTiles
            items={[
              { label: 'New ARR', value: `$${p.arr}K`, hint: `On top of the $${PLAN.arrToday}K ARR you had when the plan started` },
              { label: 'Gap to goal', value: `$${goal - p.arr}K` },
              { label: 'Live pilots', value: done ? 3 : reached(step, 'usage') ? 4 : 3 },
              {
                label: 'Trusted revenue work this week',
                value: work.total,
                hint: 'North star: kept work only, weighted by stakes (x1, x3, x10), x2 when Pact ran it on its own',
              },
            ]}
          />

          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-4">
            <SectionCard title="New ARR against the goal" icon={GaugeIcon}>
              <Gauge value={p.arr * 1000} max={goal * 1000} label={done ? 'Up $36K this turn: Quillstack converted' : `$${p.arr}K of ${goalLabel(goal)}`} />
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

          <SectionCard
            title="Trusted revenue work this week"
            icon={CircleCheck}
            actions={<span className="text-xs text-muted-foreground">The north star · kept work only, weighted by stakes, ×2 when Pact ran it alone</span>}
          >
            <table className="w-full text-[13px]">
              <thead className="text-muted-foreground">
                <tr className="border-b">
                  <th className="h-8 text-left font-normal">Work</th>
                  <th className="text-left font-normal">Stakes</th>
                  <th className="text-right font-normal">Count</th>
                  <th className="text-right font-normal">Points</th>
                </tr>
              </thead>
              <tbody>
                {work.items.map((w) => (
                  <tr key={w.what} className={cn('border-b', !w.kept && 'text-muted-foreground')}>
                    <td className="h-10">
                      {w.what}
                      {w.alone && <span className="ml-1.5 text-xs text-violet-700">ran on its own ×2</span>}
                      {w.note && <span className="ml-1.5 text-xs">· {w.note}</span>}
                    </td>
                    <td>
                      {w.stakes} ×{w.stakes === 'Low' ? 1 : w.stakes === 'Medium' ? 3 : 10}
                    </td>
                    <td className="text-right tabular-nums">{w.count}</td>
                    <td className="text-right tabular-nums">{w.kept ? pointsFor(w) : 'Not counted'}</td>
                  </tr>
                ))}
                <tr>
                  <td className="h-10 font-medium" colSpan={3}>
                    Total
                  </td>
                  <td className="text-right font-medium tabular-nums">{work.total}</td>
                </tr>
              </tbody>
            </table>
          </SectionCard>

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

          <SectionCard title="New ARR path to the goal" icon={TrendingUp} actions={<span className="text-xs text-muted-foreground">Red line: {goalLabel(goal)} goal</span>}>
            <TargetBarChart data={plan.path} target={goal} yLabel="New ARR" format={kFormat} height={240} />
          </SectionCard>
        </div>
      </div>
    </>
  )
}
