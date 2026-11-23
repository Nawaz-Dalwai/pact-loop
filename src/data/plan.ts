/**
 * The plan Pact works back from the founder's goal (fictional demo numbers, in $K ARR).
 * The goal is new ARR: Tracelane's existing $310K is context, not part of the climb.
 */
export const GOALS = [500, 1000, 2000] as const
export const DEFAULT_GOAL = 1000
/** average new deal, $K ARR */
export const AVG_DEAL = 34
/** share of pilots that convert to paid */
export const PILOT_WIN = 0.45
/** share of qualified leads that start a pilot */
export const LEAD_TO_PILOT = 0.2
/** months and weeks from December to the deadline */
const MONTHS = 10
const WEEKS = 43

export const PLAN = {
  deadline: 'Sep 30, 2027',
  deadlineShort: 'Sep 30',
  /** existing ARR from 7 customers, before the plan */
  arrToday: 310,
}

/** "$500K", "$1M", "$2M" */
export const goalLabel = (goal: number) => (goal >= 1000 ? `$${goal / 1000}M` : `$${goal}K`)

const MONTH_LABELS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']

/** Work back from a new-ARR goal: deals, pilots and leads, in total and per month, and the path to it. */
export function planFor(goal: number) {
  const deals = Math.round(goal / AVG_DEAL)
  const pilots = Math.round(deals / PILOT_WIN)
  const leads = Math.round(pilots / LEAD_TO_PILOT)
  return {
    goal,
    deals,
    pilots,
    leads,
    perMonth: { leads: Math.ceil(leads / MONTHS), pilots: Math.ceil(pilots / MONTHS), deals: Math.ceil(deals / MONTHS) },
    pilotsPerWeek: Math.round((pilots / WEEKS) * 10) / 10,
    /** new ARR each month on the way to the goal: slow at first, as pilots take time to convert */
    path: MONTH_LABELS.map((label, i) => ({ label, value: Math.round(goal * ((i + 1) / MONTHS) ** 1.5) })),
  }
}

/** Progress against the plan at each point of the story (fictional). New ARR, in $K. */
export function progressFor(step: string, reachedUsage: boolean) {
  const won = step === 'done'
  return {
    arr: won ? 36 : 0,
    leads: reachedUsage ? 41 : 9,
    pilots: reachedUsage ? 4 : 1,
    conversions: won ? 1 : 0,
  }
}

/**
 * The north star, scored the way the deck defines it: trusted revenue work this week.
 * Kept work only (approved without edits, or run by Pact and not undone), weighted by
 * stakes (low ×1, medium ×3, high ×10), doubled when Pact ran it on its own.
 */
export interface WorkItem {
  what: string
  stakes: 'Low' | 'Medium' | 'High'
  count: number
  /** Pact ran it on its own */
  alone?: boolean
  /** false: edited or undone, so it doesn't count */
  kept: boolean
  note?: string
}
const WEIGHT = { Low: 1, Medium: 3, High: 10 } as const
export const pointsFor = (w: WorkItem) => (w.kept ? w.count * WEIGHT[w.stakes] * (w.alone ? 2 : 1) : 0)

export function trustedWork(
  step: string,
  s: { reachedUsage: boolean; reachedBrief: boolean; halcyonSent: boolean; autonomyOn: boolean; checkinSent: boolean; expansionSent: boolean },
) {
  const done = step === 'done'
  const items: WorkItem[] = done
    ? [
        { what: 'Account updates Pact logged', stakes: 'Low', count: 10, kept: true },
        ...(s.autonomyOn ? [{ what: 'First notes Pact sent on its own', stakes: 'Medium' as const, count: 3, alone: true, kept: true }] : []),
        ...(s.expansionSent
          ? [{ what: 'Expansion quote to Quillstack, approved as written', stakes: 'High' as const, count: 1, kept: true }]
          : [{ what: 'Expansion quote to Quillstack', stakes: 'High' as const, count: 1, kept: false, note: 'waiting for your yes' }]),
      ]
    : s.reachedUsage
      ? [
          { what: 'Account updates Pact logged', stakes: 'Low', count: 12, kept: true },
          ...(s.autonomyOn ? [{ what: 'First notes Pact sent on its own', stakes: 'Medium' as const, count: 4, alone: true, kept: true }] : []),
          ...(s.checkinSent ? [{ what: 'Check-in to Ana, approved as written', stakes: 'Medium' as const, count: 1, kept: true }] : []),
        ]
      : [
          { what: 'Account updates Pact logged', stakes: 'Low', count: 14, kept: true },
          ...(s.reachedBrief ? [{ what: 'Call brief for Halcyon', stakes: 'Medium' as const, count: 1, kept: true }] : []),
          ...(s.halcyonSent
            ? [{ what: 'First note to Maya', stakes: 'Medium' as const, count: 1, kept: false, note: 'you edited it, so it taught Pact instead' }]
            : []),
        ]
  return { items, total: items.reduce((n, w) => n + pointsFor(w), 0) }
}
