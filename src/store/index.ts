import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STEPS, stepIndex, type StepId } from '@/demo/script'
import type { DocId } from '@/data/documents'
import { DEFAULT_CRITERIA } from '@/data/profile'
import { DEFAULT_GOAL } from '@/data/plan'

/* ---------- the founder: entered on the landing page, or Priya Raman at Tracelane (fictional) ---------- */
export interface Founder {
  name: string
  company: string
}
export const DEFAULT_FOUNDER: Founder = { name: 'Priya Raman', company: 'Tracelane' }

export interface CurrentUser {
  name: string
  first: string
  company: string
  email: string
  /** lower-case company, for domains and channel names */
  slug: string
}

/** Everything the demo says about the founder, from what they typed (blank fields fall back to Priya at Tracelane). */
export function userFor(f: Founder): CurrentUser {
  const name = f.name.trim() || DEFAULT_FOUNDER.name
  const company = f.company.trim() || DEFAULT_FOUNDER.company
  const first = name.split(/\s+/)[0]!
  const slug = company.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'company'
  const local = first.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'founder'
  const isDefault = name === DEFAULT_FOUNDER.name && company === DEFAULT_FOUNDER.company
  return { name, first, company, slug, email: `${local}@${slug}.${isDefault ? 'dev' : 'com'}` }
}

export type SourceId = 'email' | 'calendar' | 'calls' | 'slack' | 'billing' | 'product'
export type SkillLevel = 'strong' | 'help'

/* ---------- demo state: the fake backend, saved in the browser ---------- */
interface DemoState {
  founder: Founder
  step: StepId
  /* setup */
  connected: SourceId[]
  /** optional tools the founder chose not to connect (yet) */
  skipped: SourceId[]
  importDone: boolean
  /** documents: uploaded, or skipped in favour of answering questions */
  docsMode: 'upload' | 'skip' | null
  uploads: DocId[]
  uploadsDone: boolean
  docsRead: boolean
  /** assistant messages in the Learn conversation that have finished streaming */
  learnShown: number
  learnAnswers: string[]
  segments: string[]
  /** profile filters: Pact proposes the funding one, the founder adds what the data can't see */
  criteria: string[]
  skills: Record<string, SkillLevel>
  /** the founder's goal: new ARR in $K, set in setup */
  goal: number | null
  planShown: boolean
  /* Turn 1 */
  halcyonSent: boolean
  /** words in the opener Priya sent (Pact's draft had 41) */
  openerWords: number
  learnedUndone: boolean
  offerDeferred: boolean
  autonomyCap: string | null
  /** first notes run on their own (false after "Take back") */
  autonomyOn: boolean
  pauseOnEdits: boolean
  notifyEachRun: boolean
  /** digest items dismissed, with the reason given */
  dismissed: Record<string, string>
  /* Turn 2 */
  checkinSent: boolean
  expertRequested: boolean
  /** after the pilot converts: the expansion quote Pact drafted */
  expansionSent: boolean

  /** set any demo fields at once */
  patch: (p: Partial<DemoData>) => void
  /** move the demo to a step (only ever forward in normal use) */
  goTo: (step: StepId) => void
  next: () => void
  connect: (id: SourceId) => void
  skip: (id: SourceId) => void
  setImportDone: () => void
  startUploads: (ids: DocId[]) => void
  finishUploads: () => void
  skipDocs: () => void
  /** Pact finished reading: pre-fill what the documents answer */
  setDocsRead: () => void
  setLearnShown: (n: number) => void
  answerLearn: (index: number, answer: string) => void
  toggleSegment: (s: string) => void
  toggleCriterion: (c: string) => void
  setSkill: (skill: string, level: SkillLevel) => void
  setPlanShown: () => void
  reset: () => void
}

/** Without a playbook, Pact starts by teaching everything; the founder flips what they're strong at. */
const ALL_HELP: Record<string, SkillLevel> = {
  Prospecting: 'help',
  'Writing outreach': 'help',
  'Discovery calls': 'help',
  'Pricing and negotiation': 'help',
  'Running pilots': 'help',
}

