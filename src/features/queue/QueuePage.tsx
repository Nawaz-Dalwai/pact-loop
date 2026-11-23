import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Check, ChevronDown, Clock, Inbox, Mail, ShieldCheck, TriangleAlert, UserRoundPlus, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Segmented } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState } from '@/components/shared/record'
import { StatusBadge } from '@/components/shared/pills'
import { Inline } from '@/components/chat/inline'
import { TargetBarChart } from '@/components/charts/TargetBarChart'
import { quillstackAlerts } from '@/data/accounts'
import { pilotView } from '@/demo/sources'
import { ConnectNudge } from '@/demo/ConnectNudge'
import { DIGEST } from '@/demo/useQueue'
import { reached } from '@/demo/script'
import { useCurrentUser, useDemo } from '@/store'
import { cn } from '@/lib/utils'
import { DraftSheet } from './DraftSheet'
import { openerWordsOf } from './opener'
import { ExpertDialog } from './ExpertDialog'
import { checkinDraft, expansionDraft, halcyonDraft } from './drafts'

const DISMISS_REASONS = ['Not now', 'Wrong person', 'Already handled', "I'll do it myself"]

/** A queue item: type badge, title, evidence, and the founder's choices. Same anatomy as a suggestion card. */
function QueueCard({
  icon: Icon,
  type,
  title,
  meta,
  actions,
  children,
}: {
  icon: LucideIcon
  type: string
  title: string
  meta: string
  actions: React.ReactNode
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg border bg-background">
      <div className="flex items-start justify-between gap-3 p-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Icon className="size-3.5 text-muted-foreground" />
            <StatusBadge status={type} />
            <span className="truncate text-[13px] font-medium">{title}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{meta}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      </div>
      {children && (
        <div className="px-3 pb-3">
          <div className="rounded-md border p-2.5">
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-xs text-muted-foreground">
              Evidence
              <ChevronDown className={cn('size-3.5 transition-transform', !open && '-rotate-90')} />
            </button>
            {open && <div className="mt-2 space-y-2.5 text-[13px] leading-relaxed">{children}</div>}
          </div>
        </div>
      )}
    </div>
  )
}

const Sources = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((s) => (
      <span key={s} className="inline-flex h-6 items-center gap-1 rounded border bg-muted/50 px-1.5 text-xs">
        {s}
      </span>
    ))}
  </div>
)

type Tab = 'needs' | 'ran' | 'reviewed'

