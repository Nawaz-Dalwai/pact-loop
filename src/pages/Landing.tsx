import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, ExternalLink, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, Label } from '@/components/ui/input'
import { PactMark, PactWordmark } from '@/components/layout/Logo'
import { MIN_WIDTH, useWindowWidth } from '@/lib/useWindowWidth'
import { REPO_URL } from '@/features/plan/PlanProgressPage'
import { stepInfo } from '@/demo/script'
import { DEFAULT_FOUNDER, useDemo } from '@/store'

/** The front door: what Pact is, how long the demo takes, and one button to start (or continue). */
export default function Landing() {
  const step = useDemo((s) => s.step)
  const reset = useDemo((s) => s.reset)
  const patch = useDemo((s) => s.patch)
  const founder = useDemo((s) => s.founder)
  const custom = founder.name !== DEFAULT_FOUNDER.name || founder.company !== DEFAULT_FOUNDER.company
  // the founder plays themselves; left blank, they play Priya at Tracelane
  const [name, setName] = useState(custom ? founder.name : '')
  const [company, setCompany] = useState(custom ? founder.company : '')
  const go = (fresh: boolean) => {
    patch({ founder: { name: name.trim(), company: company.trim() } })
    if (fresh) reset()
    navigate(fresh ? '/onboarding/connect' : stepInfo(step).route)
  }
  const navigate = useNavigate()
  const wide = useWindowWidth() >= MIN_WIDTH
  const started = step !== 'connect'

  useEffect(() => {
    document.title = 'Pact · Interactive demo'
  }, [])

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between px-6">
        <PactWordmark />
        <a href={REPO_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          Code and case study <ExternalLink className="size-3.5" />
        </a>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[560px] text-center">
          <PactMark className="mx-auto size-14" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-violet-700">Interactive prototype</p>
          <h1 className="mt-2 bg-linear-to-bl from-violet-500 to-blue-500 bg-clip-text text-4xl font-medium text-transparent">
            The Agentic Revenue OS
          </h1>
          <p className="mx-auto mt-4 max-w-[480px] text-[15px] leading-relaxed text-muted-foreground">
            Run a seed-stage startup's revenue with Pact. It finds the deal, drafts the work and learns from every decision.
            You only decide.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            {wide ? (
              <>
                <form
                  className="grid w-full max-w-[440px] grid-cols-2 gap-3 text-left"
                  onSubmit={(e) => {
                    e.preventDefault()
                    go(false)
                  }}
                >
                  <div className="space-y-1">
                    <Label htmlFor="founder-name">Your name</Label>
                    <Input id="founder-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={DEFAULT_FOUNDER.name} maxLength={40} autoComplete="name" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="founder-company">Your company</Label>
                    <Input id="founder-company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder={DEFAULT_FOUNDER.company} maxLength={40} autoComplete="organization" />
                  </div>
                  <p className="col-span-2 -mt-1 text-xs text-muted-foreground">Optional · you'll play the founder. Leave blank to play Priya at Tracelane.</p>
                  <button type="submit" hidden />
                </form>
                <Button size="lg" className="mt-2 h-11 px-6 text-sm" onClick={() => go(false)}>
                  {started ? 'Continue the demo' : 'Start the interactive demo'} <ArrowRight />
                </Button>
                {started && (
                  <button
                    onClick={() => go(true)}
                    className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  >
                    Start over
                  </button>
                )}
              </>
            ) : (
              <p className="flex items-center gap-2 rounded-lg border px-4 py-2.5 text-[13px] text-muted-foreground">
                <Monitor className="size-4" /> Open this on a desktop ({MIN_WIDTH}px or wider) to try it
              </p>
            )}
            <p className="text-xs text-muted-foreground">3 workflows · about 3 minutes · no sign-up</p>
          </div>
        </div>
      </main>

      <footer className="shrink-0 px-6 py-5 text-center text-xs text-muted-foreground">
        A fictional company, people and numbers · nothing leaves your browser
      </footer>
    </div>
  )
}
