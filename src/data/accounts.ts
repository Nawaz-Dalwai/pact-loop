import type { Health } from './types'
import { reached, type StepId } from '@/demo/script'

/** Fictional accounts. Halcyon Labs drives Turn 1, Quillstack drives Turn 2; the rest fill out the record. */
export type AccountStatus = 'New signal' | 'Meeting booked' | 'Prospect' | 'Pilot' | 'Customer'
export type Role = 'Champion' | 'Economic buyer' | 'Evaluator' | 'Influencer'

export interface Person {
  name: string
  title: string
  email: string
  role: Role
  cares: string
}

export interface Finding {
  title: string
  body: string
  source: string
}

export type TimelineKind = 'email' | 'call' | 'meeting' | 'signal' | 'usage'
export interface TimelineItem {
  id: string
  kind: TimelineKind
  title: string
  when: string
  actor: string
  summary: string
  /** the full text, kept whole rather than summarised away */
  body?: string
}

export interface PromiseItem {
  id: string
  promise: string
  source: string
  measure: string
  current: number
  target: number
  health: Health
}

export interface Account {
  id: string
  name: string
  domain: string
  industry: string
  hq: string
  employees: number
  status: AccountStatus
  health?: Health
  arr?: string
  lastTouch: string
  people: Person[]
  summary: string
  findings: Finding[]
  signals?: Finding[]
  timeline: TimelineItem[]
  promises?: PromiseItem[]
  pilot?: { started: string; ends: string; daysLeft: number; value: string }
  /** only exists from this step on */
  appearsAt?: StepId
}

/* ---------------- Halcyon Labs (Turn 1) ---------------- */

const HALCYON_THREAD = `From: Maya Okafor <maya@halcyonlabs.io>
To: Priya Raman <priya@tracelane.dev>
Date: Mar 14, 2025

Hi Priya,

Thanks again for the walkthrough. The team liked seeing the slow span on our ledger call jump straight out of the trace.

Honestly, we can't take on another tool before we raise. Let's revisit once we've closed the round, probably later this year.

Maya`

function halcyon(step: StepId): Account {
  const sent = reached(step, 'reply')
  const replied = reached(step, 'brief')
  const timeline: TimelineItem[] = [
    ...(replied
      ? [
          {
            id: 'h-reply',
            kind: 'email' as const,
            title: 'Re: Congrats on the round',
            when: 'Today, 8:41 AM',
            actor: 'Maya Okafor',
            summary: 'Replied within a day and booked Thursday 2:00 PM.',
            body: `Hi Priya,\n\nPerfect timing. We're hiring our first SDR and our API traffic is about to grow, so latency is top of mind again.\n\nI've booked Thursday at 2pm. I'll bring Daniel.\n\nMaya`,
          },
        ]
      : []),
    ...(sent
      ? [
          {
            id: 'h-sent',
            kind: 'email' as const,
            title: 'Congrats on the round',
            when: replied ? 'Yesterday' : 'Just now',
            actor: 'Priya Raman (approved, edited)',
            summary: "First note, picking up March's thread. Priya shortened Pact's opener.",
          },
        ]
      : []),
    { id: 'h-seed', kind: 'signal', title: 'Announced a $6M seed round', when: replied ? '2 days ago' : 'Yesterday', actor: 'Funding news', summary: 'Led by Northlight Ventures. Plans to double the engineering team.' },
    { id: 'h-sdr', kind: 'signal', title: 'Posted its first SDR job', when: replied ? '3 days ago' : '2 days ago', actor: 'Job post', summary: '"First sales hire, reporting to the CEO."' },
    { id: 'h-thread', kind: 'email', title: "Re: Tracing for Halcyon's payments API", when: 'Mar 14, 2025', actor: 'Maya Okafor', summary: '"Let\'s revisit once we\'ve closed the round."', body: HALCYON_THREAD },
    { id: 'h-call', kind: 'call', title: 'Intro call with Maya Okafor', when: 'Mar 6, 2025', actor: 'Priya Raman', summary: '30 min. Maya walked through three latency incidents on their ledger calls. Liked per-customer p99 views.' },
    { id: 'h-first', kind: 'email', title: "Tracing for Halcyon's payments API", when: 'Mar 3, 2025', actor: 'Priya Raman', summary: 'First outreach after a mutual intro from a Tracelane customer.' },
  ]
  return {
    id: 'halcyon',
    name: 'Halcyon Labs',
    domain: 'halcyonlabs.io',
    industry: 'Dev tools · payments APIs',
    hq: 'Austin, TX',
    employees: 34,
    status: replied ? 'Meeting booked' : 'New signal',
    arr: '$24K potential',
    lastTouch: replied ? 'Today' : sent ? 'Just now' : 'Mar 14, 2025',
    appearsAt: 'signal',
    people: [
      { name: 'Maya Okafor', title: 'Head of Platform', email: 'maya@halcyonlabs.io', role: 'Champion', cares: 'p99 latency on the payments API; on-call load' },
      { name: 'Daniel Reyes', title: 'CTO and co-founder', email: 'daniel@halcyonlabs.io', role: 'Economic buyer', cares: 'Reliability for the customers the new round will bring' },
      { name: 'Joel Andersen', title: 'Staff engineer', email: 'joel@halcyonlabs.io', role: 'Evaluator', cares: 'OpenTelemetry support; setup time' },
    ],
    summary:
      'Halcyon Labs builds payments APIs for vertical SaaS companies. 34 people, about 20 engineers. You talked in March 2025; they paused until they raised. They just did.',
    signals: [
      { title: 'Seed round', body: '$6M seed, led by Northlight Ventures. The announcement says they will double engineering.', source: 'Funding news' },
      { title: 'First SDR', body: 'Their first sales hire usually means more customers on the API soon, and more pressure on latency.', source: 'Job post' },
      { title: 'Past thread', body: 'Maya, March 2025: "Let\'s revisit once we\'ve closed the round."', source: 'Email · Mar 14, 2025' },
    ],
    findings: [
      { title: 'Latency is the pain', body: 'Their status page lists 3 incidents in 60 days, each traced to a slow downstream call.', source: 'Status page' },
      { title: 'Platform team is growing', body: 'Two platform engineer roles opened this month; both mention on-call and p99 latency.', source: 'Job posts' },
      { title: 'Looks like deals you won', body: 'Matches 3 past deals that converted from pilot: dev tools, 20 to 40 engineers, a first sales hire within 60 days of raising.', source: 'Your deal history' },
    ],
    timeline,
  }
}

