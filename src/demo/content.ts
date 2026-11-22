import { reached, type StepId } from './script'

/** Notifications in the top bar, unlocked as the story moves on (newest first). */
export interface DemoNotification {
  id: string
  text: string
  at: string
  /** while the demo is on this step, the notification carries an action button */
  actionStep?: StepId
  actionLabel?: string
  /** where the action goes */
  actionTo?: string
  /** whether the action moves the demo to its next step */
  advance?: boolean
}

export function notificationsFor(step: StepId, cap: string | null, autonomyOn: boolean): DemoNotification[] {
  const list: DemoNotification[] = []
  if (step === 'done') list.push({ id: 'n-won', text: 'Quillstack signed an annual plan: $36K ARR. All three pilot promises kept.', at: 'Today' })
  if (reached(step, 'usage')) {
    list.push({
      id: 'n-usage',
      text: 'Quillstack pilot: Slack alerts are on for 1 of 6 teams. You promised all six by week 2, and the pilot ends in 12 days.',
      at: step === 'usage' ? 'Just now' : 'Today',
      actionStep: 'usage',
      actionLabel: 'Open account',
      actionTo: '/accounts/quillstack/promises',
      advance: true,
    })
    if (autonomyOn) list.push({ id: 'n-runs', text: `Pact sent 4 first notes on its own this week, within your ${cap ?? '$50'} monthly cap. 1 reply so far.`, at: 'Yesterday' })
  }
  if (reached(step, 'brief'))
    list.push({
      id: 'n-reply',
      text: 'Maya Okafor at Halcyon Labs replied and booked Thursday, 2:00 PM. Pact prepared a call brief.',
      at: step === 'brief' ? 'Just now' : 'Yesterday',
      actionStep: 'brief',
      actionLabel: 'View call brief',
      actionTo: '/accounts/halcyon/brief',
    })
  if (reached(step, 'signal'))
    list.push({
      id: 'n-halcyon',
      text: 'Halcyon Labs, a past email contact, announced a $6M seed round and posted its first SDR job.',
      at: step === 'signal' ? 'Just now' : 'This week',
      actionStep: 'signal',
      actionLabel: 'Open account',
      actionTo: '/accounts/halcyon',
      advance: true,
    })
  list.push(
    { id: 'n-plan', text: 'Plan agreed: $1M ARR by Sep 30, 2027. Pact reports progress every turn.', at: 'This week' },
    { id: 'n-import', text: 'Pipeline built from past email: 48 accounts, 17 open threads, 3 live pilots.', at: 'This week' },
  )
  return list
}
