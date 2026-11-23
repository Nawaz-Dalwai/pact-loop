import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Check, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { AssistantMessage } from '@/components/chat/Message'
import { KpiTiles, SectionCard } from '@/components/shared/record'
import { TargetBarChart } from '@/components/charts/TargetBarChart'
import type { ChatMessage } from '@/components/chat/types'
import { AVG_DEAL, GOALS, LEAD_TO_PILOT, PILOT_WIN, PLAN, goalLabel, planFor } from '@/data/plan'
import { profileText } from '@/data/profile'
import { useDemo } from '@/store'
import { cn } from '@/lib/utils'
import { useRevealScroll } from '@/lib/useRevealScroll'

const kFormat = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}M` : `$${n}K`)
const pct = (x: number) => `${Math.round(x * 100)}%`

/** Setup 3: the founder sets the goal; Pact works back from it; the founder agrees the plan. */
export default function PlanPage() {
  const segments = useDemo((s) => s.segments)
  const criteria = useDemo((s) => s.criteria)
  const goal = useDemo((s) => s.goal)
  const billing = useDemo((s) => s.connected.includes('billing'))
  const planShown = useDemo((s) => s.planShown)
  const setPlanShown = useDemo((s) => s.setPlanShown)
  const patch = useDemo((s) => s.patch)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()

  const focus = profileText(segments, criteria)
  const messageRef = useRevealScroll(!!goal)
  const agreeRef = useRevealScroll(!!goal && planShown, 'end')
  const plan = goal ? planFor(goal) : null
  const message = useMemo<ChatMessage | null>(
    () =>
      plan && {
        id: 'plan',
        role: 'assistant',
        context: [
          'Read 18 months of deal history',
          'Measured conversion at each stage',
          'Checked pilot length and outcomes',
          'Weighted the profile you confirmed',
          'Matched open threads to the profile',
        ],
        thoughtSeconds: 9,
        blocks: [
          {
            type: 'p',
            text: `Working back from **${goalLabel(plan.goal)} in new ARR by ${PLAN.deadline}**: at your average deal of **~$${AVG_DEAL}K**, that's **${plan.deals} new customers**. Your pilots convert at ${pct(PILOT_WIN)}, so you need **${plan.pilots} pilots**, about **${plan.pilotsPerWeek} a week**.`,
          },
          {
            type: 'table',
            columns: ['Stage', 'Conversion', `Needed by ${PLAN.deadlineShort}`, 'Per month'],
            rows: [
              ['Qualified leads', 'From signals and your network', String(plan.leads), String(plan.perMonth.leads)],
              ['Pilots started', `${pct(LEAD_TO_PILOT)} of leads`, String(plan.pilots), String(plan.perMonth.pilots)],
              ['Paid conversions', `${pct(PILOT_WIN)} of pilots`, String(plan.deals), String(plan.perMonth.deals)],
            ],
          },
          { type: 'p', text: `The plan focuses on **${focus}**.` },
          {
            type: 'p',
            text: billing
              ? `It's on top of the **$${PLAN.arrToday}K ARR** you bill today across 7 customers [[Stripe invoices]].`
              : `It's on top of the **~$${PLAN.arrToday}K ARR** you have today. Connect billing any time and I'll track it from your invoices.`,
          },
          {
            type: 'p',
            text: "**Start with what you have:** **12 of your 17 open threads** fit this profile. Before any new outbound, I'll draft a note to revive each one, for your yes.",
          },
          { type: 'p', text: "I'll report progress against the plan every turn, and adjust it with you when the numbers move." },
        ],
      },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [goal, focus, billing],
  )

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 pb-16 pt-10">
      <h2 className="text-2xl font-medium">Plan from your goal</h2>
      <p className="mt-1 text-xs font-medium text-muted-foreground">Set the goal; Pact works back to the leads, pilots and conversions it takes</p>

      <div className="mt-6 space-y-1">
        <Label>Your goal: new ARR by {PLAN.deadline}</Label>
        <div className={cn('grid grid-cols-3 gap-2 rounded-lg', !goal && 'demo-pulse')}>
          {GOALS.map((g) => (
            <button
              key={g}
              onClick={() => patch({ goal: g })}
              className={cn(
                'flex h-10 items-center justify-center gap-1.5 rounded-lg border text-[13px] font-medium transition-colors',
                goal === g ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent',
              )}
            >
              {goal === g && <Check className="size-3.5" />}
              {goalLabel(g)} new ARR
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div ref={messageRef} className="mt-6 scroll-mt-6 rounded-lg border bg-background p-4 shadow-xs">
          <AssistantMessage message={message} animate={!planShown} onDone={setPlanShown} />
        </div>
      )}

      {plan && planShown && (
        <div className="mt-4 space-y-4">
          <KpiTiles
            items={[
              { label: 'New ARR goal', value: goalLabel(plan.goal) },
              { label: 'Average deal', value: `~$${AVG_DEAL}K` },
              { label: 'Pilots needed', value: plan.pilots },
              { label: 'New customers needed', value: plan.deals },
            ]}
          />
          <SectionCard
            title="New ARR path to the goal"
            icon={TrendingUp}
            actions={<span className="text-xs text-muted-foreground">Red line: {goalLabel(plan.goal)} goal</span>}
          >
            <TargetBarChart data={plan.path} target={plan.goal} yLabel="New ARR" format={kFormat} height={260} />
          </SectionCard>
          <div ref={agreeRef} className="flex items-center justify-end gap-3 pt-2 pb-4">
            <span className="text-xs text-muted-foreground">You can change the goal and the plan with Pact at any time</span>
            <Button
              className="demo-pulse"
              onClick={() => {
                next()
                toast.success('Plan agreed', { description: 'Pact will report progress every turn.' })
                navigate('/home')
              }}
            >
              <Check /> Agree plan
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
