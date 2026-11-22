import { useNavigate } from 'react-router'
import { toast } from 'sonner'
import { ArrowRight, Calendar, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Inline } from '@/components/chat/inline'
import { accountFor } from '@/data/accounts'
import { useDemo } from '@/store'
import { cn } from '@/lib/utils'
import { ROLE_TONE } from './roles'

const SECTIONS = [
  { id: 'why', title: 'Why now' },
  { id: 'research', title: 'Company research' },
  { id: 'people', title: 'People on the call' },
  { id: 'goals', title: 'Pilot goals to confirm' },
  { id: 'questions', title: 'Discovery questions' },
  { id: 'agents', title: "Answers for buyers' AI agents" },
] as const

const QUESTIONS = [
  { q: 'What changed after the round: which customers or volumes are you expecting next quarter?', why: 'Ties latency to their growth plan, not to your product.' },
  { q: 'When a ledger call went slow in March, how did you find out, and how long did it take?', why: 'Gets the cost of the problem in their own words.' },
  { q: 'Which p99 number would make Daniel comfortable taking on the new customers?', why: 'Turns the pilot goal into one number the buyer cares about.' },
  { q: 'Who else needs to see the pilot results before you buy?', why: 'Finds the rest of the buying group early.' },
  { q: 'If the pilot works, what happens in week seven?', why: 'Makes the path to paid explicit before you start.' },
]

/** Call brief for the Halcyon intro call: a document with a sticky table of contents. */
export function CallBrief() {
  const step = useDemo((s) => s.step)
  const next = useDemo((s) => s.next)
  const skills = useDemo((s) => s.skills)
  const uploads = useDemo((s) => s.uploads)
  const navigate = useNavigate()
  const a = accountFor(step, 'halcyon')!
  const teach = skills['Discovery calls'] === 'help'
  const fromPlaybook = uploads.includes('playbook')

  const go = (id: string) => document.getElementById(`brief-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const Heading = ({ title, extra }: { title: string; extra?: React.ReactNode }) => (
    <div className="mb-3 flex items-center gap-2">
      <h3 className="text-[15px] font-semibold">{title}</h3>
      {extra}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
        <Calendar className="size-4 text-muted-foreground" />
        <span className="flex-1">
          <span className="block text-[13px] font-medium">Halcyon Labs × Tracelane · intro call</span>
          <span className="block text-xs text-muted-foreground">Thursday, 2:00 – 2:30 PM · Maya Okafor, Daniel Reyes, Priya Raman</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText('Halcyon Labs call brief').catch(() => {})
            toast('Brief copied to clipboard')
          }}
        >
          <Copy /> Copy brief
        </Button>
        {step === 'brief' && (
          <Button
            size="sm"
            className="demo-pulse"
            onClick={() => {
              next()
              navigate('/home')
            }}
          >
            Done reviewing <ArrowRight />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_200px] gap-10">
        <article className="space-y-8 text-[13px] leading-relaxed">
          <section id="brief-why" className="scroll-mt-4">
            <Heading title="Why now" />
            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
              {a.signals!.map((s) => (
                <li key={s.title}>
                  <Inline text={`**${s.title}:** ${s.body} [[${s.source}]]`} />
                </li>
              ))}
            </ul>
          </section>

          <section id="brief-research" className="scroll-mt-4">
            <Heading title="Company research" />
            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
              {a.findings.map((f) => (
                <li key={f.title}>
                  <Inline text={`**${f.title}:** ${f.body} [[${f.source}]]`} />
                </li>
              ))}
            </ul>
          </section>

          <section id="brief-people" className="scroll-mt-4">
            <Heading title="People on the call" />
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-muted/50">
                  <tr>
                    {['Name', 'Role', 'What they care about'].map((h) => (
                      <th key={h} className="border-b border-r px-3 py-2.5 font-semibold last:border-r-0">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {a.people.slice(0, 2).map((p) => (
                    <tr key={p.email} className="border-b align-top last:border-b-0">
                      <td className="border-r px-3 py-3">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.title}</div>
                      </td>
                      <td className="border-r px-3 py-3">
                        <span className={cn('inline-flex h-5 items-center rounded-md px-1.5 text-xs font-medium', ROLE_TONE[p.role])}>{p.role}</span>
                      </td>
                      <td className="px-3 py-3">{p.cares}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section id="brief-goals" className="scroll-mt-4">
            <Heading title="Pilot goals to confirm" />
            <ol className="list-decimal space-y-2 pl-5 marker:text-muted-foreground">
              <li>p99 latency on the payments API under 300 ms, visible per customer</li>
              <li>Slack alerts for slow downstream calls, for every team on call</li>
              <li>Two teams sending traces in week 1</li>
            </ol>
            <p className="mt-2 text-xs text-muted-foreground">Pact will track whatever you agree against product usage, all the way to renewal.</p>
          </section>

          <section id="brief-questions" className="scroll-mt-4">
            <Heading title="Discovery questions" extra={fromPlaybook ? <Inline text="[[Sales playbook · §2]]" /> : undefined} />
            {teach && (
              <p className="mb-3 rounded-md border border-violet-200 bg-violet-50/60 px-3 py-2 text-xs text-violet-900">
                You asked for help with discovery calls, so each question says why to ask it.
              </p>
            )}
            <ol className="list-decimal space-y-2.5 pl-5 marker:text-muted-foreground">
              {QUESTIONS.map((x) => (
                <li key={x.q}>
                  {x.q}
                  {teach && <p className="text-xs text-muted-foreground">Why ask: {x.why}</p>}
                </li>
              ))}
            </ol>
          </section>

          <section id="brief-agents" className="scroll-mt-4 pb-16">
            <Heading title="Answers for buyers' AI agents" extra={<Badge tone="violet">Next</Badge>} />
            <p className="mb-2 text-muted-foreground">
              Pre-approved answers Pact can give when Halcyon's AI agent asks before or after the call. You approved each one once.
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-muted-foreground">
              <li>
                <Inline text="**Data residency:** US and EU regions; traces never leave the chosen region. [[Security FAQ]]" />
              </li>
              <li>
                <Inline text="**Compliance:** SOC 2 Type II report available under NDA. [[Security FAQ]]" />
              </li>
              <li>
                <Inline text="**Pilot terms:** six weeks, free, success criteria agreed up front. [[Pilot plan template]]" />
              </li>
            </ul>
          </section>
        </article>

        <nav className="sticky top-4 h-fit">
          <p className="mb-2 text-xs font-medium text-muted-foreground">On this page</p>
          <ul className="space-y-0.5 border-l">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => go(s.id)}
                  className="-ml-px block w-full truncate border-l border-transparent py-1 pl-3 text-left text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}
