import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface BarDatum {
  label: string
  value: number
}

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n))

/**
 * Monthly bar chart with a dashed target line (the "Meetings Scheduled" report).
 * Bars are clickable so a page can drill into the deals underneath a segment.
 */
export function TargetBarChart({
  data,
  target,
  yLabel,
  xLabel,
  onBarClick,
  activeLabel,
  height = 300,
  format = compact,
}: {
  data: BarDatum[]
  target?: number
  yLabel?: string
  xLabel?: string
  onBarClick?: (d: BarDatum) => void
  activeLabel?: string
  height?: number
  format?: (n: number) => string
}) {
  return (
    <div style={{ height }} className="w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 16, left: 8, bottom: xLabel ? 28 : 8 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            label={xLabel ? { value: xLabel, position: 'insideBottom', offset: -18, fill: 'var(--foreground)', fontSize: 12 } : undefined}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickFormatter={format}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            label={yLabel ? { value: yLabel, angle: -90, position: 'insideLeft', fill: 'var(--foreground)', fontSize: 11, dy: 60 } : undefined}
          />
          <Tooltip
            cursor={{ fill: 'var(--muted)' }}
            contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 12, boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }}
            formatter={(v) => [format(Number(v)), yLabel ?? 'Value']}
          />
          {target !== undefined && (
            <ReferenceLine y={target} stroke="#dc2626" strokeDasharray="4 4" strokeWidth={1.5} ifOverflow="extendDomain" />
          )}
          <Bar
            dataKey="value"
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
            className={onBarClick ? 'cursor-pointer' : undefined}
            onClick={(d) => onBarClick?.((d as unknown as { payload: BarDatum }).payload)}
            shape={(props: unknown) => {
              const p = props as { x: number; y: number; width: number; height: number; payload: BarDatum }
              const active = !activeLabel || activeLabel === p.payload.label
              return <rect x={p.x} y={p.y} width={p.width} height={p.height} rx={3} fill="#1d4ed8" opacity={active ? 1 : 0.35} />
            }}
          >
            <LabelList dataKey="value" position="top" formatter={(v: unknown) => format(Number(v))} style={{ fill: 'var(--muted-foreground)', fontSize: 10 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
