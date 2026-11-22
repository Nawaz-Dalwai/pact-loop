import { useDemo } from '@/store'
import { reached } from './script'

/** Items waiting on the founder in the queue at the current step. */
export function useQueueCount() {
  const step = useDemo((s) => s.step)
  let n = 0
  if (reached(step, 'account') && !reached(step, 'reply')) n += 1 // Halcyon first note
  if (reached(step, 'promises') && !reached(step, 'progress')) n += 1 // Quillstack renewal risk
  return n
}
