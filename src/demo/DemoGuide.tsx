import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router'
import { ArrowRight, Check, ChevronDown, FastForward, Info, LocateFixed, RotateCcw, Sparkles, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StageTracker } from '@/components/shared/record'
import { useDemo } from '@/store'
import { cn } from '@/lib/utils'
import { LOOP_STAGES, SETUP_STAGES, TOTAL_STEPS, nextStep, onPath, stepIndex, stepInfo, stepsOf, type StepId } from './script'

export const PHASE_LABEL = { setup: 'Setup', turn1: 'Turn 1 · Find and Win', turn2: 'Turn 2 · Deliver and Grow', done: 'Complete' } as const

const stepLabel = (step: StepId) =>
  stepInfo(step).phase === 'done' ? 'Done' : `Step ${Math.min(TOTAL_STEPS, stepIndex(step) + 1)} of ${TOTAL_STEPS}`

/**
 * Scroll to what the visitor should click next (the pulsing element on screen) and flash it.
 * Returns false when nothing on this screen is waiting for a click.
 */
function spotlightTarget() {
  const targets = [...document.querySelectorAll<HTMLElement>('.demo-pulse')].filter(
    (e) => !e.closest('[data-demo-guide]') && e.getClientRects().length > 0,
  )
  // the page's own call to action beats the top bar's shortcut to it
  const el = targets.find((e) => !e.closest('header')) ?? targets[0]
  if (!el) return false
  el.scrollIntoView({ block: 'center', behavior: 'smooth' })
  el.classList.remove('demo-spotlight')
  void el.offsetWidth // restart the animation
  el.classList.add('demo-spotlight')
  window.setTimeout(() => el.classList.remove('demo-spotlight'), 2800)
  return true
}

