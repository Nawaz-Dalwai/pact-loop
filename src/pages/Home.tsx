import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowRight, ArrowUp, ChevronRight, Mic, Radio, ShieldCheck, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { AvatarStack } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { KpiTiles } from '@/components/shared/record'
import { StatusBadge } from '@/components/shared/pills'
import { OfferDialog } from '@/features/autonomy/OfferDialog'
import { PLAN, goalLabel, planFor, progressFor } from '@/data/plan'
import { DIGEST } from '@/demo/useQueue'
import { reached } from '@/demo/script'
import { pilotView, sourcesPhrase } from '@/demo/sources'
import { useCurrentUser, useDemo, useGoal, useUi } from '@/store'

/** A new signal: what Pact saw and what it prepared, one click from the decision. */
function SignalCard({ icon: Icon, label, title, sub, cta, onOpen }: { icon: LucideIcon; label: string; title: string; sub: string; cta: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="demo-pulse mt-6 flex w-full items-center gap-3 rounded-xl border border-violet-200 bg-violet-50/50 p-4 text-left transition-colors hover:bg-violet-50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background">
        <Icon className="size-4 text-violet-600" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-violet-700">{label}</span>
        <span className="mt-1 block text-[13px] font-medium leading-snug">{title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{sub}</span>
      </span>
      <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground">
        {cta} <ArrowRight className="size-3.5" />
      </span>
    </button>
  )
}

/** Home: greeting, the new signal, Ask Pact, what needs the founder's call, today's calls, progress. */
export default function Home() {
  const user = useCurrentUser()
  const setAskOpen = useUi((s) => s.setAskOpen)
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const patch = useDemo((s) => s.patch)
  const dismissed = useDemo((s) => s.dismissed)
  const offerDeferred = useDemo((s) => s.offerDeferred)
  const autonomyOn = useDemo((s) => s.autonomyOn)
  const cap = useDemo((s) => s.autonomyCap)
  const connected = useDemo((s) => s.connected)
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const firstName = user.name.split(' ')[0]
  const goal = useGoal()
  const plan = planFor(goal)
  const p = progressFor(step, reached(step, 'usage'))
  const pct = Math.round((p.arr / goal) * 100)

  const digestLeft = DIGEST.filter((d) => !dismissed[d.id]).length
  const waiting = [
    ...(reached(step, 'signal') && !reached(step, 'offer') ? [{ type: 'Draft', title: 'First note to Maya Okafor at Halcyon Labs' }] : []),
    ...(reached(step, 'usage') && !reached(step, 'progress') ? [{ type: 'Risk', title: 'Renewal risk: Quillstack pilot' }] : []),
    ...(digestLeft ? [{ type: 'Digest', title: `${digestLeft} from yesterday's digest` }] : []),
  ]
  const callToday = reached(step, 'offer') && !reached(step, 'usage')
  const pilot = pilotView(connected)

  const submit = () => {
    if (!prompt.trim()) return
    setAskOpen(true)
    setPrompt('')
  }

  return (
    <>
      <TopBar />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-6 pb-16 pt-16">
          <h1 className="bg-linear-to-bl from-violet-500 to-blue-500 bg-clip-text text-4xl font-medium text-transparent">Hi {firstName}</h1>

          {step === 'signal' && (
            <SignalCard
              icon={Radio}
              label="New signal · Halcyon Labs · fit 94/100"
              title="Halcyon raised a $6M seed. Maya Okafor, your champion at Brightline, now runs platform there."
              sub="Pact researched the account and drafted a first note to Maya. Nothing sends without your yes."
              cta="Open what Pact prepared"
              onOpen={() => {
                next()
                navigate('/queue', { state: { open: 'halcyon' } })
              }}
            />
          )}
          {step === 'usage' && (
            <SignalCard
              icon={TriangleAlert}
              label="Renewal risk · Quillstack pilot · health 78 → 41"
              title={pilot.notification}
              sub={pilot.known ? 'Pact found the cause and drafted a check-in that owns the miss.' : "Pact drafted a check-in that asks how it's going."}
              cta="Open what Pact found"
              onOpen={() => {
                next()
                navigate('/queue', { state: { open: 'checkin' } })
              }}
            />
          )}

          <div className="mt-6 rounded-xl border bg-background p-3 shadow-xs focus-within:ring-2 focus-within:ring-ring/30">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              rows={2}
              placeholder="Ask Pact anything…"
              className="w-full resize-none bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-end gap-1.5">
              <button className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" aria-label="Voice">
                <Mic className="size-4" />
              </button>
              <button
                onClick={submit}
                disabled={!prompt.trim()}
                className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-30"
                aria-label="Send"
              >
                <ArrowUp className="size-4" />
              </button>
            </div>
          </div>

          {step === 'offer' && offerDeferred && (
            <button
              onClick={() => patch({ offerDeferred: false })}
              className="demo-pulse mt-8 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-table-background-hover"
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-violet-50">
                <ShieldCheck className="size-4 text-violet-600" />
              </span>
              <span className="flex-1">
                <span className="block text-[13px] font-medium">Pact asked to send first notes on its own</span>
                <span className="block text-xs text-muted-foreground">6 of 6 approved · set a cap to decide</span>
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}

          <section className="mt-12">
            <h2 className="text-2xl font-medium">Needs your call</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {waiting.length === 0 ? 'Nothing waiting on you' : 'Waiting on your yes · nothing runs without it'}
            </p>
            {waiting.length === 0 ? (
              <div className="mt-4 rounded-lg border bg-background px-4 py-6 text-center text-[13px] text-muted-foreground">
                Nothing waiting. Pact is watching every {sourcesPhrase(connected)}, and outside signals.
              </div>
            ) : (
              <ul className="mt-4 divide-y rounded-lg border bg-background">
                {waiting.map((w) => (
                  <li key={w.title}>
                    <Link to="/queue" className="flex items-center gap-3 px-4 py-2.5 hover:bg-table-background-hover">
                      <StatusBadge status={w.type} />
                      <span className="flex-1 text-[13px]">{w.title}</span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {callToday && (
            <section className="mt-12">
              <h2 className="text-2xl font-medium">On deck</h2>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                {connected.includes('calendar') ? 'Your next call' : 'Agreed by email · invite sent from your Gmail'} · brief prepared by Pact
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-lg border bg-background p-4 shadow-xs">
                <div className="h-12 w-0.5 rounded-full bg-neutral-400" />
                <div className="min-w-0 flex-1">
                  <Link to="/accounts/halcyon/brief" className="text-sm font-medium hover:underline">
                    Halcyon Labs × {user.company} · intro call
                  </Link>
                  <p className="text-xs text-muted-foreground">Thursday, 2:00 PM - 2:30 PM</p>
                  <div className="mt-1.5">
                    <AvatarStack names={['Maya Okafor', 'Daniel Reyes', user.name]} />
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate('/accounts/halcyon/brief')}>
                  <Sparkles /> View call brief
                </Button>
              </div>
            </section>
          )}

          {autonomyOn && (
            <section className="mt-12">
              <h2 className="text-2xl font-medium">Running on its own</h2>
              <p className="mt-1 text-xs font-medium text-muted-foreground">Earned by approval · within your {cap} monthly cap</p>
              <Link to="/autonomy" className="mt-4 flex items-center gap-3 rounded-lg border bg-background px-4 py-2.5 hover:bg-table-background-hover">
                <ShieldCheck className="size-4 text-violet-600" />
                <span className="flex-1 text-[13px]">First notes to new leads</span>
                <span className="text-xs text-muted-foreground">{reached(step, 'usage') ? '4 sent this week' : 'No runs yet'}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            </section>
          )}

          <section className="mt-12">
            <h2 className="text-2xl font-medium">Progress to {goalLabel(goal)} new ARR</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Plan agreed · Pact reports progress every turn</p>
            <Link to="/plan" className="mt-4 block rounded-lg border bg-background p-4 shadow-xs hover:bg-table-background-hover">
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-medium tabular-nums">
                  ${p.arr}K <span className="text-[13px] font-normal text-muted-foreground">of {goalLabel(goal)} new ARR by {PLAN.deadline}</span>
                </p>
                <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-blue-700" style={{ width: `${pct}%` }} />
              </div>
            </Link>
            <div className="mt-3">
              <KpiTiles
                items={[
                  { label: 'Leads this month', value: `${p.leads} of ${plan.perMonth.leads}` },
                  { label: 'Pilots this month', value: `${p.pilots} of ${plan.perMonth.pilots}` },
                  { label: 'Conversions this month', value: `${p.conversions} of ${plan.perMonth.deals}` },
                ]}
              />
            </div>
          </section>
        </div>
      </div>

      <OfferDialog open={step === 'offer' && !offerDeferred} onOpenChange={(v) => !v && patch({ offerDeferred: true })} />
    </>
  )
}
