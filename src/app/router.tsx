import { createHashRouter } from 'react-router'
import { AppShell, OnboardingShell } from '@/components/layout/AppShell'
import { Resume } from './Resume'
import Home from '@/pages/Home'
import ConnectPage from '@/features/onboarding/ConnectPage'
import LearnPage from '@/features/onboarding/LearnPage'
import PlanPage from '@/features/onboarding/PlanPage'
import QueuePage from '@/features/queue/QueuePage'
import AccountsPage from '@/features/accounts/AccountsPage'
import AccountPage from '@/features/accounts/AccountPage'
import AutonomyPage from '@/features/autonomy/AutonomyPage'
import PlanProgressPage from '@/features/plan/PlanProgressPage'

/**
 * Hash routes (#/queue) so the static build works on any host, GitHub Pages included,
 * and every screen has a shareable link.
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
      { path: 'queue', element: <QueuePage /> },
      { path: 'accounts', element: <AccountsPage /> },
      { path: 'accounts/:id', element: <AccountPage /> },
      { path: 'accounts/:id/:tab', element: <AccountPage /> },
      { path: 'plan', element: <PlanProgressPage /> },
      { path: 'autonomy', element: <AutonomyPage /> },
      { path: '*', element: <Resume /> },
    ],
  },
])
