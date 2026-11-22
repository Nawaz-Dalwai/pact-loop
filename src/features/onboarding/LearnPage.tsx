import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { AssistantMessage, UserBubble } from '@/components/chat/Message'
import type { ChatMessage } from '@/components/chat/types'
import { useCurrentUser, useDemo, type SkillLevel } from '@/store'
import { cn } from '@/lib/utils'
import { DocumentsSection } from './DocumentsSection'

const PRODUCT_OPTIONS = ["Yes, that's right", "Yes, and we're adding an on-prem plan"]
const SEGMENTS = [
  { name: 'Dev tools', meta: '5 of 9 pilots converted' },
  { name: 'Fintech', meta: '2 of 4' },
  { name: 'Health tech', meta: '0 of 3' },
  { name: 'Marketplaces', meta: 'no pilots yet' },
]
const SKILLS = ['Prospecting', 'Writing outreach', 'Discovery calls', 'Pricing and negotiation', 'Running pilots']

const list = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`

/** Setup 2: Pact learns the business in a short conversation. Every question needs an answer. */
export default function LearnPage() {
  const user = useCurrentUser()
  const learnShown = useDemo((s) => s.learnShown)
  const setLearnShown = useDemo((s) => s.setLearnShown)
  const answers = useDemo((s) => s.learnAnswers)
  const answer = useDemo((s) => s.answerLearn)
  const segments = useDemo((s) => s.segments)
  const toggleSegment = useDemo((s) => s.toggleSegment)
  const skills = useDemo((s) => s.skills)
  const setSkill = useDemo((s) => s.setSkill)
  const next = useDemo((s) => s.next)
  const docsMode = useDemo((s) => s.docsMode)
  const uploads = useDemo((s) => s.uploads)
  const uploadsDone = useDemo((s) => s.uploadsDone)
  const docsRead = useDemo((s) => s.docsRead)
  const navigate = useNavigate()
  const endRef = useRef<HTMLDivElement>(null)

  // Questions start once documents are read, or skipped. Each one leans on the document that answers it.
  const talking = docsMode === 'skip' || docsRead
  const fromDocs = docsMode === 'upload'
  const fromDeck = fromDocs && uploads.includes('deck')
  const fromIcp = fromDocs && uploads.includes('icp')
  const fromPlaybook = fromDocs && uploads.includes('playbook')

  const strong = SKILLS.filter((k) => skills[k] === 'strong')
  const help = SKILLS.filter((k) => skills[k] === 'help')
  const skillsDone = SKILLS.every((k) => skills[k])

  const messages = useMemo<ChatMessage[]>(
    () => [
      fromDeck
        ? {
            id: 'learn-0',
            role: 'assistant',
            context: ['Read slide 6: Product', 'Checked tracelane.dev pricing'],
            thoughtSeconds: 2,
            blocks: [
              {
                type: 'p',
                text: `First: your deck says ${user.company} sells **distributed tracing for backend teams**, priced per seat with a usage tier [[Seed deck · slide 6]]. Is that still right?`,
              },
            ],
          }
        : {
            id: 'learn-0',
            role: 'assistant',
            context: ['Read tracelane.dev', 'Read your pricing page', 'Scanned 48 accounts'],
            thoughtSeconds: 4,
            blocks: [
              { type: 'p', text: "I've read your site and your past email. I'll ask three things, and keep asking as you grow." },
              { type: 'p', text: `First: ${user.company} sells **distributed tracing for backend teams**, priced per seat with a usage tier. Is that right?` },
            ],
          },
      {
        id: 'learn-1',
        role: 'assistant',
        context: ['Compared won, lost and stalled deals', 'Measured pilot-to-paid by segment'],
        thoughtSeconds: 5,
        blocks: fromIcp
          ? [
              {
                type: 'p',
                text: 'Your ICP doc targets **Series A dev-tools and fintech teams of 20 to 80 engineers** [[ICP one-pager · p.1]], and your deals agree:',
              },
              {
                type: 'ul',
                items: ['Dev tools: **5 of 9** pilots converted', 'Fintech: **2 of 4**', 'Health tech: **0 of 3**'],
              },
              { type: 'p', text: "I've selected those two from your doc. Change them if you like, then confirm." },
            ]
          : [
              { type: 'p', text: 'Your pilots convert best with **Series A teams of 20 to 80 engineers**. By segment:' },
              {
                type: 'ul',
                items: ['Dev tools: **5 of 9** pilots converted', 'Fintech: **2 of 4**', 'Health tech: **0 of 3**'],
              },
              { type: 'p', text: 'Which segments should I hunt in?' },
            ],
      },
      {
        id: 'learn-2',
        role: 'assistant',
        thoughtSeconds: 2,
        blocks: fromPlaybook
          ? [
              {
                type: 'p',
                text: 'Last one. Your playbook covers **discovery** and **outreach** in depth [[Sales playbook · §2–3]], but has nothing yet on prospecting, pricing or running pilots.',
              },
              {
                type: 'p',
                text: "I've set your answers from that: I'll **execute** where you're strong and **teach** where you're new. Adjust anything, then confirm.",
              },
            ]
          : [
              { type: 'p', text: 'Last one. Where are you strong, and where do you want help?' },
              { type: 'p', text: "I'll **execute** where you're strong and **teach** where you're new." },
            ],
      },
      {
        id: 'learn-3',
        role: 'assistant',
        thoughtSeconds: 2,
        blocks: [
          { type: 'p', text: "Got it. Here's how I'll work with you:" },
          {
            type: 'ul',
            items: [
              strong.length
                ? `**I'll execute** ${list(strong).toLowerCase()}: drafts arrive ready for your yes.`
                : "**I'll execute** the busywork: research, logging and follow-ups.",
              help.length
                ? `**I'll teach** ${list(help).toLowerCase()}: every draft and brief shows my reasoning and the evidence first.`
                : "**I'll teach** as new situations come up, with the evidence first.",
              "**Nothing runs without your yes.** When a task keeps earning your approval, I'll ask to run it myself.",
            ],
          },
        ],
      },
    ],
    // the last message reads the confirmed skills
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user.company, answers[2], fromDeck, fromIcp, fromPlaybook],
  )

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [answers.length, learnShown, docsMode, uploadsDone, docsRead])

  const chip = (selected: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors',
      selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent',
    )

  const inputFor = (i: number) => {
    if (i === 0)
      return (
        <div className="flex flex-wrap justify-end gap-2">
          {PRODUCT_OPTIONS.map((o, k) => (
            <button key={o} onClick={() => answer(0, o)} className={cn(chip(false), k === 0 && 'demo-pulse')}>
              {o}
            </button>
          ))}
        </div>
      )
    if (i === 1)
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap justify-end gap-2">
            {SEGMENTS.map((s) => (
              <button key={s.name} onClick={() => toggleSegment(s.name)} className={chip(segments.includes(s.name))}>
                {segments.includes(s.name) && <Check className="size-3.5" />}
                {s.name}
                <span className={cn('text-xs font-normal', segments.includes(s.name) ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                  {s.meta}
                </span>
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={segments.length === 0}
              className={cn(segments.length > 0 && 'demo-pulse')}
              onClick={() => answer(1, `Hunt in ${list(segments).toLowerCase()}.`)}
            >
              Confirm segments
            </Button>
          </div>
        </div>
      )
    if (i === 2)
      return (
        <div className="space-y-3">
          <ul className="divide-y rounded-lg border bg-background">
            {SKILLS.map((k) => (
              <li key={k} className="flex h-11 items-center justify-between px-4">
                <span className="text-[13px]">{k}</span>
                <Segmented<SkillLevel | ''>
                  value={skills[k] ?? ''}
                  onChange={(v) => v && setSkill(k, v)}
                  options={[
                    { value: 'strong', label: "I'm strong" },
                    { value: 'help', label: 'Help me' },
                  ]}
                />
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-end gap-3">
            {!skillsDone && (
              <span className="text-xs text-muted-foreground">
                {SKILLS.filter((k) => skills[k]).length} of {SKILLS.length} set
              </span>
            )}
            <Button
              size="sm"
              disabled={!skillsDone}
              className={cn(skillsDone && 'demo-pulse')}
              onClick={() =>
                answer(
                  2,
                  [strong.length ? `Strong at ${list(strong).toLowerCase()}.` : '', help.length ? `Help me with ${list(help).toLowerCase()}.` : '']
                    .filter(Boolean)
                    .join(' '),
                )
              }
            >
              Confirm
            </Button>
          </div>
        </div>
      )
    return null
  }

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 pb-16 pt-10">
      <h2 className="text-2xl font-medium">Teach Pact your business</h2>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        Upload what you have, then confirm three things · Pact keeps asking as {user.company} grows
      </p>

      <DocumentsSection />

      <div className={cn('space-y-5', talking && 'mt-8 border-t pt-8')}>
        {talking && messages.map((m, i) => {
          const visible = i === 0 || answers[i - 1] !== undefined
          if (!visible) return null
          const shown = learnShown > i
          return (
            <div key={m.id} className="space-y-4">
              <AssistantMessage message={m} animate={!shown} onDone={() => setLearnShown(i + 1)} />
              {shown && answers[i] === undefined && inputFor(i)}
              {answers[i] !== undefined && <UserBubble text={answers[i]!} />}
            </div>
          )
        })}

        {learnShown >= messages.length && (
          <div className="flex justify-end pt-2">
            <Button
              className="demo-pulse"
              onClick={() => {
                next()
                navigate('/onboarding/plan')
              }}
            >
              Continue to your plan <ArrowRight />
            </Button>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  )
}