/** "Step 6 of 16": opens the list of this phase's steps, done / now / next. */
function StepPill({ step, off }: { step: StepId; off: boolean }) {
  const info = stepInfo(step)
  const steps = info.phase === 'done' ? [] : stepsOf(info.phase)
  const current = stepIndex(step)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex h-7 shrink-0 items-center gap-1 rounded-full px-3 text-xs font-semibold text-white',
            off ? 'bg-amber-600 hover:bg-amber-700' : 'bg-violet-600 hover:bg-violet-700',
          )}
        >
          {stepLabel(step)}
          <ChevronDown className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[380px] p-0">
        <div className="border-b px-3 py-2">
          <p className="text-[13px] font-medium">{PHASE_LABEL[info.phase]}</p>
          <p className="text-xs text-muted-foreground">
            {info.phase === 'done' ? 'You ran the whole loop.' : 'Where you are in this part of the demo'}
          </p>
        </div>
        <ol className="max-h-96 overflow-y-auto py-1">
          {steps.map((s) => {
            const i = stepIndex(s.id)
            const done = i < current
            const now = i === current
            return (
              <li key={s.id} className={cn('flex gap-2.5 px-3 py-2', now && 'bg-violet-50')}>
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums',
                    done && 'bg-foreground text-background',
                    now && 'bg-violet-600 text-white',
                    !done && !now && 'border text-muted-foreground',
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-[13px] leading-snug', now ? 'font-semibold' : done ? 'text-muted-foreground' : '')}>{s.hint}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.stage} · on {s.where}
                    {now && ' · you are here'}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </PopoverContent>
    </Popover>
  )
}

/**
 * The guide bar on every screen: which turn and stage, the exact step and what to do,
 * "Show me" to find the next click, "Take me there" when the visitor has wandered off,
 * Skip time when the story waits on the outside world, and Restart.
 */
export function DemoGuide() {
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const reset = useDemo((s) => s.reset)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const info = stepInfo(step)
  const stages = info.phase === 'setup' ? SETUP_STAGES : LOOP_STAGES
  const off = info.phase !== 'done' && !onPath(step, pathname)

  return (
    <div
      data-demo-guide
      className={cn(
        'flex h-16 shrink-0 items-center gap-4 border-b px-4 transition-colors',
        off ? 'border-amber-300 bg-amber-50' : 'border-violet-200 bg-violet-50/70',
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1.5">
            <Badge tone="violet">
              <Sparkles /> Demo
            </Badge>
            <Info className="size-3.5 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-80 text-[13px] leading-relaxed">
          <p className="font-medium">An interactive prototype of Pact</p>
          <p className="mt-1.5 text-muted-foreground">
            Pact is a revenue system that suggests the next move, waits for the founder's yes, and learns from every
            decision. Follow this bar to run its loop end to end: Signal, Act, Surface, Decide, Learn.
          </p>
          <p className="mt-1.5 text-muted-foreground">
            Lost? <b className="font-medium text-foreground">Show me</b> points at the next click, and{' '}
            <b className="font-medium text-foreground">Take me there</b> brings you back to the right screen.
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Frontend only. People, companies and numbers are fictional demo data, saved in your browser.
          </p>
        </PopoverContent>
      </Popover>

      <div className="w-[300px] shrink-0 2xl:w-[400px]">
        <StageTracker stages={stages} current={info.stage} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <StepPill step={step} off={off} />
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-[11px] font-semibold uppercase tracking-wide', off ? 'text-amber-700' : 'text-violet-700')}>
            {PHASE_LABEL[info.phase]}
            {info.phase !== 'done' && ` · ${info.stage}`}
          </p>
          <p className="line-clamp-2 text-sm font-semibold leading-snug" aria-live="polite">
            {off ? (
              <>
                <TriangleAlert className="mr-1 inline size-4 -translate-y-px text-amber-600" />
                You've left the path. {info.hint} <span className="font-normal text-muted-foreground">(on {info.where})</span>
              </>
            ) : (
              info.hint
            )}
          </p>
        </div>
      </div>

      {off ? (
        <Button size="sm" className="demo-pulse" onClick={() => navigate(info.route)}>
          Take me there <ArrowRight />
        </Button>
      ) : (
        !info.skip &&
        info.phase !== 'done' && (
          <Button size="sm" variant="outline" className="bg-background" onClick={() => spotlightTarget() || navigate(info.route)}>
            <LocateFixed /> Show me
          </Button>
        )
      )}

      {info.skip && (
        <Button
          size="sm"
          variant="outline"
          className="demo-pulse bg-background"
          onClick={() => {
            next()
            navigate(stepInfo(nextStep(step)).route)
          }}
        >
          {info.skip} <FastForward />
        </Button>
      )}

      <Tooltip content="Restart demo" side="bottom">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Restart demo"
          onClick={() => {
            reset()
            navigate('/onboarding/connect')
          }}
        >
          <RotateCcw />
        </Button>
      </Tooltip>
    </div>
  )
}

/** True while a modal (dialog, sheet, menu) is open: Radix turns off pointer events on the page behind it. */
function useModalOpen() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const check = () => setOpen(document.body.style.pointerEvents === 'none')
    const mo = new MutationObserver(check)
    mo.observe(document.body, { attributes: true, attributeFilter: ['style'] })
    check()
    return () => mo.disconnect()
  }, [])
  return open
}

/**
 * A dialog or sheet dims the guide bar, so while one is open the exact step floats
 * above it, bottom left, clear of the sheets on the right.
 */
export function StepCoach() {
  const step = useDemo((s) => s.step)
  const modal = useModalOpen()
  const info = stepInfo(step)
  if (!modal || info.phase === 'done') return null

  return createPortal(
    <div
      role="status"
      className="pointer-events-none fixed bottom-4 left-4 z-[60] w-[400px] rounded-xl border border-violet-200 bg-background p-3 shadow-lg"
    >
      <div className="flex items-center gap-2">
        <span className="flex h-6 items-center rounded-full bg-violet-600 px-2.5 text-xs font-semibold text-white">{stepLabel(step)}</span>
        <span className="truncate text-xs font-medium text-violet-700">
          {PHASE_LABEL[info.phase]} · {info.stage}
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug">{info.hint}</p>
    </div>,
    document.body,
  )
}
