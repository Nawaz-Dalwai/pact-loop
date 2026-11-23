import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Check, FileText, Loader2, Undo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AssistantMessage } from '@/components/chat/Message'
import { KpiTiles } from '@/components/shared/record'
import type { ChatMessage } from '@/components/chat/types'
import { SAMPLE_DOCS } from '@/data/documents'
import { SOURCES, importView, sourceById } from '@/demo/sources'
import { useCurrentUser, useDemo } from '@/store'
import { cn } from '@/lib/utils'
import { useRevealScroll } from '@/lib/useRevealScroll'

/**
 * Setup 1: connect the tools in one go (email is required; skip any of the rest), watch the
 * day-one import, then hand Pact your documents, or skip and let it ask.
 */
export default function ConnectPage() {
  const user = useCurrentUser()
  const connected = useDemo((s) => s.connected)
  const connect = useDemo((s) => s.connect)
  const skipped = useDemo((s) => s.skipped)
  const skip = useDemo((s) => s.skip)
  const patch = useDemo((s) => s.patch)
  const importDone = useDemo((s) => s.importDone)
  const setImportDone = useDemo((s) => s.setImportDone)
  const startUploads = useDemo((s) => s.startUploads)
  const skipDocs = useDemo((s) => s.skipDocs)
  const next = useDemo((s) => s.next)
  const navigate = useNavigate()
  const [connecting, setConnecting] = useState(false)

  const toConnect = SOURCES.filter((s) => !skipped.includes(s.id)).map((s) => s.id)
  const imported = connected.includes('email')
  const view = importView(connected)
  const importRef = useRevealScroll<HTMLElement>(imported && !connecting)
  const nextRef = useRevealScroll(importDone, 'center')

  // connect everything not skipped, one after another
  const connectAll = () => {
    setConnecting(true)
    toConnect.forEach((id, i) => window.setTimeout(() => connect(id), 220 * (i + 1)))
    window.setTimeout(() => setConnecting(false), 220 * (toConnect.length + 1))
  }

  const IMPORT = useMemo<ChatMessage>(
    () => ({
      id: 'import',
      role: 'assistant',
      context: view.context,
      thoughtSeconds: 14,
      blocks: [
        {
          type: 'p',
          text: "Your pipeline is ready. I found **48 accounts** you've talked to, **17 open threads** waiting on a reply, and **3 live pilots**.",
        },
        { type: 'p', text: `${view.promiseText} Nothing goes out without your yes.` },
        ...(skipped.length
          ? [
              {
                type: 'p' as const,
                text: `Skipped for now: **${skipped.map((id) => sourceById(id).name.toLowerCase()).join(', ')}**. I'll work with what's here, and ask again when one would help.`,
              },
            ]
          : []),
      ],
    }),
    // the import runs once, on what was connected
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imported && !connecting],
  )

  const goLearn = (withDocs: boolean) => {
    next()
    if (withDocs) {
      startUploads(SAMPLE_DOCS.map((d) => d.id))
    } else {
      skipDocs()
    }
    navigate('/onboarding/learn')
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
          Email is required; skip any of the rest · {imported ? `${connected.length} connected` : `${toConnect.length} to connect`}
          {skipped.length ? ` · ${skipped.length} skipped` : ''}
        </p>
        <ul className="mt-4 divide-y rounded-lg border bg-background">
          {SOURCES.map((s) => {
            const done = connected.includes(s.id)
            const isSkipped = skipped.includes(s.id)
            return (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-neutral-100">
                  <s.icon className="size-4 text-neutral-700" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">
                    {s.name}
                    {s.required && <span className="ml-1.5 text-xs font-normal text-muted-foreground">Required · Pact sends from it</span>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{isSkipped ? s.without : s.detail}</p>
                </div>
                {done ? (
                  <Badge tone="green">
                    <Check /> Connected
                  </Badge>
                ) : isSkipped ? (
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">Skipped</Badge>
                    {!imported && (
                      <Button variant="ghost" size="sm" onClick={() => patch({ skipped: skipped.filter((x) => x !== s.id) })}>
                        <Undo2 /> Undo
                      </Button>
                    )}
                  </div>
                ) : connecting ? (
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" /> Connecting…
                  </span>
                ) : (
                  !s.required &&
                  !imported && (
                    <Button variant="ghost" size="sm" onClick={() => skip(s.id)}>
                      Skip
                    </Button>
                  )
                )}
              </li>
            )
          })}
        </ul>
        {!imported && (
          <div className="mt-4 flex justify-end">
            <Button className={cn(!connecting && 'demo-pulse')} disabled={connecting} onClick={connectAll}>
              {connecting ? <Loader2 className="animate-spin" /> : <Check />} Connect {toConnect.length} tool{toConnect.length === 1 ? '' : 's'}
            </Button>
          </div>
        )}
      </section>

      {imported && !connecting && (
        <section ref={importRef} className="mt-12 scroll-mt-6">
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
                    { label: 'Promises tracked', value: view.promises, hint: view.promiseHint },
                  ]}
                />
              </div>
              <div ref={nextRef} className="mt-6 flex items-center gap-4 rounded-lg border bg-background p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-violet-50">
                  <FileText className="size-4 text-violet-600" />
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-medium">Next: teach Pact your business</p>
                  <p className="text-xs text-muted-foreground">
                    Hand it your pitch deck, ICP doc and playbook (6 sample files), and you'll confirm instead of typing.
                  </p>
                </div>
                <Button variant="ghost" onClick={() => goLearn(false)}>
                  Skip, I'll answer
                </Button>
                <Button className="demo-pulse" onClick={() => goLearn(true)}>
                  Use sample documents <ArrowRight />
                </Button>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  )
}