/* ---------------- Quillstack (Turn 2) ---------------- */

const KICKOFF = `Pilot kickoff · Nov 18 · 45 min
Ana Ruiz, Ben Carter (Quillstack) · Priya Raman (Tracelane)

[12:05] Ana: Our problem is we hear about slow ledger calls from our customers before our own dashboards.
[14:20] Ana: If every team gets alerts in Slack when a span goes slow, that's the win for us.
[14:31] Priya: We'll have Slack alerts set up for all six teams in the first two weeks.
[18:02] Ben: And we'd want all forty services sending traces by week two.
[18:10] Priya: Agreed. And a weekly check-in with Ana until the pilot ends.`

function quillstack(step: StepId): Account {
  const flagged = reached(step, 'usage')
  const won = step === 'done'
  const checkin = reached(step, 'progress')
  const promises: PromiseItem[] = won
    ? [
        { id: 'p-alerts', promise: 'Slack alerts on slow spans, for all six teams', source: 'Kickoff call · 14:31', measure: 'Teams with alerts on', current: 6, target: 6, health: 'Healthy' },
        { id: 'p-services', promise: 'All 40 services sending traces by week 2', source: 'Kickoff call · 18:10', measure: 'Services sending traces', current: 40, target: 40, health: 'Healthy' },
        { id: 'p-checkin', promise: 'Weekly check-in with Ana until the pilot ends', source: 'Kickoff call · 18:10', measure: 'Check-ins held', current: 6, target: 6, health: 'Healthy' },
      ]
    : [
        { id: 'p-alerts', promise: 'Slack alerts on slow spans, for all six teams', source: 'Kickoff call · 14:31', measure: 'Teams with alerts on', current: 1, target: 6, health: flagged ? 'At risk' : 'Needs attention' },
        { id: 'p-services', promise: 'All 40 services sending traces by week 2', source: 'Kickoff call · 18:10', measure: 'Services sending traces', current: 31, target: 40, health: 'Needs attention' },
        { id: 'p-checkin', promise: 'Weekly check-in with Ana until the pilot ends', source: 'Kickoff call · 18:10', measure: 'Check-ins held', current: checkin ? 3 : 2, target: 6, health: 'Healthy' },
      ]
  const timeline: TimelineItem[] = [
    ...(won
      ? [
          { id: 'q-won', kind: 'email' as const, title: 'Signed: annual plan, $36K ARR', when: 'Today', actor: 'Grace Liu', summary: 'Pilot converted to paid. All three promises kept.' },
          { id: 'q-alerts', kind: 'usage' as const, title: 'Slack alerts on for 6 of 6 teams', when: '9 days ago', actor: 'Product usage', summary: 'Up from 1 of 6 within 4 days of the check-in.' },
        ]
      : []),
    ...(checkin
      ? [{ id: 'q-checkin', kind: 'email' as const, title: 'Slack alerts: 20 minutes to set them up together?', when: won ? '2 weeks ago' : 'Just now', actor: 'Priya Raman (approved)', summary: 'Check-in drafted by Pact from the kickoff promise.' }]
      : []),
    ...(flagged
      ? [{ id: 'q-usage', kind: 'usage' as const, title: 'Slack alerts used by 1 of 6 teams', when: won ? '3 weeks ago' : 'Today', actor: 'Product usage', summary: 'Promised for all six teams by week 2. Pilot ends in 12 days.' }]
      : []),
    { id: 'q-check2', kind: 'meeting', title: 'Weekly check-in #2', when: won ? '4 weeks ago' : '5 days ago', actor: 'Ana Ruiz, Priya Raman', summary: 'Ana: "Teams are busy with quarter-end." Alerts not discussed.' },
    { id: 'q-kickoff', kind: 'call', title: 'Pilot kickoff', when: 'Nov 18', actor: 'Ana Ruiz, Ben Carter, Priya Raman', summary: 'Three promises made: Slack alerts for six teams, 40 services by week 2, weekly check-ins.', body: KICKOFF },
    { id: 'q-plan', kind: 'email', title: 'Pilot plan and success criteria', when: 'Nov 15', actor: 'Priya Raman', summary: 'Six-week pilot. Success: every team alerted in Slack before customers notice.' },
  ]
  return {
    id: 'quillstack',
    name: 'Quillstack',
    domain: 'quillstack.com',
    industry: 'Fintech · ledger APIs',
    hq: 'New York, NY',
    employees: 52,
    status: won ? 'Customer' : 'Pilot',
    health: won ? 'Healthy' : flagged ? 'At risk' : 'Healthy',
    arr: won ? '$36K ARR' : '$36K at stake',
    lastTouch: won ? 'Today' : flagged ? 'Today' : '5 days ago',
    people: [
      { name: 'Ana Ruiz', title: 'VP Engineering', email: 'ana@quillstack.com', role: 'Champion', cares: 'Hearing about slow ledger calls before customers do' },
      { name: 'Ben Carter', title: 'Head of Platform', email: 'ben@quillstack.com', role: 'Evaluator', cares: 'Coverage across all 40 services' },
      { name: 'Grace Liu', title: 'CFO', email: 'grace@quillstack.com', role: 'Economic buyer', cares: 'Annual cost against on-call hours saved' },
    ],
    summary:
      'Quillstack runs ledger APIs for fintech apps. 52 people. Six-week pilot started Nov 18; success means every team gets Slack alerts before customers notice a slow call.',
    findings: [
      { title: 'The pilot goal', body: 'Every team alerted in Slack when a ledger call goes slow, before their customers notice.', source: 'Kickoff call · 14:20' },
      { title: 'What converts fintech pilots', body: 'Fintech pilots that set up alerts in week 1 converted 3 of 3; without them, 0 of 2.', source: 'Your deal history' },
    ],
    timeline,
    promises,
    pilot: { started: 'Nov 18', ends: 'Dec 30', daysLeft: won ? 0 : 12, value: '$36K ARR' },
  }
}

