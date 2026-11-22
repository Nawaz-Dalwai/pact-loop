import { Navigate } from 'react-router'
import { stepInfo } from '@/demo/script'
import { useDemo } from '@/store'

/** Land wherever the demo currently is (also catches unknown links). */
export function Resume() {
  const step = useDemo((s) => s.step)
  return <Navigate to={stepInfo(step).route} replace />
}
