import { cn, initials } from '@/lib/utils'

const tones = [
  'bg-blue-100 text-blue-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-violet-100 text-violet-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
]

function toneFor(name: string) {
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return tones[h % tones.length]
}

/** Initial-letter avatar, as used throughout the capture (contacts, attendees). */
export function Avatar({
  name,
  size = 20,
  single = true,
  className,
}: {
  name: string
  size?: number
  single?: boolean
  className?: string
}) {
  const text = single ? name.trim()[0]?.toUpperCase() : initials(name)
  return (
    <span
      title={name}
      style={{ width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.48)) }}
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-medium', toneFor(name), className)}
    >
      {text}
    </span>
  )
}

export function AvatarStack({ names, max = 3, size = 20 }: { names: string[]; max?: number; size?: number }) {
  const shown = names.slice(0, max)
  const rest = names.length - shown.length
  return (
    <div className="flex items-center gap-0.5">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} />
      ))}
      {rest > 0 && (
        <span
          style={{ height: size, fontSize: 10 }}
          className="inline-flex items-center rounded-full bg-muted px-1.5 font-medium text-muted-foreground"
        >
          +{rest}
        </span>
      )}
    </div>
  )
}
