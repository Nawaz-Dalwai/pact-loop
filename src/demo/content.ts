import { reached, type StepId } from './script'

/** Notifications shown in the top bar, unlocked as the story moves on. */
export interface DemoNotification {
  id: string
  text: string
  at: string
  /** the step this notification drives; it shows an action button while that step is current */
  actionStep?: StepId
  actionLabel?: string
}

export function notificationsFor(step: StepId): DemoNotification[] {
  const list: DemoNotification[] = []
  if (reached(step, 'signal'))
    list.push({
      id: 'n-halcyon',
      text: 'Halcyon Labs, a past email contact, announced a $6M seed round and posted its first SDR job.',
      at: 'Just now',
      actionStep: 'signal',
      actionLabel: 'Open account',
    })
  list.push(
    { id: 'n-plan', text: 'Plan agreed: $1M ARR by Sep 30, 2027. Pact reports progress every turn.', at: 'Today' },
    { id: 'n-import', text: 'Pipeline built from past email: 48 accounts, 17 open threads, 3 live pilots.', at: 'Today' },
  )
  return list
}