const initial = {
  founder: DEFAULT_FOUNDER,
  step: 'connect' as StepId,
  connected: [] as SourceId[],
  skipped: [] as SourceId[],
  importDone: false,
  docsMode: null as 'upload' | 'skip' | null,
  uploads: [] as DocId[],
  uploadsDone: false,
  docsRead: false,
  learnShown: 0,
  learnAnswers: [] as string[],
  segments: [] as string[],
  criteria: DEFAULT_CRITERIA,
  skills: {} as Record<string, SkillLevel>,
  goal: null as number | null,
  planShown: false,
  halcyonSent: false,
  openerWords: 41,
  learnedUndone: false,
  offerDeferred: false,
  autonomyCap: null as string | null,
  autonomyOn: false,
  pauseOnEdits: true,
  notifyEachRun: true,
  dismissed: {} as Record<string, string>,
  checkinSent: false,
  expertRequested: false,
  expansionSent: false,
}
type DemoData = typeof initial

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial,
      patch: (p) => set(p),
      goTo: (step) => set({ step }),
      next: () => {
        const i = stepIndex(get().step)
        if (i < STEPS.length - 1) set({ step: STEPS[i + 1]!.id })
      },
      connect: (id) =>
        set((s) => (s.connected.includes(id) ? s : { connected: [...s.connected, id], skipped: s.skipped.filter((x) => x !== id) })),
      skip: (id) => set((s) => (s.skipped.includes(id) || s.connected.includes(id) ? s : { skipped: [...s.skipped, id] })),
      setImportDone: () => set({ importDone: true }),
      startUploads: (ids) => set({ docsMode: 'upload', uploads: ids, uploadsDone: false, docsRead: false }),
      finishUploads: () => set({ uploadsDone: true }),
      skipDocs: () =>
        set((s) => ({
          docsMode: 'skip',
          segments: s.segments.length ? s.segments : ['Dev tools'],
          skills: Object.keys(s.skills).length ? s.skills : ALL_HELP,
        })),
      setDocsRead: () =>
        set((s) => ({
          docsRead: true,
          segments: s.segments.length ? s.segments : ['Dev tools'],
          skills: Object.keys(s.skills).length
            ? s.skills
            : s.uploads.includes('playbook')
              ? { Prospecting: 'help', 'Writing outreach': 'strong', 'Discovery calls': 'strong', 'Pricing and negotiation': 'help', 'Running pilots': 'help' }
              : ALL_HELP,
        })),
      setLearnShown: (n) => set((s) => ({ learnShown: Math.max(s.learnShown, n) })),
      answerLearn: (index, answer) =>
        set((s) => {
          const learnAnswers = s.learnAnswers.slice(0, index)
          learnAnswers[index] = answer
          return { learnAnswers }
        }),
      toggleSegment: (seg) =>
        set((s) => ({ segments: s.segments.includes(seg) ? s.segments.filter((x) => x !== seg) : [...s.segments, seg] })),
      toggleCriterion: (c) =>
        set((s) => ({ criteria: s.criteria.includes(c) ? s.criteria.filter((x) => x !== c) : [...s.criteria, c] })),
      setSkill: (skill, level) => set((s) => ({ skills: { ...s.skills, [skill]: level } })),
      setPlanShown: () => set({ planShown: true }),
      // starting over keeps the founder's name and company
      reset: () => set((s) => ({ ...initial, founder: s.founder })),
    }),
    {
      name: 'pact-loop-demo',
      version: 4,
      // older saves lack newer fields: keep their progress and let the defaults fill the rest,
      // unless they stopped on a step the shorter demo no longer has, then start over
      migrate: (persisted) => {
        const saved = persisted as DemoState | undefined
        return (saved && STEPS.some((s) => s.id === saved.step) ? saved : { ...initial }) as DemoState
      },
    },
  ),
)

/** The founder, in components (re-renders if they change their name). */
export const useCurrentUser = () => userFor(useDemo((s) => s.founder))
/** The founder, in data and copy built outside components. */
export const currentUser = () => userFor(useDemo.getState().founder)

/** The founder's goal ($K new ARR); before it's set, the demo's default. */
export const useGoal = () => useDemo((s) => s.goal) ?? DEFAULT_GOAL

/* ---------- UI state (not saved) ---------- */
interface UiState {
  sidebarExpanded: boolean
  setSidebarExpanded: (v: boolean) => void
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void
  askOpen: boolean
  setAskOpen: (v: boolean) => void
}

export const useUi = create<UiState>()((set) => ({
  sidebarExpanded: true,
  setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
  commandOpen: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  askOpen: false,
  setAskOpen: (askOpen) => set({ askOpen }),
}))
