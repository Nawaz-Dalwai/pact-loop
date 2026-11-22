import { useNavigate } from 'react-router'
import { FastForward, Info, RotateCcw, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { StageTracker } from '@/components/shared/record'
import { useDemo } from '@/store'
import { LOOP_STAGES, SETUP_STAGES, TOTAL_STEPS, nextStep, stepIndex, stepInfo } from './script'

const PHASE_LABEL = { setup: 'Setup', turn1: 'Turn 1 · Find and Win', turn2: 'Turn 2 · Deliver and Grow', done: 'Complete' } as const

/**
 * Slim strip on every screen: where the visitor is in the loop, what to do next,
 * Skip time when the story waits on the outside world, and Restart.
 */
export function DemoGuide() {
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const reset = useDemo((s) => s.reset)
  const navigate = useNavigate()
  const info = stepInfo(step)
  const stages = info.phase === 'setup' ? SETUP_STAGES : LOOP_STAGES
  const n = Math.min(TOTAL_STEPS, stepIndex(step) + 1)

  return (
    <div className="flex h-12 shrink-0 items-center gap-4 border-b bg-sidebar px-4">
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
            decision. Follow the strip to run its loop end to end: Signal, Act, Surface, Decide, Learn.
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Frontend only. People, companies and numbers are fictional demo data, saved in your browser.
          </p>
        </PopoverContent>
      </Popover>

      <span className="shrink-0 whitespace-nowrap text-xs font-medium text-muted-foreground">{PHASE_LABEL[info.phase]}</span>

      <div className="w-[340px] shrink-0 2xl:w-[420px]">
        <StageTracker stages={stages} current={info.stage} />
      </div>

      <p className="line-clamp-2 min-w-0 flex-1 text-[13px] leading-snug">
        <span className="text-muted-foreground">
          {info.phase === 'done' ? 'Done' : `Step ${n} of ${TOTAL_STEPS}`} ·{' '}
        </span>
        <span className="font-medium">{info.hint}</span>
      </p>

      {info.skip && (
        <Button
          size="sm"
          variant="outline"
          className="demo-pulse"
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
