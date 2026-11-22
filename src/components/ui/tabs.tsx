import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { NavLink } from 'react-router'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/* ---------- Radix underline tabs (in-page state) ---------- */
export const Tabs = TabsPrimitive.Root
export const TabsContent = TabsPrimitive.Content

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List className={cn('flex items-center gap-5 border-b', className)} {...props} />
}

const tabTrigger =
  'relative -mb-px flex h-9 items-center gap-1.5 border-b-2 border-transparent text-[13px] text-muted-foreground transition-colors hover:text-foreground [&_svg]:size-3.5'

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(tabTrigger, 'data-[state=active]:border-foreground data-[state=active]:text-foreground', className)}
      {...props}
    />
  )
}

/* ---------- Route-driven underline tabs (record pages: /sequences/:id/steps …) ---------- */
export interface RouteTab {
  label: string
  to: string
  icon?: LucideIcon
  count?: number
}

export function RouteTabs({ tabs, className }: { tabs: RouteTab[]; className?: string }) {
  return (
    <nav className={cn('flex items-center gap-5 border-b px-4', className)}>
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end
          className={({ isActive }) => cn(tabTrigger, isActive && 'border-foreground text-foreground')}
        >
          {t.icon && <t.icon />}
          {t.label}
          {t.count !== undefined && (
            <span className="rounded bg-muted px-1 text-[11px] font-medium text-muted-foreground">{t.count}</span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

/* ---------- Segmented control ("Needs action (11) | All replies (24)", "12h | 24h") ---------- */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode }[]
  className?: string
}) {
  return (
    <div className={cn('inline-flex items-center gap-0.5 rounded-lg bg-muted p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-6 rounded-md px-2 text-xs font-medium transition-colors',
            value === o.value ? 'bg-background text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
