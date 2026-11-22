import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STEPS, stepIndex, type StepId } from '@/demo/script'
import type { DocId } from '@/data/documents'

/* ---------- the founder (fictional) ---------- */
export const CURRENT_USER = { name: 'Priya Raman', email: 'priya@tracelane.dev', company: 'Tracelane' }
export const useCurrentUser = () => CURRENT_USER

export type SourceId = 'email' | 'calendar' | 'calls' | 'slack' | 'product'
export type SkillLevel = 'strong' | 'help'

/* ---------- demo state: the fake backend, saved in the browser ---------- */
interface DemoState {
  step: StepId
  /* setup */
  connected: SourceId[]
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
  skills: Record<string, SkillLevel>
  planShown: boolean

  /** move the demo to a step (only ever forward in normal use) */
  goTo: (step: StepId) => void
  next: () => void
  connect: (id: SourceId) => void
  setImportDone: () => void
  startUploads: (ids: DocId[]) => void
  finishUploads: () => void
  skipDocs: () => void
  /** Pact finished reading: pre-fill what the documents answer */
  setDocsRead: () => void
  setLearnShown: (n: number) => void
  answerLearn: (index: number, answer: string) => void
  toggleSegment: (s: string) => void
  setSkill: (skill: string, level: SkillLevel) => void
  setPlanShown: () => void
  reset: () => void
}

const initial = {
  step: 'connect' as StepId,
  connected: [] as SourceId[],
  importDone: false,
  docsMode: null as 'upload' | 'skip' | null,
  uploads: [] as DocId[],
  uploadsDone: false,
  docsRead: false,
  learnShown: 0,
  learnAnswers: [] as string[],
  segments: [] as string[],
  skills: {} as Record<string, SkillLevel>,
  planShown: false,
}

export const useDemo = create<DemoState>()(
  persist(
    (set, get) => ({
      ...initial,
      goTo: (step) => set({ step }),
      next: () => {
        const i = stepIndex(get().step)
        if (i < STEPS.length - 1) set({ step: STEPS[i + 1]!.id })
      },
      connect: (id) => set((s) => (s.connected.includes(id) ? s : { connected: [...s.connected, id] })),
      setImportDone: () => set({ importDone: true }),
      startUploads: (ids) => set({ docsMode: 'upload', uploads: ids, uploadsDone: false, docsRead: false }),
      finishUploads: () => set({ uploadsDone: true }),
      skipDocs: () => set({ docsMode: 'skip' }),
      setDocsRead: () =>
        set((s) => ({
          docsRead: true,
          segments: s.uploads.includes('icp') && s.segments.length === 0 ? ['Dev tools', 'Fintech'] : s.segments,
          skills:
            s.uploads.includes('playbook') && Object.keys(s.skills).length === 0
              ? { Prospecting: 'help', 'Writing outreach': 'strong', 'Discovery calls': 'strong', 'Pricing and negotiation': 'help', 'Running pilots': 'help' }
              : s.skills,
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
      setSkill: (skill, level) => set((s) => ({ skills: { ...s.skills, [skill]: level } })),
      setPlanShown: () => set({ planShown: true }),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'pact-loop-demo',
      version: 2,
      // v1 had no document fields; keep its progress and let the defaults fill the rest
      migrate: (persisted) => persisted as DemoState,
    },
  ),
)

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
