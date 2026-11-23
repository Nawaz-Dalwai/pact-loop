/**
 * The fixed demo script, in order. Each step is one decision the founder makes; everything
 * Pact does in between plays out on its own. The guide strip, route guards and pulse
 * highlights all read from here.
 */
export type Phase = 'setup' | 'turn1' | 'turn2' | 'done'

export const SETUP_STAGES = ['Connect', 'Learn the business', 'Plan'] as const
export const LOOP_STAGES = ['Signal', 'Act', 'Surface', 'Decide', 'Learn'] as const

export type StepId =
  | 'connect'
  | 'learn'
  | 'plan'
  | 'signal'
  | 'decide'
  | 'offer'
  | 'autonomy'
  | 'usage'
  | 'risk'
  | 'progress'
  | 'done'

export interface DemoStep {
  id: StepId
  phase: Phase
  /** Stage shown as current in the guide's tracker */
  stage: string
  /** What the visitor should do now */
  hint: string
  /** Where this step happens */
  route: string
  /** The screen's name, for "this step is on …" */
  where: string
  /** Other screens where the step can be done; a trailing /* matches anything below */
  paths?: string[]
  /** The step's action lives in the guide itself (Skip), so any screen is fine */
  anywhere?: boolean
  /** Label for the guide's skip button, shown when the story waits on the outside world */
  skip?: string
}

export const STEPS: DemoStep[] = [
  { id: 'connect', phase: 'setup', stage: 'Connect', route: '/onboarding/connect', where: 'Connect', hint: 'Connect your tools (skip any you don’t use), then hand Pact your documents' },
  { id: 'learn', phase: 'setup', stage: 'Learn the business', route: '/onboarding/learn', where: 'Learn the business', hint: 'Add what only you know to the profile Pact found, then confirm it' },
  { id: 'plan', phase: 'setup', stage: 'Plan', route: '/onboarding/plan', where: 'Plan', hint: 'Pick your goal, then agree the plan Pact works back from it' },

  { id: 'signal', phase: 'turn1', stage: 'Signal', route: '/home', where: 'Home', hint: "A past champion's company just raised. Open what Pact prepared" },
  { id: 'decide', phase: 'turn1', stage: 'Decide', route: '/queue', where: 'Queue', hint: 'Shorten the opener, then approve and send' },
  { id: 'offer', phase: 'turn1', stage: 'Learn', route: '/home', where: 'Home', hint: 'A day later: see what Pact learned, then let it send first notes itself' },
  { id: 'autonomy', phase: 'turn1', stage: 'Learn', route: '/autonomy', where: 'Autonomy', anywhere: true, hint: 'First notes now run on their own, within your cap. Skip ahead two weeks', skip: 'Skip two weeks' },

  { id: 'usage', phase: 'turn2', stage: 'Signal', route: '/home', where: 'Home', hint: "Two weeks later, a pilot's health dropped. Open what Pact found" },
  { id: 'risk', phase: 'turn2', stage: 'Decide', route: '/queue', where: 'Queue', hint: 'Approve the check-in, then bring in an expert' },
  { id: 'progress', phase: 'turn2', stage: 'Learn', route: '/plan', where: 'Plan', anywhere: true, hint: 'See progress against your plan, then skip to the end of the pilot', skip: 'Skip to pilot end' },
  { id: 'done', phase: 'done', stage: 'Learn', route: '/plan', where: 'Plan', hint: 'Approve the expansion Pact drafted. Replay the loop any time' },
]

export const stepIndex = (id: StepId) => STEPS.findIndex((s) => s.id === id)
export const stepInfo = (id: StepId) => STEPS[stepIndex(id)]!
/** Steps the visitor acts on (the final "done" card isn't counted). */
export const TOTAL_STEPS = STEPS.length - 1
export const isSetup = (id: StepId) => stepInfo(id).phase === 'setup'
/** True once the demo has reached (or passed) a step. */
export const reached = (current: StepId, target: StepId) => stepIndex(current) >= stepIndex(target)
/** The step after this one. */
export const nextStep = (id: StepId): StepId => STEPS[Math.min(STEPS.length - 1, stepIndex(id) + 1)]!.id

/** True when the visitor is on a screen where the step can be done. */
export function onPath(id: StepId, pathname: string) {
  const info = stepInfo(id)
  if (info.anywhere) return true
  return [info.route, ...(info.paths ?? [])].some((p) =>
    p.endsWith('/*') ? pathname === p.slice(0, -2) || pathname.startsWith(p.slice(0, -1)) : pathname === p,
  )
}
/** The steps of one phase, in order. */
export const stepsOf = (phase: Phase) => STEPS.filter((s) => s.phase === phase)