/* ---------------- the rest of the 48 (a few shown) ---------------- */

const simple = (a: Omit<Account, 'timeline' | 'findings' | 'people'> & { contact: Person; note: string; when: string; finding: Finding }): Account => ({
  ...a,
  people: [a.contact],
  findings: [a.finding],
  timeline: [{ id: `${a.id}-last`, kind: 'email', title: a.note, when: a.when, actor: a.contact.name, summary: a.finding.body }],
})

const OTHERS: Account[] = [
  simple({ id: 'corvid', name: 'Corvid', domain: 'corvid.dev', industry: 'Dev tools · CI/CD', hq: 'Seattle, WA', employees: 27, status: 'Prospect', lastTouch: '3 days ago', summary: 'CI/CD platform. Raised a seed in October.', contact: { name: 'Lena Park', title: 'Head of Infrastructure', email: 'lena@corvid.dev', role: 'Champion', cares: 'Slow builds traced to flaky services' }, note: 'First note sent', when: '3 days ago', finding: { title: 'Why now', body: 'Seed round in October; three infrastructure roles open.', source: 'Funding news' } }),
  simple({ id: 'brightline', name: 'Brightline', domain: 'brightline.io', industry: 'Dev tools · feature flags', hq: 'Denver, CO', employees: 41, status: 'Customer', health: 'Healthy', arr: '$28K ARR', lastTouch: '1 week ago', summary: 'Feature-flag platform. Customer since May.', contact: { name: 'Owen Brooks', title: 'VP Engineering', email: 'owen@brightline.io', role: 'Champion', cares: 'Latency of flag evaluation at the edge' }, note: 'Quarterly review notes', when: '1 week ago', finding: { title: 'Expansion', body: 'Two more teams asked for seats in the last month.', source: 'Product usage' } }),
  simple({ id: 'mosaic', name: 'Mosaic Pay', domain: 'mosaicpay.com', industry: 'Fintech · payouts', hq: 'Chicago, IL', employees: 63, status: 'Customer', health: 'Healthy', arr: '$41K ARR', lastTouch: '4 days ago', summary: 'Payouts API. Converted from pilot in six weeks.', contact: { name: 'Sara Whitfield', title: 'Director of Platform', email: 'sara@mosaicpay.com', role: 'Champion', cares: 'Payout latency during peak hours' }, note: 'Renewal call booked', when: '4 days ago', finding: { title: 'Renewal', body: 'Renews in 9 weeks; usage up 30% since signing.', source: 'Product usage' } }),
  simple({ id: 'ferrous', name: 'Ferrous', domain: 'ferrous.build', industry: 'Dev tools · build systems', hq: 'Remote', employees: 24, status: 'Pilot', health: 'Healthy', arr: '$18K at stake', lastTouch: '2 days ago', summary: 'Build system for Rust teams. Pilot in week 3.', contact: { name: 'Ivo Marten', title: 'CTO', email: 'ivo@ferrous.build', role: 'Economic buyer', cares: 'Trace coverage across build workers' }, note: 'Weekly check-in #3', when: '2 days ago', finding: { title: 'On track', body: 'All three pilot promises on track.', source: 'Product usage' } }),
  simple({ id: 'orbitfin', name: 'Orbitfin', domain: 'orbitfin.co', industry: 'Fintech · card issuing', hq: 'Miami, FL', employees: 38, status: 'Customer', health: 'Needs attention', arr: '$22K ARR', lastTouch: '3 weeks ago', summary: 'Card-issuing APIs. Customer since August.', contact: { name: 'Nadia Hassan', title: 'Head of SRE', email: 'nadia@orbitfin.co', role: 'Champion', cares: 'Alert noise' }, note: 'Support thread about alert noise', when: '3 weeks ago', finding: { title: 'Quiet', body: 'No logins from two of three teams in 3 weeks.', source: 'Product usage' } }),
  simple({ id: 'lumenhall', name: 'Lumenhall', domain: 'lumenhall.health', industry: 'Health tech · scheduling', hq: 'Boston, MA', employees: 58, status: 'Prospect', lastTouch: '2 months ago', summary: 'Patient scheduling APIs. Pilot ended without converting.', contact: { name: 'Chris Odum', title: 'Engineering Manager', email: 'chris@lumenhall.health', role: 'Evaluator', cares: 'HIPAA logging' }, note: 'Pilot ended', when: '2 months ago', finding: { title: 'Outside focus', body: 'Health tech pilots: 0 of 3 converted. Not in the plan.', source: 'Your deal history' } }),
]

export function accountsFor(step: StepId): Account[] {
  const all = [halcyon(step), quillstack(step), ...OTHERS]
  return all.filter((a) => !a.appearsAt || reached(step, a.appearsAt))
}

export const accountFor = (step: StepId, id?: string) => accountsFor(step).find((a) => a.id === id)

/** Past deals Halcyon resembles (shown as evidence). */
export const LOOKALIKES = [
  ['Brightline', '28 engineers', 'Seed + first AE hire', 'Pilot → paid in 5 weeks'],
  ['Mosaic Pay', '41 engineers', 'Series A + first SDR', 'Pilot → paid in 6 weeks'],
  ['Orbitfin', '24 engineers', 'Seed + platform hires', 'Pilot → paid in 4 weeks'],
]

/** Weekly usage of the promised Slack alerts at Quillstack (teams with alerts on). */
export const quillstackAlerts = (step: StepId) =>
  step === 'done'
    ? [
        { label: 'Week 1', value: 1 },
        { label: 'Week 2', value: 1 },
        { label: 'Week 3', value: 4 },
        { label: 'Week 4', value: 6 },
        { label: 'Week 5', value: 6 },
      ]
    : [
        { label: 'Week 1', value: 1 },
        { label: 'Week 2', value: 1 },
      ]
