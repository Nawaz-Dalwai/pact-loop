/**
 * The fixed demo script. Every step of the board's workflow, in order.
 * The guide strip, route guards and pulse highlights all read from here.
 */
export type Phase = 'setup' | 'turn1' | 'turn2' | 'done'

export const SETUP_STAGES = ['Connect', 'Learn the business', 'Plan'] as const
export const LOOP_STAGES = ['Signal', 'Act', 'Surface', 'Decide', 'Learn'] as const

export type StepId =
  | 'connect'
  | 'learn'
  | 'plan'
  | 'signal'
  | 'account'
  | 'queue'
  | 'decide'
  | 'reply'
  | 'brief'
  | 'learned'
  | 'offer'
  | 'autonomy'
  | 'usage'
  | 'promises'
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
  /** Label for the guide's skip button, shown when the story waits on the outside world */
  skip?: string
}

export const STEPS: DemoStep[] = [
  { id: 'connect', phase: 'setup', stage: 'Connect', route: '/onboarding/connect', hint: 'Connect all five sources, then let Pact build your pipeline' },
  { id: 'learn', phase: 'setup', stage: 'Learn the business', route: '/onboarding/learn', hint: 'Upload what you already have, or skip, then confirm what Pact learned' },
  { id: 'plan', phase: 'setup', stage: 'Plan', route: '/onboarding/plan', hint: 'Review the plan Pact worked back from your goal, then agree it' },

  { id: 'signal', phase: 'turn1', stage: 'Signal', route: '/home', hint: 'Open Notifications: a past contact just raised a round' },
  { id: 'account', phase: 'turn1', stage: 'Act', route: '/accounts/halcyon', hint: "Read Pact's research, then open the draft it queued" },
  { id: 'queue', phase: 'turn1', stage: 'Surface', route: '/queue', hint: 'Check the evidence, then open the draft' },
  { id: 'decide', phase: 'turn1', stage: 'Decide', route: '/queue', hint: 'Shorten the opener, then approve and send' },
  { id: 'reply', phase: 'turn1', stage: 'Signal', route: '/home', hint: 'The note is out. Skip ahead a day for the reply', skip: 'Skip a day' },
  { id: 'brief', phase: 'turn1', stage: 'Act', route: '/home', hint: 'Halcyon booked a call. Open the call brief Pact prepared' },
  { id: 'learned', phase: 'turn1', stage: 'Learn', route: '/home', hint: 'See what Pact learned from your edit' },
  { id: 'offer', phase: 'turn1', stage: 'Learn', route: '/home', hint: 'Pact asks to send first notes itself. Set a cap and grant it' },
  { id: 'autonomy', phase: 'turn1', stage: 'Decide', route: '/autonomy', hint: 'See what runs on its own and how to take it back, then skip ahead', skip: 'Skip two weeks' },

  { id: 'usage', phase: 'turn2', stage: 'Signal', route: '/home', hint: 'Two weeks later: open the notification about a pilot' },
  { id: 'promises', phase: 'turn2', stage: 'Act', route: '/accounts/quillstack/promises', hint: 'Compare what was promised with what is used, then open the risk' },
  { id: 'risk', phase: 'turn2', stage: 'Decide', route: '/queue', hint: 'Approve the check-in, then bring in a human expert' },
  { id: 'progress', phase: 'turn2', stage: 'Learn', route: '/plan', hint: 'See progress against the plan, then skip to the end of the pilot', skip: 'Skip to pilot end' },
  { id: 'done', phase: 'done', stage: 'Learn', route: '/plan', hint: 'You ran the whole loop. Replay it any time' },
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
