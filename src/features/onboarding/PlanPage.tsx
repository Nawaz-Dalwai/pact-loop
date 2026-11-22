import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Check, Lock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/input'
import { AssistantMessage } from '@/components/chat/Message'
import { KpiTiles, SectionCard } from '@/components/shared/record'
import { TargetBarChart } from '@/components/charts/TargetBarChart'
import type { ChatMessage } from '@/components/chat/types'
import { PLAN } from '@/data/plan'
import { useDemo } from '@/store'

const kFormat = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}M` : `$${n}K`)

/** Setup 3: Pact works back from the goal; the founder must agree the plan. */
export default function PlanPage() {
  const segments = useDemo((s) => s.segments)
  const planShown = useDemo((s) => s.planShown)
  const setPlanShown = useDemo((s) => s.setPlanShown)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()

  const focus = segments.length ? segments.join(' and ').toLowerCase() : 'dev tools and fintech'
  const message = useMemo<ChatMessage>(() => ({
    id: 'plan',
    role: 'assistant',
    context: [
      'Read 18 months of deal history',
      'Measured conversion at each stage',
      'Checked pilot length and outcomes',
      'Weighted the segments you chose',
    ],
    thoughtSeconds: 9,
    blocks: [
      {
        type: 'p',
        text: `Working back from **$1M ARR by ${PLAN.deadline}**: you're at **$310K**, so the gap is **$690K**. At your average deal of **$24K ARR**, that's **29 new customers**.`,
      },
      {
        type: 'table',
        columns: ['Stage', 'Conversion', `Needed by ${PLAN.deadlineShort}`, 'Per month'],
        rows: [
          ['Qualified leads', 'From signals and your network', '320', '32'],
          ['Pilots started', '20% of leads', '64', '7'],
          ['Paid conversions', '45% of pilots', '29', '3'],
        ],
      },
      { type: 'p', text: `The plan focuses on **${focus}**. I'll report progress against it every turn, and adjust it with you when the numbers move.` },
    ],
  }), [focus])

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 pb-16 pt-10">
      <h2 className="text-2xl font-medium">Plan from your goal</h2>
      <p className="mt-1 text-xs font-medium text-muted-foreground">Pact works back to the leads, pilots and conversions it takes</p>

      <div className="mt-6 space-y-1">
        <Label>Goal</Label>
        <div className="flex h-9 items-center gap-2 rounded-lg border bg-muted/40 px-3 text-[13px]">
          <TrendingUp className="size-4 text-muted-foreground" />
          <span className="flex-1 font-medium">$1M ARR by {PLAN.deadline}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="size-3" /> Set for this demo
          </span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border bg-background p-4 shadow-xs">
        <AssistantMessage message={message} animate={!planShown} onDone={setPlanShown} />
      </div>

      {planShown && (
        <div className="mt-4 space-y-4">
          <KpiTiles
            items={[
              { label: 'ARR today', value: '$310K' },
              { label: 'Gap to goal', value: '$690K' },
              { label: 'Pilots needed', value: 64 },
              { label: 'Conversions needed', value: 29 },
            ]}
          />
          <SectionCard title="ARR path to the goal" icon={TrendingUp} actions={<span className="text-xs text-muted-foreground">Red line: $1M goal</span>}>
            <TargetBarChart data={PLAN.path} target={1000} yLabel="ARR" format={kFormat} height={260} />
          </SectionCard>
          <div className="flex items-center justify-end gap-3 pt-2">
            <span className="text-xs text-muted-foreground">You can change the plan with Pact at any time</span>
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
