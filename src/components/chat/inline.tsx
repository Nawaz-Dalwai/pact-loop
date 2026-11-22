import { Fragment } from 'react'
import { FileText } from 'lucide-react'

/** Small citation chip, e.g. a meeting or email the answer is grounded in. */
export function Citation({ label }: { label: string }) {
  return (
    <span
      title={label}
      className="mx-0.5 inline-flex h-[18px] max-w-[180px] translate-y-[-1px] items-center gap-1 rounded bg-muted px-1.5 align-middle text-[11px] font-medium text-muted-foreground hover:bg-neutral-200 hover:text-foreground"
    >
      <FileText className="size-2.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  )
}

const TOKEN = /(\*\*[^*]+\*\*|_[^_]+_|\[\[[^\]]+\]\])/g

/** Render inline markup: **bold**, _italic_, [[citation]]. */
export function Inline({ text }: { text: string }) {
  const parts = text.split(TOKEN)
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        if (p.startsWith('_') && p.endsWith('_') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>
        if (p.startsWith('[[') && p.endsWith(']]')) return <Citation key={i} label={p.slice(2, -2)} />
        return <Fragment key={i}>{p}</Fragment>
      })}
    </>
  )
}
