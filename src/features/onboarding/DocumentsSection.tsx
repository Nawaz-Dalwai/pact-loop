import { useEffect, useMemo, useState } from 'react'
import { Check, FileX, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { AssistantMessage } from '@/components/chat/Message'
import type { ChatMessage } from '@/components/chat/types'
import { SAMPLE_DOCS, docById, type DocId, type DocKind } from '@/data/documents'
import { useCurrentUser, useDemo } from '@/store'
import { cn } from '@/lib/utils'

const KIND_TONE: Record<DocKind, string> = {
  pdf: 'text-red-600',
  docx: 'text-blue-700',
  md: 'text-neutral-600',
  csv: 'text-green-700',
}

/** File-type tile: the extension in a small square, like a file icon. */
export function FileTile({ kind }: { kind: DocKind }) {
  return (
    <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-[10px] font-semibold uppercase', KIND_TONE[kind])}>
      {kind}
    </span>
  )
}

/** Fake file picker: sample documents instead of the visitor's own files. */
function PickerDialog({ open, onOpenChange, onUpload }: { open: boolean; onOpenChange: (v: boolean) => void; onUpload: (ids: DocId[]) => void }) {
  const user = useCurrentUser()
  const [picked, setPicked] = useState<DocId[]>([])
  const toggle = (id: DocId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const all = picked.length === SAMPLE_DOCS.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <div className="px-5 pb-3 pt-5">
          <DialogTitle className="text-[15px] font-medium">Choose files to upload</DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            This demo uses sample files for {user.company}. Nothing leaves your browser.
          </DialogDescription>
        </div>
        <ul className="mx-5 divide-y rounded-lg border">
          {SAMPLE_DOCS.map((d) => {
            const on = picked.includes(d.id)
            return (
              <li key={d.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-table-background-hover">
                  <Checkbox checked={on} onCheckedChange={() => toggle(d.id)} />
                  <FileTile kind={d.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {d.size} · {d.meta}
                    </span>
                  </span>
                  <span className="w-52 shrink-0 text-right text-xs text-muted-foreground">{d.learns}</span>
                </label>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t px-5 py-3">
          <button
            onClick={() => setPicked(all ? [] : SAMPLE_DOCS.map((d) => d.id))}
            className={cn('rounded-md px-1.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground', picked.length === 0 && 'demo-pulse')}
          >
            {all ? 'Clear selection' : 'Select all'}
          </button>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              disabled={picked.length === 0}
              className={cn(picked.length > 0 && 'demo-pulse')}
              onClick={() => {
                // keep the list in the picker's order
                onUpload(SAMPLE_DOCS.map((d) => d.id).filter((id) => picked.includes(id)))
                onOpenChange(false)
              }}
            >
              <Upload /> Upload {picked.length > 0 ? `${picked.length} file${picked.length === 1 ? '' : 's'}` : 'files'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * "Start from what you already have": upload a pitch deck, ICP doc, playbook… so Pact
 * pre-fills its questions, or skip and answer them.
 */
export function DocumentsSection() {
  const docsMode = useDemo((s) => s.docsMode)
  const uploads = useDemo((s) => s.uploads)
  const uploadsDone = useDemo((s) => s.uploadsDone)
  const docsRead = useDemo((s) => s.docsRead)
  const startUploads = useDemo((s) => s.startUploads)
  const finishUploads = useDemo((s) => s.finishUploads)
  const skipDocs = useDemo((s) => s.skipDocs)
  const setDocsRead = useDemo((s) => s.setDocsRead)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<Partial<Record<DocId, number>>>({})

  // Fake upload: each file fills its bar in turn, slightly staggered
  useEffect(() => {
    if (docsMode !== 'upload' || uploadsDone) return
    let tick = 0
    const timer = window.setInterval(() => {
      tick += 1
      const next: Partial<Record<DocId, number>> = {}
      uploads.forEach((id, i) => (next[id] = Math.max(0, Math.min(100, (tick - i * 3) * 14))))
      setProgress(next)
      if (uploads.every((id) => next[id] === 100)) {
        window.clearInterval(timer)
        finishUploads()
      }
    }, 70)
    return () => window.clearInterval(timer)
  }, [docsMode, uploadsDone, uploads, finishUploads])

  const summary = useMemo<ChatMessage>(
    () => ({
      id: `docs-read-${uploads.join('-')}`,
      role: 'assistant',
      context: uploads.map((id) => `Read ${docById(id).name} (${docById(id).meta})`),
      thoughtSeconds: 3 + uploads.length,
      blocks: [
        { type: 'p', text: `I read your ${uploads.length} document${uploads.length === 1 ? '' : 's'}. Here's what I took from them:` },
        { type: 'ul', items: uploads.map((id) => docById(id).finding) },
        {
          type: 'p',
          text: "I'll cite these in every draft and brief so you can check my work. Now a few quick confirmations instead of a questionnaire.",
        },
      ],
    }),
    [uploads],
  )

  return (
    <section className="mt-6">
      <h3 className="text-[15px] font-semibold">Start from what you already have</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        A pitch deck, ICP doc, sales playbook, messaging doc, interview notes or customer list. Pact reads them, so you
        confirm instead of typing.
      </p>

      {docsMode === null && (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            toast('This demo uses sample files', { description: 'Pick the documents to upload.' })
            setPickerOpen(true)
          }}
          className={cn(
            'mt-3 flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center transition-colors',
            dragging ? 'border-neutral-500 bg-neutral-100' : 'border-neutral-300 bg-neutral-50/60',
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-lg border bg-background">
            <Upload className="size-5 text-muted-foreground" />
          </span>
          <p className="mt-1 text-[13px] font-medium">Drop files here, or choose files</p>
          <p className="text-xs text-muted-foreground">PDF, DOCX, PPTX, MD or CSV · up to 25 MB each</p>
          <div className="mt-2 flex items-center gap-2">
            <Button className="demo-pulse" onClick={() => setPickerOpen(true)}>
              <Upload /> Choose files
            </Button>
            <Button variant="ghost" onClick={skipDocs}>
              Skip, I'll answer questions
            </Button>
          </div>
        </div>
      )}

      {docsMode === 'skip' && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs text-muted-foreground">
          <FileX className="size-3.5" /> No documents uploaded. Pact will ask instead.
        </div>
      )}

      {docsMode === 'upload' && (
        <div className="mt-3 space-y-4">
          <ul className="divide-y rounded-lg border bg-background">
            {uploads.map((id) => {
              const d = docById(id)
              const pct = uploadsDone ? 100 : (progress[id] ?? 0)
              return (
                <li key={id} className="flex items-center gap-3 px-4 py-2.5">
                  <FileTile kind={d.kind} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">{d.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {d.size} · {d.meta}
                    </span>
                  </span>
                  {pct < 100 ? (
                    <span className="flex w-40 items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className="block h-full rounded-full bg-blue-700 transition-[width] duration-75" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">{pct === 0 ? 'Waiting' : `${pct}%`}</span>
                    </span>
                  ) : docsRead ? (
                    <Badge tone="green">
                      <Check /> Read
                    </Badge>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Loader2 className="size-3 animate-spin" /> Reading…
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          {uploadsDone && <AssistantMessage message={summary} animate={!docsRead} onDone={setDocsRead} />}
        </div>
      )}

      <PickerDialog open={pickerOpen} onOpenChange={setPickerOpen} onUpload={startUploads} />
    </section>
  )
}
