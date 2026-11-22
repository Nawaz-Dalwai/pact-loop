/** "$210.9K" style labels, one decimal (as in the capture's gauge). */
const compactMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${Math.round(n)}`

/**
 * Semicircle gauge with tick labels and a needle (the "Closed Won Revenue Quarter" tile).
 * Pure SVG so it scales cleanly and needs no chart library.
 */
export function Gauge({
  value,
  max,
  ticks = 8,
  label,
  format = compactMoney,
  onClick,
}: {
  value: number
  max: number
  ticks?: number
  label?: string
  format?: (n: number) => string
  onClick?: () => void
}) {
  const W = 420
  const H = 230
  const cx = W / 2
  const cy = 180
  const rOuter = 120
  const rInner = 72
  const frac = Math.max(0, Math.min(1, value / max))

  // angle: 180° (left) → 0° (right)
  const pt = (r: number, f: number) => {
    const a = Math.PI * (1 - f)
    return [cx + r * Math.cos(a), cy - r * Math.sin(a)] as const
  }
  const arc = (f0: number, f1: number) => {
    const [x0, y0] = pt(rOuter, f0)
    const [x1, y1] = pt(rOuter, f1)
    const [x2, y2] = pt(rInner, f1)
    const [x3, y3] = pt(rInner, f0)
    // A semicircle never spans more than 180°, so the large-arc flag is always 0
    const large = 0
    return `M${x0},${y0} A${rOuter},${rOuter} 0 ${large} 1 ${x1},${y1} L${x2},${y2} A${rInner},${rInner} 0 ${large} 0 ${x3},${y3} Z`
  }
  const [nx, ny] = pt(rOuter + 6, frac)

  return (
    <figure className="flex flex-col items-center" onClick={onClick} role={onClick ? 'button' : undefined}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[420px]">
        <path d={arc(0, 1)} className="fill-neutral-100" />
        <path d={arc(0, frac)} className="fill-blue-700 transition-all duration-700" />
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const f = i / ticks
          const [tx, ty] = pt(rOuter + 26, f)
          return (
            <text
              key={i}
              x={tx}
              y={ty}
              textAnchor={f < 0.45 ? 'end' : f > 0.55 ? 'start' : 'middle'}
              dominantBaseline="middle"
              className="fill-neutral-600 text-[11px]"
              style={{ fontWeight: i === ticks ? 600 : 400 }}
            >
              {format((max * i) / ticks)}
            </text>
          )
        })}
        <line x1={cx} y1={cy} x2={nx} y2={ny} className="stroke-neutral-800" strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} className="fill-neutral-800" />
        <text x={cx} y={cy + 30} textAnchor="middle" className="fill-neutral-900 text-[15px]" style={{ fontWeight: 600 }}>
          {format(value)}
        </text>
      </svg>
      {label && <figcaption className="-mt-2 text-xs text-muted-foreground">{label}</figcaption>}
    </figure>
  )
}
