import { Activity, Calendar, CreditCard, Hash, Mail, Video, type LucideIcon } from 'lucide-react'
import { currentUser, type SourceId } from '@/store'

/**
 * The six tools a founder can connect. Email is required: Pact sends from it and builds the
 * day-one pipeline from it. The other five are optional, and the journey adapts to what's there.
 */
export interface Source {
  id: SourceId
  name: string
  detail: string
  icon: LucideIcon
  required?: boolean
  /** what Pact does without it, shown once it's skipped */
  without?: string
  /** what connecting it adds, for "Connect" prompts later in the journey */
  adds?: string
}

export const SOURCES: Source[] = [
  { id: 'email', name: 'Email', detail: 'Gmail · every thread kept whole, never summarised away', icon: Mail, required: true },
  {
    id: 'calendar',
    name: 'Calendar',
    detail: 'Google Calendar · meetings and who was in them',
    icon: Calendar,
    without: 'Bookings come from email replies; Pact won’t see who was in meetings',
    adds: 'see meetings and who was in them',
  },
  {
    id: 'calls',
    name: 'Calls',
    detail: 'Zoom and Google Meet recordings, with transcripts',
    icon: Video,
    without: 'Promises come from written pilot plans, not what was said on calls',
    adds: 'catch promises made out loud on calls',
  },
  {
    id: 'slack',
    name: 'Slack',
    detail: 'Shared customer channels',
    icon: Hash,
    without: 'Pact won’t hear what customers say in shared channels',
    adds: 'hear what customers say in shared channels',
  },
  {
    id: 'billing',
    name: 'Billing',
    detail: 'Stripe · invoices, plans and renewal dates',
    icon: CreditCard,
    without: 'ARR and renewal dates come from your documents and email',
    adds: 'track ARR and renewals from your invoices',
  },
  {
    id: 'product',
    name: 'Product analytics',
    detail: 'Usage events from your product’s workspaces',
    icon: Activity,
    without: 'Pact can’t measure promises against usage, so it asks customers instead',
    adds: 'measure every promise against real usage',
  },
]

export const ALL_SOURCES: SourceId[] = SOURCES.map((s) => s.id)
export const sourceById = (id: SourceId) => SOURCES.find((s) => s.id === id)!

/** "email, calls and product usage": what an account record is built from. */
export function sourcesPhrase(connected: SourceId[]) {
  const words: Record<SourceId, string> = { email: 'email', calendar: 'meeting', calls: 'call', slack: 'Slack thread', billing: 'invoice', product: 'product event' }
  const xs = ALL_SOURCES.filter((id) => connected.includes(id)).map((id) => words[id])
  return xs.length <= 1 ? (xs[0] ?? 'email') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`
}

/** The day-one import: what Pact read, and what it found, from the tools connected. */
export function importView(connected: SourceId[]) {
  const has = (id: SourceId) => connected.includes(id)
  const promises = has('calls') ? 11 : 4
  return {
    context: [
      'Read 2,140 email threads from the last 18 months',
      ...(has('calendar') ? ['Matched 312 meetings and who was in them'] : []),
      ...(has('calls') ? ['Transcribed 41 call recordings'] : []),
      ...(has('slack') ? ['Read 6 shared Slack channels with customers'] : []),
      ...(has('billing') ? ['Matched Stripe invoices for 7 paying customers'] : []),
      ...(has('product') ? ['Linked product usage for 9 customer workspaces'] : []),
      has('calls') ? 'Recorded needs, promises and decisions from calls' : 'Recorded promises from written pilot plans',
    ],
    promises,
    promiseText: has('calls')
      ? `I also pulled **${promises} promises** you made on calls, so I can track each one ${has('product') ? 'against product usage' : 'with your customers'} all the way to renewal.`
      : `I also pulled **${promises} promises** from your written pilot plans. Connect call recordings any time and I'll catch the ones made out loud.`,
    promiseHint: has('calls') ? 'Commitments made on calls' : 'Commitments in written pilot plans',
  }
}

/**
 * Turn 2, by what Pact can see. Product usage measures the missed promise; without it, a
 * message in the shared Slack channel reveals it; without either, Pact notices the silence
 * and the check-in asks instead of tells.
 */
