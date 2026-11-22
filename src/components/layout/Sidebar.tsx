import { NavLink, useNavigate } from 'react-router'
import { LogOut, PanelLeft, RotateCcw, Settings } from 'lucide-react'
import { navGroups } from './nav'
import { PactMark } from './Logo'
import { Tooltip } from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCurrentUser, useDemo, useUi } from '@/store'
import { cn, initials } from '@/lib/utils'

/**
 * Collapsible sidebar. Collapsed = 48px icon rail;
 * expanded = 232px with group labels (default).
 */
export function Sidebar() {
  const expanded = useUi((s) => s.sidebarExpanded)
  const setExpanded = useUi((s) => s.setSidebarExpanded)
  const user = useCurrentUser()
  const resetDemo = useDemo((s) => s.reset)
  const navigate = useNavigate()

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200',
        expanded ? 'w-[232px]' : 'w-12',
      )}
    >
      {/* brand + collapse toggle */}
      <div className={cn('flex h-12 items-center', expanded ? 'justify-between px-3' : 'justify-center')}>
        <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-foreground">
          <PactMark className="size-[22px]" />
          {expanded && <span className="text-[15px] font-semibold tracking-tight">Pact</span>}
        </button>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="rounded-md p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <PanelLeft className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-3 overflow-y-auto px-2 pb-2 pt-1">
        {navGroups.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-0.5">
            {group.label &&
              (expanded ? (
                <div className="px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground">{group.label}</div>
              ) : (
                <div className="mx-auto my-1 h-px w-5 bg-sidebar-border" />
              ))}
            {group.items.map((item) => {
              const link = (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex h-8 items-center gap-2 rounded-lg text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
                      expanded ? 'px-2' : 'justify-center',
                      isActive && 'bg-sidebar-accent font-medium',
                    )
                  }
                >
                  <item.icon className="size-4 shrink-0 text-foreground/80" strokeWidth={1.75} />
                  {expanded && <span className="truncate">{item.label}</span>}
                </NavLink>
              )
              return expanded ? (
                <div key={item.to}>{link}</div>
              ) : (
                <Tooltip key={item.to} content={item.label}>
                  {link}
                </Tooltip>
              )
            })}
          </div>
        ))}
      </nav>

      {/* footer: expand toggle + user menu */}
      <div className={cn('flex flex-col gap-1 border-t border-sidebar-border p-2', !expanded && 'items-center')}>
        {!expanded && (
          <Tooltip content="Expand sidebar">
            <button
              onClick={() => setExpanded(true)}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <PanelLeft className="size-4" />
            </button>
          </Tooltip>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex items-center gap-2 rounded-lg hover:bg-sidebar-accent',
                expanded ? 'h-9 w-full px-1.5' : 'size-8 justify-center',
              )}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-neutral-200 text-[10px] font-semibold">
                {initials(user.name)}
              </span>
              {expanded && (
                <span className="flex min-w-0 flex-col items-start leading-tight">
                  <span className="truncate text-[13px] font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56">
            <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                resetDemo()
                navigate('/onboarding/connect')
              }}
            >
              <RotateCcw /> Reset demo data
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled className="opacity-50">
              <LogOut /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}
