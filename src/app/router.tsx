import { createHashRouter, Navigate } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout/AppShell'
import { stepInfo } from '@/demo/script'
import { useDemo } from '@/store'
import Home from '@/pages/Home'
import Placeholder from '@/pages/Placeholder'
import ConnectPage from '@/features/onboarding/ConnectPage'
import LearnPage from '@/features/onboarding/LearnPage'
import PlanPage from '@/features/onboarding/PlanPage'

/** Land on wherever the demo currently is. */
function Resume() {
  const step = useDemo((s) => s.step)
  return <Navigate to={stepInfo(step).route} replace />
}

/**
 * Hash routes (#/queue) so the static build works on any host and every step has a link.
 */
export const router = createHashRouter([
  { index: true, element: <Resume /> },
  {
    path: 'onboarding',
    element: <OnboardingShell />,
    children: [
      { path: 'connect', element: <ConnectPage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'plan', element: <PlanPage /> },
    ],
  },
  {
    element: <AppShell />,
    children: [
      { path: 'home', element: <Home /> },
      { path: '*', element: <Placeholder /> },
    ],
  },
])