export function pilotView(connected: SourceId[]) {
  const u = currentUser()
  const has = (id: SourceId) => connected.includes(id)
  const evidence: 'usage' | 'slack' | 'none' = has('product') ? 'usage' : has('slack') ? 'slack' : 'none'
  const fromCall = has('calls')
  const promise = fromCall
    ? { quote: "We'll have Slack alerts set up for all six teams in the first two weeks.", who: `${u.first}, at kickoff`, source: 'Kickoff call · 14:31', where: 'kickoff call' }
    : { quote: 'Slack alerts set up for all six teams within the first two weeks.', who: 'Your pilot plan email', source: 'Pilot plan email · Nov 15', where: 'pilot plan' }
  const evidenceSource = { usage: 'Product usage', slack: 'Shared Slack channel', none: 'Email' }[evidence]
  return {
    evidence,
    /** Pact knows alerts are on for 1 of 6 teams */
    known: evidence !== 'none',
    promise,
    sources: [promise.source, evidenceSource, 'Your deal history'],
    evidenceLine: {
      usage: '**The usage:** alerts are on for **1 of 6** teams in week 2 [[Product usage]]',
      slack: '**What Ana said:** "Only the payments team has alerts so far." [[Shared Slack channel]]',
      none: "**What Pact can see:** no word on alerts since the week-2 milestone, and Ana hasn't replied in 9 days [[Email]]",
    }[evidence],
    notification: {
      usage: 'Quillstack pilot: Slack alerts are on for 1 of 6 teams. You promised all six by week 2, and the pilot ends in 4 weeks.',
      slack: 'Quillstack pilot: Ana said in Slack that only one team has alerts. You promised all six by week 2, and the pilot ends in 4 weeks.',
      none: "Quillstack pilot: the week-2 milestone passed with no word on alerts, and Ana hasn't replied in 9 days. The pilot ends in 4 weeks.",
    }[evidence],
    riskMeta: `Health 78 → 41 · pilot ends in 4 weeks · $36K ARR at stake · ${evidence === 'none' ? `no word on a promise from the ${promise.where}` : `a promise from the ${promise.where} is behind`}`,
    bannerHint:
      evidence === 'none'
        ? 'The Slack alerts promise has gone quiet in week 2 · open it in your queue'
        : 'The Slack alerts promise is behind in week 2 · open it in your queue',
    expertNote: `Quillstack pilot ends in 4 weeks. Slack alerts promised for 6 teams, ${evidence === 'none' ? 'no update since week 2' : 'on for 1'}. I sent a check-in today. Want a second pair of eyes before renewal.`,
    /** Act: why the promise is behind, when Pact can see it */
    cause: {
      usage: "**Why it's behind:** the five idle teams started Slack setup and stopped at the webhook step [[Product usage]]",
      slack: "**Why it's behind:** Ana says the other teams are heads-down on quarter-end [[Shared Slack channel]]",
      none: null,
    }[evidence],
    /** Learn: the change every pilot gets */
    dayFive: has('product')
      ? 'Every pilot now gets a day-5 check on alert setup, measured in usage, instead of waiting for the week-2 deadline.'
      : 'Every pilot now gets a day-5 check-in on alert setup, instead of waiting for the week-2 deadline.',
    /** Grow: the expansion Pact drafts once the pilot converts */
    expansion: has('product')
      ? {
          finding: `14 people on the data and risk teams already use ${u.company} through shared logins.`,
          source: 'Product usage',
          line: `**Room to grow:** 14 people on the data and risk teams already use ${u.company} through shared logins [[Product usage]]`,
          meta: 'From seat usage · 14 more seats · about $8K ARR',
          context: 'Checked seat usage across Quillstack workspaces',
          body: "<p>We've noticed 14 people on your data and risk teams already looking at traces through shared logins. Their own seats would mean their own alerts, too.</p>",
        }
      : {
          finding: 'Grace asked in the signing email about adding the data and risk teams, about 14 people.',
          source: 'Email',
          line: '**Room to grow:** Grace asked in the signing email about adding the data and risk teams, about 14 people [[Email]]',
          meta: "From Grace's signing email · 14 more seats · about $8K ARR",
          context: "Read Grace's signing email",
          body: '<p>You asked about adding the data and risk teams. For about 14 people, that means their own seats and their own alerts.</p>',
        },
    outcome: {
      usage: 'Owning a missed promise early kept the pilot: alerts went from 1 to 6 teams in 4 days.',
      slack: 'Owning a missed promise early kept the pilot: Ana confirmed in Slack that all six teams had alerts within 4 days.',
      none: 'Asking early kept the pilot: Ana replied the same day, and all six teams had alerts within a week.',
    }[evidence],
  }
}
