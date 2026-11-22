import { useState } from 'react'
import { ArrowUp, AtSign, Mic, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Ask Pact composer: textarea, "+" attach, optional context chip (e.g. the current record),
 * mic and send. Enter sends, Shift+Enter adds a newline.
 */
export function Composer({
  onSend,
  placeholder = 'Ask Pact almost anything…',
  contextLabel,
  onClearContext,
  disabled,
  initialValue = '',
  className,
}: {
  onSend: (text: string) => void
  placeholder?: string
  contextLabel?: string
  onClearContext?: () => void
  disabled?: boolean
  initialValue?: string
  className?: string
}) {
  const [value, setValue] = useState(initialValue)
  const send = () => {
    const t = value.trim()
    if (!t || disabled) return
    onSend(t)
    setValue('')
  }
  return (
    <div className={className}>
      <div className="rounded-xl border bg-background p-2 shadow-xs focus-within:ring-2 focus-within:ring-ring/30">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          rows={2}
          placeholder={placeholder}
          className="w-full resize-none bg-transparent px-1.5 pt-0.5 text-[13px] outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center gap-1">
          <button className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Attach">
            <Plus className="size-4" />
          </button>
          {contextLabel && (
            <span className="inline-flex h-6 items-center gap-1 rounded-md border px-1.5 text-xs">
              <AtSign className="size-3 text-muted-foreground" />
              {contextLabel}
              {onClearContext && (
                <button onClick={onClearContext} className="text-muted-foreground hover:text-foreground" aria-label="Remove context">
                  <X className="size-3" />
                </button>
              )}
            </span>
          )}
          <div className="ml-auto flex items-center gap-1">
            <button className="rounded-md p-1 text-muted-foreground hover:bg-accent" aria-label="Voice">
              <Mic className="size-4" />
            </button>
            <button
              onClick={send}
              disabled={!value.trim() || disabled}
              className={cn(
                'flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity',
                'disabled:opacity-25',
              )}
              aria-label="Send"
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-center text-[11px] text-muted-foreground">Pact can make mistakes, please check important info.</p>
    </div>
  )
}
