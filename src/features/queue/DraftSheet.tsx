import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Keyboard, Loader2, Mail, Send, Sparkles, X } from 'lucide-react'
import { Dialog, DialogClose, DialogTitle, SheetContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Tooltip } from '@/components/ui/tooltip'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { AssistantMessage } from '@/components/chat/Message'
import type { ChatMessage } from '@/components/chat/types'
import { useCurrentUser } from '@/store'
import { cn } from '@/lib/utils'
import { openerWordsOf } from './opener'

export interface DraftSpec {
  id: string
  to: string
  subject: string
  html: string
  /** header of the reasoning pane */
  paneTitle: string
  message: ChatMessage
  /** Turn 1: the opener (2nd paragraph) must be cut to this many words before approval */
  maxOpenerWords?: number
  /** the founder's own shorter opener, typed in by "Type my edit" */
  myOpener?: string
}


/** Split the drafted HTML into top-level chunks so it can "type" into the editor. */
const chunksOf = (html: string) => html.split(/\n(?=<)/).map((s) => s.trim()).filter(Boolean)

/**
 * The Decide surface: composer on the left (Pact's draft streams in, the founder edits it),
 * Pact's reasoning and evidence on the right. Approve sends; nothing goes out without it.
 */
export function DraftSheet({
  draft,
  open,
  onOpenChange,
  onApprove,
}: {
  draft: DraftSpec
  open: boolean
  onOpenChange: (v: boolean) => void
  onApprove: (html: string) => void
}) {
  const user = useCurrentUser()
  const [html, setHtml] = useState('')
  const [filling, setFilling] = useState(false)
  const [typing, setTyping] = useState(false)
  const [reasoned, setReasoned] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    window.clearInterval(timer.current)
    setHtml('')
    setFilling(false)
    setTyping(false)
    setReasoned(false)
  }, [open, draft.id])
  useEffect(() => () => window.clearInterval(timer.current), [])

  // Once Pact has shown its reasoning, stream the draft into the composer
  const onDone = useCallback(() => {
    setReasoned(true)
    const parts = chunksOf(draft.html)
    let i = 0
    setFilling(true)
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      i += 1
      setHtml(parts.slice(0, i).join(''))
      if (i >= parts.length) {
        window.clearInterval(timer.current)
        setFilling(false)
      }
    }, 200)
  }, [draft.html])

  // "Type my edit": replace the opener with the founder's own, a few characters at a time
  const typeMyEdit = () => {
    if (!draft.myOpener) return
    const target = draft.myOpener
    let n = 0
    setTyping(true)
    window.clearInterval(timer.current)
    timer.current = window.setInterval(() => {
      n = Math.min(target.length, n + 3)
      setHtml((current) => {
        const doc = new DOMParser().parseFromString(current, 'text/html')
        const p = doc.querySelectorAll('p')[1]
        if (p) p.textContent = target.slice(0, n)
        return doc.body.innerHTML
      })
      if (n >= target.length) {
        window.clearInterval(timer.current)
        setTyping(false)
      }
    }, 30)
  }

  const opener = openerWordsOf(html)
  const needsEdit = draft.maxOpenerWords !== undefined
  const openerOk = !needsEdit || (html !== '' && opener > 0 && opener <= draft.maxOpenerWords!)
  const ready = html !== '' && !filling && !typing && openerOk

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent hideClose className="w-[920px] flex-row" aria-describedby={undefined}>
        {/* ---------- composer ---------- */}
        <div className="flex min-w-0 flex-1 flex-col border-r">
          <div className="flex h-12 items-center gap-2 border-b px-4">
            <DialogClose className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Close">
              <X className="size-4" />
            </DialogClose>
            <DialogTitle className="truncate text-[13px] font-medium">{draft.subject}</DialogTitle>
          </div>
          <div className="border-b text-[13px]">
            <div className="flex items-center gap-3 border-b px-4 py-1.5">
              <span className="w-14 shrink-0 text-muted-foreground">From</span>
              <Select
                value="gmail"
                onValueChange={() => {}}
                options={[{ value: 'gmail', label: `${user.email} (Gmail)` }]}
                className="h-7 border-0 px-1 shadow-none"
                icon={<Mail className="size-3.5 text-muted-foreground" />}
              />
            </div>
            <div className="flex items-center gap-3 border-b px-4 py-1.5">
              <span className="w-14 shrink-0 text-muted-foreground">To</span>
              <span className="inline-flex h-6 items-center gap-1 rounded-md border bg-muted/40 px-1.5 text-xs">{draft.to}</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2">
              <span className="w-14 shrink-0 text-muted-foreground">Subject</span>
              <span>{draft.subject}</span>
            </div>
          </div>

          {needsEdit && html !== '' && !filling && (!openerOk || typing) && (
            <div className="flex items-center gap-3 border-b bg-amber-50/70 px-4 py-2 text-xs text-amber-900">
              <span className="flex-1">
                Pact's opener runs {opener} words. Your sent notes open in under {draft.maxOpenerWords}. Shorten it in the editor to approve.
              </span>
              {draft.myOpener && (
                <Button size="sm" variant="outline" className="demo-pulse shrink-0 bg-background" onClick={typeMyEdit} disabled={typing}>
                  <Keyboard /> Type my edit
                </Button>
              )}
            </div>
          )}

          <div className="relative min-h-0 flex-1 p-3">
            <RichTextEditor value={html} onChange={setHtml} placeholder="Pact is drafting…" className="h-full border-0" minHeight={300} />
            {html === '' && (
              <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center">
                <span className="flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-xs">
                  <Loader2 className="size-3.5 animate-spin" /> {reasoned ? 'Drafting…' : 'Pact is gathering context…'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5">
            {needsEdit && html !== '' && !filling ? (
              openerOk && !typing ? (
                <span className="flex items-center gap-1.5 text-xs text-green-700">
                  <Check className="size-3.5" /> Opener: {opener} words. Ready to approve.
                </span>
              ) : (
                <span className="text-xs text-amber-700">Shorten the opener to approve</span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-violet-700">
                <Sparkles className="size-3.5" /> Drafted by Pact · sends only on your approval
              </span>
            )}
            <div className="flex shrink-0 items-center gap-1.5">
              <Tooltip content="This demo approves this draft. Dismiss works on digest items." side="top">
                <span>
                  <Button variant="outline" disabled>
                    Dismiss
                  </Button>
                </span>
              </Tooltip>
              <Button disabled={!ready} className={cn(ready && 'demo-pulse')} onClick={() => onApprove(html)}>
                <Send /> Approve & send
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- Pact's reasoning ---------- */}
        <div className="flex w-[380px] shrink-0 flex-col">
          <div className="flex h-12 items-center gap-2 border-b px-4">
            <Sparkles className="size-4 text-violet-600" />
            <span className="flex-1 truncate text-[13px] font-medium">{draft.paneTitle}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-4">{open && <AssistantMessage key={draft.id} message={draft.message} animate onDone={onDone} />}</div>
          <p className="border-t px-4 py-2 text-center text-[11px] text-muted-foreground">Pact can make mistakes, please check important info.</p>
        </div>
      </SheetContent>
    </Dialog>
  )
}
