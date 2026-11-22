import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import {
  Check,
  ChevronDown,
  Clock,
  Copy,
  FileText,
  List,
  Loader2,
  Mail,
  Send,
  BarChart3,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import type { ChatBlock, ChatMessage } from './types'
import { Inline } from './inline'
import { useStreamedBlocks } from './useStream'
import { cn } from '@/lib/utils'

/* ---------- user prompt bubble ---------- */
export function UserBubble({ text }: { text: string }) {
  return <div className="ml-auto w-fit max-w-[85%] rounded-xl bg-muted px-3.5 py-2.5 text-[13px] leading-relaxed">{text}</div>
}

/* ---------- "Gathered context" disclosure ---------- */
export function ContextDisclosure({ steps, running }: { steps: string[]; running?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="text-xs text-muted-foreground">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1 hover:text-foreground">
        {running ? <Loader2 className="size-3 animate-spin" /> : <ChevronDown className={cn('size-3 transition-transform', !open && '-rotate-90')} />}
        {running ? 'Gathering context…' : 'Gathered context'}
      </button>
      {open && !running && (
        <ul className="ml-1.5 mt-1.5 space-y-1 border-l pl-3">
          {steps.map((s) => (
            <li key={s} className="flex items-center gap-1.5">
              <Check className="size-3 text-green-600" /> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- artifact card (list, doc, sequence, email, report) ---------- */
const artifactIcon = { list: List, doc: FileText, sequence: Send, email: Mail, report: BarChart3 }

export function ArtifactCard({ kind, title, to }: { kind: keyof typeof artifactIcon; title: string; to?: string }) {
  const navigate = useNavigate()
  const Icon = artifactIcon[kind]
  return (
    <button
      onClick={() => to && navigate(to)}
      className="flex w-full max-w-[440px] items-center gap-3 rounded-lg border bg-background px-3.5 py-3 text-left shadow-xs transition-colors hover:bg-accent"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm">{title}</span>
    </button>
  )
}

/* ---------- block renderer ---------- */
export function Blocks({ blocks }: { blocks: ChatBlock[] }) {
  return (
    <div className="space-y-3 text-[13px] leading-relaxed">
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return <p key={i}><Inline text={b.text} /></p>
          case 'h':
            return b.level === 3 ? (
              <h4 key={i} className="pt-1 text-[13px] font-semibold"><Inline text={b.text} /></h4>
            ) : (
              <h3 key={i} className="pt-2 text-[15px] font-semibold"><Inline text={b.text} /></h3>
            )
          case 'ul':
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5 marker:text-muted-foreground">
                {b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}
              </ul>
            )
          case 'ol':
            return (
              <ol key={i} className="list-decimal space-y-1.5 pl-5 marker:text-muted-foreground">
                {b.items.map((it, j) => <li key={j}><Inline text={it} /></li>)}
              </ol>
            )
          case 'quote':
            return <blockquote key={i} className="border-l-2 pl-3 italic text-muted-foreground"><Inline text={b.text} /></blockquote>
          case 'table':
            return (
              <div key={i} className="overflow-x-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50">
                    <tr>{b.columns.map((c) => <th key={c} className="border-b px-2.5 py-2 text-left font-medium">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, j) => (
                      <tr key={j} className="border-b last:border-0">
                        {r.map((c, k) => <td key={k} className="px-2.5 py-2 align-top"><Inline text={c} /></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'artifact':
            return <ArtifactCard key={i} kind={b.kind} title={b.title} to={b.to} />
        }
      })}
    </div>
  )
}

/* ---------- feedback row ---------- */
export function FeedbackBar({ copyText }: { copyText: string }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const btn = 'rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground'
  return (
    <div className="flex items-center gap-0.5">
      <button className={cn(btn, vote === 'up' && 'text-foreground')} onClick={() => setVote(vote === 'up' ? null : 'up')} aria-label="Good response">
        <ThumbsUp className={cn('size-3.5', vote === 'up' && 'fill-current')} />
      </button>
      <button className={cn(btn, vote === 'down' && 'text-foreground')} onClick={() => setVote(vote === 'down' ? null : 'down')} aria-label="Bad response">
        <ThumbsDown className={cn('size-3.5', vote === 'down' && 'fill-current')} />
      </button>
      <button
        className={btn}
        aria-label="Copy"
        onClick={() => {
          navigator.clipboard?.writeText(copyText).catch(() => {})
          toast('Copied to clipboard')
        }}
      >
        <Copy className="size-3.5" />
      </button>
    </div>
  )
}

const plainText = (blocks: ChatBlock[]) =>
  blocks
    .map((b) => ('text' in b ? b.text : 'items' in b ? b.items.join('\n') : 'title' in b ? b.title : ''))
    .join('\n\n')
    .replace(/\*\*|_|\[\[|\]\]/g, '')

/**
 * Assistant turn: "Gathered context" → streamed blocks → "Thought for Ns" + feedback.
 * `animate` streams it in (new message); otherwise renders instantly.
 */
export function AssistantMessage({
  message,
  animate = false,
  onDone,
}: {
  message: ChatMessage
  animate?: boolean
  onDone?: () => void
}) {
  const blocks = message.blocks ?? []
  const thinkMs = 900 + (message.context?.length ?? 0) * 250
  const [thinking, setThinking] = useState(animate)
  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setThinking(false), thinkMs)
    return () => clearTimeout(t)
  }, [animate, thinkMs])

  // Streaming starts after the "thinking" delay
  const { visible, done } = useStreamedBlocks(blocks, animate, 55, thinkMs)
  const shownBlocks = thinking ? [] : visible

  useEffect(() => {
    if (done && !thinking && animate) onDone?.()
  }, [done, thinking, animate, onDone])

  return (
    <div className="space-y-2.5">
      {message.context && <ContextDisclosure steps={message.context} running={thinking} />}
      {shownBlocks.length > 0 && <Blocks blocks={shownBlocks} />}
      {done && !thinking && (
        <div className="space-y-1.5 pt-1">
          {message.thoughtSeconds !== undefined && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" /> Thought for {message.thoughtSeconds}s
            </p>
          )}
          <FeedbackBar copyText={plainText(blocks)} />
        </div>
      )}
    </div>
  )
}
