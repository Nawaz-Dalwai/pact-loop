import { useState } from 'react'
import { ArrowUp, Mic } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { KpiTiles } from '@/components/shared/record'
import { PLAN } from '@/data/plan'
import { useQueueCount } from '@/demo/useQueue'
import { useCurrentUser, useUi } from '@/store'

/** Home: greeting, Ask Pact box, what needs the founder's call, progress to the goal. */
export default function Home() {
  const user = useCurrentUser()
  const setAskOpen = useUi((s) => s.setAskOpen)
  const queueCount = useQueueCount()
  const [prompt, setPrompt] = useState('')
  const firstName = user.name.split(' ')[0]
  const pct = Math.round((PLAN.arrToday / PLAN.goal) * 100)

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
          <h1 className="bg-linear-to-bl from-violet-500 to-blue-500 bg-clip-text text-4xl font-medium text-transparent">
            Hi {firstName}
          </h1>

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

          <section className="mt-12">
            <h2 className="text-2xl font-medium">Needs your call</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {queueCount === 0 ? 'Nothing waiting on you' : `${queueCount} waiting on your yes`}
            </p>
            {queueCount === 0 && (
              <div className="mt-4 rounded-lg border bg-background px-4 py-6 text-center text-[13px] text-muted-foreground">
                Nothing waiting. Pact is watching every email, call, meeting and outside signal.
              </div>
            )}
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-medium">Progress to $1M ARR</h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">Plan agreed · Pact reports progress every turn</p>
            <div className="mt-4 rounded-lg border bg-background p-4 shadow-xs">
              <div className="flex items-baseline justify-between">
                <p className="text-lg font-medium tabular-nums">
                  ${PLAN.arrToday}K <span className="text-[13px] font-normal text-muted-foreground">of $1M by {PLAN.deadline}</span>
                </p>
                <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-blue-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="mt-3">
              <KpiTiles
                items={[
                  { label: 'Leads this month', value: '0 of 32' },
                  { label: 'Pilots this month', value: '0 of 7' },
                  { label: 'Conversions this month', value: '0 of 3' },
                ]}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
