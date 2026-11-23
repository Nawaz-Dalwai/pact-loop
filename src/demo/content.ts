import { reached, type StepId } from './script'
import { pilotView } from './sources'
import { PLAN, goalLabel } from '@/data/plan'
import type { SourceId } from '@/store'

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
  /** router state for the action, e.g. which draft to open */
  actionState?: { open: 'halcyon' | 'checkin' }
}

export function notificationsFor(step: StepId, cap: string | null, autonomyOn: boolean, connected: SourceId[], goal: number): DemoNotification[] {
  const calendar = connected.includes('calendar')
  const list: DemoNotification[] = []
  if (step === 'done')
    list.push(
      { id: 'n-expansion', text: 'Pact drafted an expansion quote for Quillstack: 14 more seats, about $8K ARR. It’s in your queue.', at: 'Today' },
      { id: 'n-won', text: 'Quillstack signed an annual plan: $36K ARR. All three pilot promises kept.', at: 'Today' },
    )
  if (reached(step, 'usage')) {
    list.push({
      id: 'n-usage',
      text: pilotView(connected).notification,
      at: step === 'usage' ? 'Just now' : 'Today',
      actionStep: 'usage',
      actionLabel: 'Open check-in',
      actionTo: '/queue',
      actionState: { open: 'checkin' },
      advance: true,
    })
    if (autonomyOn) list.push({ id: 'n-runs', text: `Pact sent 4 first notes on its own this week, within your ${cap ?? '$50'} monthly cap. 1 reply so far.`, at: 'Yesterday' })
  }
  if (reached(step, 'offer'))
    list.push({
      id: 'n-reply',
      text: calendar
        ? 'Maya Okafor at Halcyon Labs replied and booked Thursday, 2:00 PM. Pact prepared a call brief.'
        : 'Maya Okafor at Halcyon Labs replied: "Thursday at 2:00 works." Pact sent the invite from your Gmail and prepared a call brief.',
      at: step === 'offer' ? 'Just now' : 'Yesterday',
    })
  if (reached(step, 'signal'))
    list.push({
      id: 'n-halcyon',
      text: 'Halcyon Labs announced a $6M seed round. Maya Okafor, your champion at Brightline, runs platform there.',
      at: step === 'signal' ? 'Just now' : 'This week',
      actionStep: 'signal',
      actionLabel: 'Open draft',
      actionTo: '/queue',
      actionState: { open: 'halcyon' },
      advance: true,
    })
  list.push(
    { id: 'n-plan', text: `Plan agreed: ${goalLabel(goal)} new ARR by ${PLAN.deadline}. Pact reports progress every turn.`, at: 'This week' },
    { id: 'n-import', text: 'Pipeline built from past email: 48 accounts, 17 open threads, 3 live pilots.', at: 'This week' },
  )
  return list
}
