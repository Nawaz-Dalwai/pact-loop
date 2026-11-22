import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigation } from 'react-router'
import { Monitor } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { CommandPalette } from './CommandPalette'
import { AskPanel } from './AskPanel'
import { PactMark, PactWordmark } from './Logo'
import { allNavItems } from './nav'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { DemoGuide } from '@/demo/DemoGuide'
import { isSetup, stepInfo } from '@/demo/script'
import { useCurrentUser, useDemo } from '@/store'

export const MIN_WIDTH = 1280

function useWindowWidth() {
  const [w, setW] = useState(() => window.innerWidth)
  useEffect(() => {
    const on = () => setW(window.innerWidth)
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return w
}

/** Desktop-only prototype: below MIN_WIDTH show a blocker instead of a squashed layout. */
function TooSmall() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 bg-neutral-50 p-8 text-center">
      <PactMark className="size-10" />
      <Monitor className="size-6 text-muted-foreground" />
      <div>
        <p className="text-base font-medium">Your screen is too small for Pact</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          This prototype is built for desktop. Widen the window to at least {MIN_WIDTH}px.
        </p>
      </div>
    </div>
  )
}

const EXTRA_TITLES: Record<string, string> = { '/onboarding': 'Set up', '/accounts': 'Accounts' }

/** Browser tab title: the section name. */
function useDocumentTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const section = '/' + (pathname.split('/')[1] ?? '')
    const label = allNavItems.find((n) => n.to === section)?.label ?? EXTRA_TITLES[section]
    document.title = label ? `${label} · Pact` : 'Pact'
  }, [pathname])
}

/** Thin top bar while a page is loading. */
function NavProgress() {
  const busy = useNavigation().state === 'loading'
  return (
    <div className={`pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 transition-opacity ${busy ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`h-full bg-violet-500 ${busy ? 'w-2/3 transition-[width] duration-[2000ms] ease-out' : 'w-0'}`} />
    </div>
  )
}

/** The app: sidebar, demo guide, page, Ask Pact panel. Only reachable once setup is done. */
export function AppShell() {
  useDocumentTitle()
  const width = useWindowWidth()
  const step = useDemo((s) => s.step)
  if (width < MIN_WIDTH) return <TooSmall />
  if (isSetup(step)) return <Navigate to={stepInfo(step).route} replace />

  return (
    <TooltipProvider delayDuration={300}>
      <NavProgress />
      <div className="flex h-full overflow-hidden">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <DemoGuide />
          <Outlet />
        </main>
        <AskPanel />
      </div>
      <CommandPalette />
      <Toaster />
    </TooltipProvider>
  )
}

/** Full-screen setup, no sidebar. Fixed order: a visitor always lands on the current setup step. */
export function OnboardingShell() {
  useDocumentTitle()
  const width = useWindowWidth()
  const step = useDemo((s) => s.step)
  const user = useCurrentUser()
  const { pathname } = useLocation()
  if (width < MIN_WIDTH) return <TooSmall />
  if (!isSetup(step)) return <Navigate to="/home" replace />
  const route = stepInfo(step).route
  if (pathname !== route) return <Navigate to={route} replace />

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full flex-col overflow-hidden">
        <DemoGuide />
        <header className="flex h-12 shrink-0 items-center justify-between px-4">
          <PactWordmark />
          <span className="text-xs text-muted-foreground">
            Setting up {user.company} · {user.email}
          </span>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </TooltipProvider>
  )
}
