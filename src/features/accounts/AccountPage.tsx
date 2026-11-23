import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import {
  Activity,
  AudioLines,
  Building2,
  ChevronDown,
  ChevronRight,
  FileText,
  Hash,
  Mail,
  Radio,
  Sparkles,
  TrendingUp,
  Users,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { RouteTabs } from '@/components/ui/tabs'
import { Avatar } from '@/components/ui/avatar'
import { EmptyState, KpiTiles, SectionCard } from '@/components/shared/record'
import { HealthBadge, StatusBadge } from '@/components/shared/pills'
import { Citation } from '@/components/chat/inline'
import { TargetBarChart } from '@/components/charts/TargetBarChart'
import { accountFor, quillstackAlerts, type Account, type TimelineKind } from '@/data/accounts'
import { reached } from '@/demo/script'
import { pilotView } from '@/demo/sources'
import { ConnectNudge } from '@/demo/ConnectNudge'
import { useDemo } from '@/store'
import { cn } from '@/lib/utils'
import { CallBrief } from './CallBrief'
import { ROLE_TONE } from './roles'

const KIND_ICON: Record<TimelineKind, LucideIcon> = { email: Mail, call: AudioLines, meeting: Video, signal: Radio, usage: Activity, slack: Hash }

/** A banner that moves the story on (same anatomy as the suggestions banner). */
function NextBanner({ title, hint, onClick }: { title: string; hint: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="demo-pulse flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left hover:bg-table-background-hover">
      <span className="flex size-8 items-center justify-center rounded-md bg-violet-50">
        <Sparkles className="size-4 text-violet-600" />
      </span>
      <span className="flex-1">
        <span className="block text-[13px] font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  )
}

function Overview({ a }: { a: Account }) {
  return (
    <div className="space-y-4">
      {a.signals && (
        <SectionCard title="Why now" icon={Radio}>
          <ul className="space-y-3">
            {a.signals.map((s) => (
              <li key={s.title} className="text-[13px] leading-relaxed">
                <span className="font-semibold">{s.title}</span> — {s.body} <Citation label={s.source} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
      <SectionCard title="Research brief" icon={Sparkles} actions={<span className="text-xs text-muted-foreground">Researched by Pact · every line cited</span>}>
        <p className="text-[13px] leading-relaxed">{a.summary}</p>
        <ul className="mt-3 space-y-3">
          {a.findings.map((f) => (
            <li key={f.title} className="text-[13px] leading-relaxed">
              <span className="font-semibold">{f.title}</span> — {f.body} <Citation label={f.source} />
            </li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="People" icon={Users}>
        <ul className="-my-1 divide-y">
          {a.people.map((p) => (
            <li key={p.email} className="flex items-center gap-3 py-2.5">
              <Avatar name={p.name} size={28} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.title}</span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">Cares about: {p.cares}</span>
              </span>
              <span className={cn('inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium', ROLE_TONE[p.role])}>{p.role}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}

function Timeline({ a }: { a: Account }) {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div>
      <p className="mb-4 text-xs text-muted-foreground">Every interaction kept whole: open an item to read it in full, not a summary.</p>
      <ol className="relative space-y-5 border-l pl-6">
        {a.timeline.map((e) => {
          const Icon = KIND_ICON[e.kind]
          return (
            <li key={e.id} className="relative">
              <span className="absolute -left-[37px] flex size-6 items-center justify-center rounded-full border bg-background">
                <Icon className="size-3 text-muted-foreground" />
              </span>
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[13px] font-medium">{e.title}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{e.when}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{e.summary}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">by {e.actor}</p>
              {e.body && (
                <>
                  <button onClick={() => setOpen(open === e.id ? null : e.id)} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                    <ChevronDown className={cn('size-3.5 transition-transform', open !== e.id && '-rotate-90')} />
                    {open === e.id ? 'Hide full text' : 'Read full text'}
                  </button>
                  {open === e.id && <pre className="mt-2 whitespace-pre-wrap rounded-lg border bg-muted/40 p-3 font-sans text-[13px] leading-relaxed">{e.body}</pre>}
                </>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Promises({ a }: { a: Account }) {
  const step = useDemo((s) => s.step)
  const product = useDemo((s) => s.connected.includes('product'))
  if (!a.promises) return <EmptyState icon={FileText} title="No promises yet" hint="Promises made on calls show up here once a pilot starts, tracked against product usage." />
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-[13px]">
          <thead className="text-muted-foreground">
            <tr className="border-b">
              <th className="h-9 px-3 text-left font-normal">Promise</th>
              <th className="px-3 text-left font-normal">Measured by</th>
              <th className="w-56 px-3 text-left font-normal">Progress</th>
              <th className="px-3 text-left font-normal">Health</th>
            </tr>
          </thead>
          <tbody>
            {a.promises.map((p) => {
              const pct = (p.current ?? 0) / p.target
              return (
                <tr key={p.id} className="border-b align-top last:border-0">
                  <td className="px-3 py-3">
                    <span className="font-medium">{p.promise}</span>
                    <span className="mt-1 block">
                      <Citation label={p.source} />
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{p.measure}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn('h-full rounded-full', p.health === 'Healthy' ? 'bg-green-600' : p.health === 'Needs attention' ? 'bg-amber-500' : 'bg-red-500')}
                          style={{ width: `${Math.min(100, pct * 100)}%` }}
                        />
                      </div>
                      <span className={cn('text-right text-xs tabular-nums', p.current === null ? 'w-20 text-muted-foreground' : 'w-12')}>
                        {p.current === null ? 'Not measured' : `${p.current} / ${p.target}`}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <HealthBadge health={p.health} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {product ? (
        <SectionCard title="Slack alerts: teams with alerts on" icon={TrendingUp} actions={<span className="text-xs text-muted-foreground">Red line: promised (6 teams by week 2)</span>}>
          <TargetBarChart data={quillstackAlerts(step)} target={6} height={200} format={(n) => String(n)} />
        </SectionCard>
      ) : (
        <ConnectNudge id="product" />
      )}
    </div>
  )
}

/** /accounts/:id/:tab — one live record per account: research, timeline, promises, call brief. */
export default function AccountPage() {
  const { id, tab } = useParams()
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()
  const connected = useDemo((s) => s.connected)
  const a = accountFor(step, id, connected)

  if (!a) {
    return (
      <>
        <PageHeader icon={Building2} crumbs={[{ label: 'Accounts', to: '/accounts' }, { label: 'Not found' }]} />
        <EmptyState
          icon={Building2}
          title="Account not found"
          hint="It may not exist yet at this point in the demo."
          action={
            <Button asChild variant="outline" size="sm">
              <Link to="/accounts">Back to accounts</Link>
            </Button>
          }
        />
      </>
    )
  }

  const base = `/accounts/${a.id}`
  const current = tab ?? 'overview'
  const hasBrief = a.id === 'halcyon' && reached(step, 'offer')

  return (
    <>
      <PageHeader icon={Building2} crumbs={[{ label: 'Accounts', to: '/accounts' }, { label: a.name }]} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[1040px] px-8 py-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-neutral-100 text-base font-semibold text-neutral-600">{a.name[0]}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-medium">{a.name}</h1>
                <StatusBadge status={a.status} />
                {a.health && <HealthBadge health={a.health} />}
              </div>
              <p className="text-[13px] text-muted-foreground">
                {a.domain} · {a.industry} · {a.hq}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {a.id === 'halcyon' && (step === 'signal' || step === 'decide') && (
              <NextBanner
                title="Pact drafted a first note to Maya, and it's waiting in your queue"
                hint="Picks up your March thread · nothing sends without your yes"
                onClick={() => {
                  if (step === 'signal') next()
                  navigate('/queue', { state: { open: 'halcyon' } })
                }}
              />
            )}
            {a.id === 'quillstack' && (step === 'usage' || step === 'risk') && (
              <NextBanner
                title="Pact flagged a renewal risk and drafted a check-in"
                hint={pilotView(connected).bannerHint}
                onClick={() => {
                  if (step === 'usage') next()
                  navigate('/queue', { state: { open: 'checkin' } })
                }}
              />
            )}
            <KpiTiles
              items={
                a.pilot
                  ? [
                      { label: 'Pilot', value: `${a.pilot.started} – ${a.pilot.ends}` },
                      { label: 'Days left', value: a.pilot.daysLeft },
                      { label: 'Value', value: a.arr },
                      { label: 'Promises on track', value: `${a.promises?.filter((p) => p.health === 'Healthy').length ?? 0} of ${a.promises?.length ?? 0}` },
                      ...(a.healthScore
                        ? [
                            {
                              label: 'Health score',
                              value: a.healthScore.was ? `${a.healthScore.was} → ${a.healthScore.now}` : a.healthScore.now,
                              hint: 'From usage, replies and promises kept',
                            },
                          ]
                        : []),
                    ]
                  : [
                      { label: 'Value', value: a.arr ?? '—' },
                      { label: 'Engineers', value: a.employees > 40 ? '30+' : '~20' },
                      { label: 'People', value: a.people.length },
                      { label: 'Last touch', value: a.lastTouch },
                    ]
              }
            />
          </div>

          <RouteTabs
            className="mt-6 px-0"
            tabs={[
              { label: 'Overview', to: base },
              { label: 'Timeline', to: `${base}/timeline`, count: a.timeline.length },
              ...(a.promises ? [{ label: 'Promises', to: `${base}/promises`, count: a.promises.length }] : []),
              ...(hasBrief ? [{ label: 'Call brief', to: `${base}/brief` }] : []),
            ]}
          />

          <div className="pt-5">
            {current === 'overview' && <Overview a={a} />}
            {current === 'timeline' && <Timeline a={a} />}
            {current === 'promises' && <Promises a={a} />}
            {current === 'brief' && (hasBrief ? <CallBrief /> : <EmptyState icon={FileText} title="No call booked yet" />)}
          </div>
        </div>
      </div>
    </>
  )
}
