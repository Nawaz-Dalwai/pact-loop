import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Command } from 'cmdk'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Building2, Search, Sparkles } from 'lucide-react'
import { allNavItems } from './nav'
import { useDemo, useUi } from '@/store'
import { reached } from '@/demo/script'

/** ⌘K / Ctrl+K global search over pages and mock records. */
export function CommandPalette() {
  const open = useUi((s) => s.commandOpen)
  const setOpen = useUi((s) => s.setCommandOpen)
  const step = useDemo((s) => s.step)
  const setAskOpen = useUi((s) => s.setAskOpen)
  const accounts = [
    ...(reached(step, 'signal') ? [{ id: 'halcyon', name: 'Halcyon Labs', domain: 'halcyonlabs.io' }] : []),
    { id: 'quillstack', name: 'Quillstack', domain: 'quillstack.com' },
  ]
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(!useUi.getState().commandOpen)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  const item =
    'flex h-9 cursor-default items-center gap-2 rounded-md px-2 text-[13px] data-[selected=true]:bg-accent [&_svg]:size-4 [&_svg]:text-muted-foreground'
  const group =
    '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/20" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[18%] z-50 w-[620px] -translate-x-1/2 overflow-hidden rounded-xl border bg-popover shadow-2xl outline-none">
          <DialogPrimitive.Title className="sr-only">Search</DialogPrimitive.Title>
          <Command loop>
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="size-4 text-muted-foreground" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search records, activity, notes…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border px-1.5 text-[11px] text-muted-foreground">esc</kbd>
            </div>
            <Command.List className="max-h-[420px] overflow-y-auto p-1.5">
              {query.trim().length <= 2 && (
                <Command.Empty className="py-8 text-center text-[13px] text-muted-foreground">No results.</Command.Empty>
              )}
              {query.trim().length > 2 && (
                <Command.Group heading="Ask Pact" className={group} forceMount>
                  <Command.Item
                    value={`ask ${query}`}
                    forceMount
                    onSelect={() => {
                      setOpen(false)
                      setAskOpen(true)
                      setQuery('')
                    }}
                    className={item}
                  >
                    <Sparkles className="!text-violet-600" /> Ask Pact: <span className="truncate font-medium">{query.trim()}</span>
                  </Command.Item>
                </Command.Group>
              )}
              <Command.Group heading="Go to" className={group}>
                {allNavItems.map((n) => (
                  <Command.Item key={n.to} value={`page ${n.label}`} onSelect={() => go(n.to)} className={item}>
                    <n.icon /> {n.label}
                  </Command.Item>
                ))}
              </Command.Group>
              <Command.Group heading="Accounts" className={group}>
                {accounts.map((a) => (
                  <Command.Item key={a.id} value={`account ${a.name}`} onSelect={() => go(`/accounts/${a.id}`)} className={item}>
                    <Building2 /> {a.name}
                    <span className="ml-auto text-xs text-muted-foreground">{a.domain}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
