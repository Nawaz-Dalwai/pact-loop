import { useDemo } from '@/store'
import { reached } from './script'

/** Digest items: yesterday's suggestions the founder didn't get to (they roll into a daily digest). */
export const DIGEST = [
  { id: 'd-brightline', title: 'Follow up with Owen at Brightline', detail: 'Asked about two more seats 9 days ago; no reply yet.' },
  { id: 'd-orbitfin', title: 'Check in with Nadia at Orbitfin', detail: 'Two of three teams have not logged in for 3 weeks.' },
]

/** Items waiting on the founder at the current step, digest included. */
export function useQueueCount() {
  const step = useDemo((s) => s.step)
  const dismissed = useDemo((s) => s.dismissed)
  let n = DIGEST.filter((d) => !dismissed[d.id]).length
  if (reached(step, 'signal') && !reached(step, 'offer')) n += 1 // Halcyon first note
  if (reached(step, 'usage') && !reached(step, 'progress')) n += 1 // Quillstack renewal risk
  return n
}