/** /queue — Surface: everything waiting on the founder's yes, each with its evidence. */
export default function QueuePage() {
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const patch = useDemo((s) => s.patch)
  const skills = useDemo((s) => s.skills)
  const uploads = useDemo((s) => s.uploads)
  const dismissed = useDemo((s) => s.dismissed)
  const halcyonSent = useDemo((s) => s.halcyonSent)
  const openerWords = useDemo((s) => s.openerWords)
  const checkinSent = useDemo((s) => s.checkinSent)
  const expertRequested = useDemo((s) => s.expertRequested)
  const autonomyOn = useDemo((s) => s.autonomyOn)
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('needs')
  const [sheet, setSheet] = useState<'halcyon' | 'checkin' | 'expansion' | null>(null)
  const [expertOpen, setExpertOpen] = useState(false)
  const location = useLocation()
  const user = useCurrentUser()

  // arriving from a signal: open the draft it points to, once
  useEffect(() => {
    const open = (location.state as { open?: 'halcyon' | 'checkin' } | null)?.open
    if (!open) return
    setSheet(open)
    navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  const halcyon = useMemo(() => halcyonDraft(skills, uploads), [skills, uploads])
  const connected = useDemo((s) => s.connected)
  const pilot = pilotView(connected)
  const checkin = useMemo(() => checkinDraft(connected), [connected])
  const expansion = useMemo(() => expansionDraft(connected), [connected])
  const expansionSent = useDemo((s) => s.expansionSent)

  const digest = DIGEST.filter((d) => !dismissed[d.id])
  const showHalcyon = reached(step, 'signal') && !reached(step, 'offer')
  const showRisk = reached(step, 'usage') && !reached(step, 'progress')
  const showExpansion = step === 'done' && !expansionSent
  const needsCount = digest.length + (showHalcyon ? 1 : 0) + (showRisk ? 1 : 0) + (showExpansion ? 1 : 0)

  const runs = autonomyOn && reached(step, 'usage')
    ? [
        { to: 'Lena Park, Corvid', when: 'Yesterday, 9:12 AM', words: 11, outcome: 'Replied' },
        { to: 'Theo Grant, Pathwise', when: '3 days ago', words: 12, outcome: 'Opened' },
        { to: 'Rina Sato, Kelp', when: '4 days ago', words: 10, outcome: 'Opened' },
        { to: 'Marco Diaz, Tallybook', when: '6 days ago', words: 13, outcome: 'No reply yet' },
      ]
    : []

  const reviewed = [
    ...(expansionSent ? [{ title: 'Expansion quote to Grace Liu at Quillstack', outcome: 'Approved', when: 'Today' }] : []),
    ...(expertRequested ? [{ title: 'Expert review: Quillstack renewal terms', outcome: 'Requested', when: 'Today' }] : []),
    ...(checkinSent ? [{ title: 'Check-in to Ana Ruiz at Quillstack', outcome: 'Approved', when: step === 'done' ? '4 weeks ago' : 'Today' }] : []),
    ...(halcyonSent
      ? [{ title: 'First note to Maya Okafor at Halcyon Labs', outcome: `Approved with edits · opener ${openerWords} words`, when: reached(step, 'usage') ? '2 weeks ago' : 'Today' }]
      : []),
    ...Object.entries(dismissed).map(([id, reason]) => ({
      title: DIGEST.find((d) => d.id === id)?.title ?? id,
      outcome: `Dismissed · ${reason}`,
      when: 'Today',
    })),
  ]

  const approveHalcyon = (html: string) => {
    const words = openerWordsOf(html)
    patch({ halcyonSent: true, openerWords: words })
    setSheet(null)
    next()
    toast.success('Sent to Maya Okafor', { description: `From ${user.email} · Pact will watch for the reply.` })
    navigate('/home')
  }

  const approveCheckin = () => {
    patch({ checkinSent: true })
    setSheet(null)
    toast.success('Check-in sent to Ana Ruiz', { description: 'Pact will track alert setup against the promise.' })
  }

  const approveExpansion = () => {
    patch({ expansionSent: true })
    setSheet(null)
    toast.success('Expansion quote sent to Grace Liu', { description: '14 seats, about $8K ARR · Pact will watch for the reply.' })
  }

  const requestExpert = (topic: string) => {
    patch({ expertRequested: true })
    setExpertOpen(false)
    next()
    toast.success('Expert requested', { description: `${topic} · Sam from Pact replies within one business day.` })
    navigate('/plan')
  }

  return (
    <>
      <PageHeader icon={Inbox} crumbs={[{ label: 'Queue' }]} />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[880px] space-y-5 px-6 pb-16 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium">Queue</h1>
              <p className="mt-1 text-xs font-medium text-muted-foreground">Drafts and insights waiting on your yes. Nothing runs without it.</p>
            </div>
            <Segmented<Tab>
              value={tab}
              onChange={setTab}
              options={[
                { value: 'needs', label: `Needs your call (${needsCount})` },
                { value: 'ran', label: `Ran on its own (${runs.length})` },
                { value: 'reviewed', label: `Reviewed (${reviewed.length})` },
              ]}
            />
          </div>

          {tab === 'needs' && (
            <>
              {showHalcyon && (
                <QueueCard
                  icon={Mail}
                  type="Draft"
                  title="First note to Maya Okafor at Halcyon Labs"
                  meta={`Detected today · fit 94/100 · Maya championed ${user.company} at Brightline · picks up your March 2025 thread`}
                  actions={
                    <Button
                      size="sm"
                      className={cn((step === 'signal' || step === 'decide') && 'demo-pulse')}
                      onClick={() => {
                        if (step === 'signal') next()
                        setSheet('halcyon')
                      }}
                    >
                      Open draft
                    </Button>
                  }
                >
                  <Sources items={['Funding news', 'Job post: first SDR', 'Brightline account', 'Email · Mar 14, 2025', 'Your deal history']} />
                  <p>
                    <Inline text="**Why now:** Halcyon raised **$6M** yesterday and posted its first SDR job. In March, Maya said to revisit once they had raised." />
                  </p>
                  <p>
                    <Inline text="**Returning champion:** Maya championed you at Brightline. Your deals with a returning champion closed in **26 days**, against **71** without one." />
                  </p>
                  <p>
                    <Inline text="**Looks like deals you won:** 3 past deals converted from pilot with the same shape: dev tools, 20 to 40 engineers, a first sales hire within 60 days of raising." />
                  </p>
                  <p className="text-muted-foreground">
                    <Inline text="**Next move:** a short note that picks up the old thread, then a 30-minute call." />
                  </p>
                </QueueCard>
              )}

              {showRisk && (
                <QueueCard
                  icon={TriangleAlert}
                  type="Risk"
                  title="Renewal risk: Quillstack pilot"
                  meta={pilot.riskMeta}
                  actions={
                    <>
                      {checkinSent ? (
                        <Badge tone="green">
                          <Check /> Check-in sent
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          className="demo-pulse"
                          onClick={() => {
                            if (step === 'usage') next()
                            setSheet('checkin')
                          }}
                        >
                          Open check-in
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!checkinSent || expertRequested}
                        className={cn(checkinSent && !expertRequested && 'demo-pulse')}
                        onClick={() => requestExpert('Renewal terms and pricing')}
                      >
                        <UserRoundPlus /> Bring in an expert
                      </Button>
                      {checkinSent && !expertRequested && (
                        <Button size="sm" variant="ghost" onClick={() => setExpertOpen(true)}>
                          Choose topic
                        </Button>
                      )}
                    </>
                  }
                >
                  <Sources items={pilot.sources} />
                  <blockquote className="border-l-2 pl-3 italic text-muted-foreground">
                    {pilot.promise.who}: "{pilot.promise.quote}"
                  </blockquote>
                  {pilot.evidence === 'usage' ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Teams with Slack alerts on, against the promise (6)</p>
                      <TargetBarChart data={quillstackAlerts(step)} target={6} height={150} format={(n) => String(n)} />
                    </div>
                  ) : (
                    <>
                      <p>
                        <Inline text={pilot.evidenceLine.replace(/ \[\[.*\]\]$/, '')} />
                      </p>
                      <ConnectNudge id="product" />
                    </>
                  )}
                  {pilot.cause && (
                    <p>
                      <Inline text={pilot.cause.replace(/ \[\[.*\]\]$/, '')} />
                    </p>
                  )}
                  <p>
                    <Inline text="**Why it matters:** fintech pilots that set up alerts in week 1 converted **3 of 3**; without them, **0 of 2**." />
                  </p>
                </QueueCard>
              )}

              {showExpansion && (
                <QueueCard
                  icon={Mail}
                  type="Draft"
                  title="Expansion quote to Grace Liu at Quillstack"
                  meta={pilot.expansion.meta}
                  actions={
                    <Button size="sm" className="demo-pulse" onClick={() => setSheet('expansion')}>
                      Open quote
                    </Button>
                  }
                >
                  <p>
                    <Inline text={pilot.expansion.line.replace(/ \[\[.*\]\]$/, '')} />
                  </p>
                </QueueCard>
              )}

              {digest.length > 0 && (
                <section className="space-y-2">
                  <p className="flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
                    <Clock className="size-3.5" /> Today's digest · from yesterday, still waiting
                  </p>
                  {digest.map((d) => (
                    <QueueCard
                      key={d.id}
                      icon={Clock}
                      type="Digest"
                      title={d.title}
                      meta={d.detail}
                      actions={
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              Dismiss <ChevronDown className="size-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Why? It teaches Pact</DropdownMenuLabel>
                            {DISMISS_REASONS.map((r) => (
                              <DropdownMenuItem
                                key={r}
                                onSelect={() => {
                                  patch({ dismissed: { ...dismissed, [d.id]: r } })
                                  toast(`Dismissed: ${d.title}`, { description: `Reason "${r}" goes to Learn.` })
                                }}
                              >
                                {r}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      }
                    />
                  ))}
                </section>
              )}

              {needsCount === 0 && (
                <EmptyState icon={Inbox} title="Nothing waiting on you" hint="Pact is watching every email, call, meeting and outside signal. New drafts and insights land here." />
              )}
            </>
          )}

          {tab === 'ran' &&
            (runs.length === 0 ? (
              <EmptyState
                icon={ShieldCheck}
                title="Nothing has run on its own yet"
                hint="When a task keeps earning your approval, Pact asks to run it itself. You set the cap and can take it back any time."
              />
            ) : (
              <ul className="divide-y rounded-lg border">
                {runs.map((r) => (
                  <li key={r.to} className="flex items-center gap-3 px-4 py-2.5">
                    <ShieldCheck className="size-4 text-violet-600" />
                    <span className="flex-1 text-[13px]">
                      <span className="font-medium">First note to {r.to}</span>
                      <span className="block text-xs text-muted-foreground">
                        Ran on its own · opener {r.words} words · within your cap
                      </span>
                    </span>
                    <StatusBadge status={r.outcome === 'Replied' ? 'Completed' : 'Sent'} />
                    <span className="w-36 text-right text-xs text-muted-foreground">{r.when}</span>
                  </li>
                ))}
              </ul>
            ))}

          {tab === 'reviewed' &&
            (reviewed.length === 0 ? (
              <EmptyState icon={Check} title="Nothing reviewed yet" hint="Every approve, edit and dismiss shows here, and teaches Pact." />
            ) : (
              <ul className="divide-y rounded-lg border">
                {reviewed.map((r) => (
                  <li key={r.title} className="flex items-center gap-3 px-4 py-2.5">
                    <Check className="size-4 text-muted-foreground" />
                    <span className="flex-1 text-[13px] font-medium">{r.title}</span>
                    <span className="text-xs text-muted-foreground">{r.outcome}</span>
                    <span className="w-24 text-right text-xs text-muted-foreground">{r.when}</span>
                  </li>
                ))}
              </ul>
            ))}
        </div>
      </div>

      <DraftSheet draft={halcyon} open={sheet === 'halcyon'} onOpenChange={(v) => setSheet(v ? 'halcyon' : null)} onApprove={approveHalcyon} />
      <DraftSheet draft={checkin} open={sheet === 'checkin'} onOpenChange={(v) => setSheet(v ? 'checkin' : null)} onApprove={approveCheckin} />
      <DraftSheet draft={expansion} open={sheet === 'expansion'} onOpenChange={(v) => setSheet(v ? 'expansion' : null)} onApprove={approveExpansion} />
      <ExpertDialog open={expertOpen} onOpenChange={setExpertOpen} onConfirm={requestExpert} />
    </>
  )
}
