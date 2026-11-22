import { useNavigate } from 'react-router'
import { Bell, Inbox, MessageSquare, Search } from 'lucide-react'
import { useDemo, useUi } from '@/store'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { notificationsFor } from '@/demo/content'
import { nextStep, stepInfo } from '@/demo/script'
import { useQueueCount } from '@/demo/useQueue'
import { cn } from '@/lib/utils'

function Dot() {
  return <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-red-500" />
}

/** Global top bar: search (opens ⌘K), Notifications, Queue, Ask Pact. Used on Home. */
export function TopBar() {
  const setCommandOpen = useUi((s) => s.setCommandOpen)
  const setAskOpen = useUi((s) => s.setAskOpen)
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()
  const cap = useDemo((s) => s.autonomyCap)
  const autonomyOn = useDemo((s) => s.autonomyOn)
  const notifications = notificationsFor(step, cap, autonomyOn)
  const actionable = notifications.find((n) => n.actionStep === step)
  const queueCount = useQueueCount()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 px-4">
      <button
        onClick={() => setCommandOpen(true)}
        className="flex h-8 w-[460px] items-center gap-2 rounded-lg bg-neutral-500/10 px-2.5 text-[13px] text-muted-foreground hover:bg-neutral-500/15"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search records, activity, notes…</span>
        <kbd className="font-sans text-xs text-muted-foreground/70">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium hover:bg-accent',
                actionable && 'demo-pulse',
              )}
            >
              <span className="relative">
                <Bell className="size-4" />
                {actionable && <Dot />}
              </span>
              Notifications
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b px-3 py-2 text-[13px] font-medium">Notifications</div>
            <ul className="max-h-80 overflow-y-auto">
              {notifications.map((n) => {
                const live = n.actionStep === step
                return (
                  <li key={n.id} className="flex gap-2 border-b px-3 py-2.5 last:border-0">
                    <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${live ? 'bg-blue-500' : 'bg-transparent'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug">{n.text}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{n.at}</p>
                      {live && n.actionLabel && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="demo-pulse mt-2"
                          onClick={() => {
                            if (n.advance) next()
                            navigate(n.actionTo ?? stepInfo(nextStep(step)).route)
                          }}
                        >
                          {n.actionLabel}
                        </Button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </PopoverContent>
        </Popover>

        <button
          onClick={() => navigate('/queue')}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium hover:bg-accent"
        >
          <span className="relative">
            <Inbox className="size-4" />
            {queueCount > 0 && <Dot />}
          </span>
          Queue
          {queueCount > 0 && <span className="rounded bg-muted px-1 text-[11px] font-medium text-muted-foreground">{queueCount}</span>}
        </button>

        <button
          onClick={() => setAskOpen(true)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium hover:bg-accent"
        >
          <MessageSquare className="size-4" />
          Ask Pact
        </button>
      </div>
    </header>
  )
}
