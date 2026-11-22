import { Building2, House, Inbox, ShieldCheck, Target, type LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}
export interface NavGroup {
  label?: string
  items: NavItem[]
}

/** Sidebar groups: same rail as the reference, items for the loop. */
export const navGroups: NavGroup[] = [
  {
    items: [
      { label: 'Home', to: '/home', icon: House },
      { label: 'Queue', to: '/queue', icon: Inbox },
    ],
  },
  {
    label: 'Records',
    items: [{ label: 'Accounts', to: '/accounts', icon: Building2 }],
  },
  {
    label: 'Control',
    items: [
      { label: 'Plan', to: '/plan', icon: Target },
      { label: 'Autonomy', to: '/autonomy', icon: ShieldCheck },
    ],
  },
]

export const allNavItems = navGroups.flatMap((g) => g.items)
