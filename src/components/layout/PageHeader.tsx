import { Fragment } from 'react'
import { Link } from 'react-router'
import { Ellipsis, MessageSquare, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUi } from '@/store'

export interface Crumb {
  label: string
  to?: string
}

/** Record/list page header: icon + breadcrumbs on the left, actions + "…" + Chat on the right. */
export function PageHeader({
  icon: Icon,
  crumbs,
  actions,
}: {
  icon?: LucideIcon
  crumbs: Crumb[]
  actions?: React.ReactNode
}) {
  const setAskOpen = useUi((s) => s.setAskOpen)
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b px-4">
      <nav className="flex min-w-0 items-center gap-2 text-[15px]">
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <Fragment key={i}>
              {i > 0 && <span className="text-muted-foreground/60">›</span>}
              {c.to && !last ? (
                <Link to={c.to} className="truncate text-muted-foreground hover:text-foreground">
                  {c.label}
                </Link>
              ) : (
                <span className={last ? 'truncate font-medium' : 'truncate text-muted-foreground'}>{c.label}</span>
              )}
            </Fragment>
          )
        })}
      </nav>
      <div className="flex shrink-0 items-center gap-1.5">
        {actions}
        <Button variant="ghost" size="icon" aria-label="More">
          <Ellipsis />
        </Button>
        <Button variant="outline" onClick={() => setAskOpen(true)}>
          <MessageSquare /> Chat
        </Button>
      </div>
    </header>
  )
}
