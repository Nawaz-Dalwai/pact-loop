import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Activity, ArrowRight, Calendar, Check, Hash, Loader2, Mail, Video, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AssistantMessage } from '@/components/chat/Message'
import { KpiTiles } from '@/components/shared/record'
import type { ChatMessage } from '@/components/chat/types'
import { useCurrentUser, useDemo, type SourceId } from '@/store'
import { cn } from '@/lib/utils'

const SOURCES: { id: SourceId; name: string; detail: string; icon: LucideIcon }[] = [
  { id: 'email', name: 'Email', detail: 'Gmail · every thread kept whole, never summarised away', icon: Mail },
  { id: 'calendar', name: 'Calendar', detail: 'Google Calendar · meetings and who was in them', icon: Calendar },
  { id: 'calls', name: 'Calls', detail: 'Zoom and Google Meet recordings, with transcripts', icon: Video },
  { id: 'slack', name: 'Slack', detail: 'Shared customer channels', icon: Hash },
  { id: 'product', name: 'Product analytics', detail: 'Usage events from Tracelane workspaces', icon: Activity },
]

const IMPORT: ChatMessage = {
  id: 'import',
  role: 'assistant',
  context: [
    'Read 2,140 email threads from the last 18 months',
    'Matched 312 meetings and 41 call recordings',
    'Linked product usage for 9 customer workspaces',
    'Recorded needs, promises and decisions',
  ],
  thoughtSeconds: 14,
  blocks: [
    {
      type: 'p',
      text: "Your pipeline is ready. I found **48 accounts** you've talked to, **17 open threads** waiting on a reply, and **3 live pilots**.",
    },
    {
      type: 'p',
      text: "I also pulled **11 promises** you made on calls, so I can track each one against product usage all the way to renewal. Nothing goes out without your yes.",
    },
  ],
}

/** Setup 1: connect the five sources (all required), then the day-one import. */
export default function ConnectPage() {
  const user = useCurrentUser()
  const connected = useDemo((s) => s.connected)
  const connect = useDemo((s) => s.connect)
  const importDone = useDemo((s) => s.importDone)
  const setImportDone = useDemo((s) => s.setImportDone)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()
  const [pending, setPending] = useState<SourceId | null>(null)

  const allConnected = SOURCES.every((s) => connected.includes(s.id))
  const firstOpen = SOURCES.find((s) => !connected.includes(s.id))?.id

  const onConnect = (id: SourceId) => {
    setPending(id)
    window.setTimeout(() => {
      connect(id)
      setPending(null)
    }, 900)
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 pb-16 pt-10">
      <h1 className="bg-linear-to-bl from-violet-500 to-blue-500 bg-clip-text text-4xl font-medium text-transparent">
        Welcome, {user.name.split(' ')[0]}
      </h1>
      <p className="mt-3 max-w-[560px] text-[13px] leading-relaxed text-muted-foreground">
        Pact runs revenue for {user.company} end to end: finding customers, winning deals, delivering on what you promised,
        and growing accounts. First, connect where your selling happens.
      </p>

      <section className="mt-10">
        <h2 className="text-2xl font-medium">Connect your tools</h2>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          {connected.length} of {SOURCES.length} connected · all five feed one live graph
        </p>
        <ul className="mt-4 divide-y rounded-lg border bg-background">
          {SOURCES.map((s) => {
            const done = connected.includes(s.id)
            const busy = pending === s.id
            return (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                  <s.icon className="size-4 text-neutral-700" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.detail}</p>
                </div>
                {done ? (
                  <Badge tone="green">
                    <Check /> Connected
                  </Badge>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pending !== null}
                    onClick={() => onConnect(s.id)}
                    className={cn(s.id === firstOpen && pending === null && 'demo-pulse')}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="animate-spin" /> Connecting…
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                )}
              </li>
            )
          })}
        </ul>
      </section>

      {allConnected && (
        <section className="mt-12">
          <h2 className="text-2xl font-medium">Day one: your pipeline from past email</h2>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Pact reads every interaction whole and links it into one record per account</p>
          <div className="mt-4 rounded-lg border bg-background p-4 shadow-xs">
            <AssistantMessage message={IMPORT} animate={!importDone} onDone={setImportDone} />
          </div>
          {importDone && (
            <>
              <div className="mt-4">
                <KpiTiles
                  items={[
                    { label: 'Accounts found', value: 48 },
                    { label: 'Open threads', value: 17 },
                    { label: 'Live pilots', value: 3 },
                    { label: 'Promises tracked', value: 11, hint: 'Commitments made on calls, matched to product usage' },
                  ]}
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  className="demo-pulse"
                  onClick={() => {
                    next()
                    navigate('/onboarding/learn')
                  }}
                >
                  Continue <ArrowRight />
                </Button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
