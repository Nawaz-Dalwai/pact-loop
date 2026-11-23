import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import { ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/tabs'
import { AssistantMessage } from '@/components/chat/Message'
import type { ChatMessage } from '@/components/chat/types'
import { useCurrentUser, useDemo, type SkillLevel } from '@/store'
import { cn } from '@/lib/utils'
import { useRevealScroll } from '@/lib/useRevealScroll'
import { CRITERIA, ONCALL } from '@/data/profile'
import { DocumentsSection } from './DocumentsSection'

const SEGMENTS = [
  { name: 'Dev tools', meta: '5 of 9 pilots converted' },
  { name: 'Fintech', meta: '2 of 4' },
  { name: 'Health tech', meta: '0 of 3' },
  { name: 'Marketplaces', meta: 'no pilots yet' },
]
const SKILLS = ['Prospecting', 'Writing outreach', 'Discovery calls', 'Pricing and negotiation', 'Running pilots']

/** What Pact found when it rebuilt past deals: the data disagrees with who the founder targets. */
const DEAL_FINDINGS = [
  '**Dev-tool teams funded in the last 90 days** won **38%** of deals',
  'Everyone else, fintech included, won **6%**',
  'Pilots converted: dev tools **5 of 9**, fintech **2 of 4**, health tech **0 of 3**',
]

/**
 * Setup 2: Pact proposes the customer profile from the founder's documents and deals, all
 * pre-filled. The founder adds what the data can't see and confirms it in one go.
 */
export default function LearnPage() {
  const user = useCurrentUser()
  const learnShown = useDemo((s) => s.learnShown)
  const setLearnShown = useDemo((s) => s.setLearnShown)
  const segments = useDemo((s) => s.segments)
  const toggleSegment = useDemo((s) => s.toggleSegment)
  const criteria = useDemo((s) => s.criteria)
  const toggleCriterion = useDemo((s) => s.toggleCriterion)
  const skills = useDemo((s) => s.skills)
  const setSkill = useDemo((s) => s.setSkill)
  const next = useDemo((s) => s.next)
  const docsMode = useDemo((s) => s.docsMode)
  const uploads = useDemo((s) => s.uploads)
  const docsRead = useDemo((s) => s.docsRead)
  const navigate = useNavigate()

  // Pact speaks once the documents are read, or skipped
  const talking = docsMode === 'skip' || docsRead
  const fromDocs = docsMode === 'upload'
  const fromDeck = fromDocs && uploads.includes('deck')
  const fromIcp = fromDocs && uploads.includes('icp')
  const fromPlaybook = fromDocs && uploads.includes('playbook')

  const message = useMemo<ChatMessage>(
    () => ({
      id: 'profile',
      role: 'assistant',
      context: ['Rebuilt your won, lost and stalled deals', 'Measured win rate by segment and funding', 'Measured pilot-to-paid by segment'],
      thoughtSeconds: 6,
      blocks: [
        {
          type: 'p',
          text: fromDeck
            ? `Your deck says ${user.company} sells **on-call alerting for backend teams, built on tracing**, priced per seat with a usage tier [[Seed deck · slide 6]].`
            : `From your site: ${user.company} sells **on-call alerting for backend teams, built on tracing**, priced per seat with a usage tier.`,
        },
        {
          type: 'p',
          text: fromIcp
            ? 'Your ICP doc leads with **fintech** [[ICP one-pager · p.1]]. Your deals point somewhere else:'
            : 'Most of your outbound went to **fintech**. Your deals point somewhere else:',
        },
        { type: 'ul', items: DEAL_FINDINGS },
        {
          type: 'p',
          text: fromPlaybook
            ? "From your playbook [[Sales playbook · §2–3]], I'll **execute** outreach and discovery, and **teach** prospecting, pricing and pilots."
            : "I'll **execute** where you're strong and **teach** where you're new. I've set everything to teach for now; change any below.",
        },
        { type: 'p', text: "So I'd hunt **dev tools**, with the funding filter. Add anything the data can't see, then confirm." },
      ],
    }),
    [user.company, fromDeck, fromIcp, fromPlaybook],
  )


  const chip = (selected: boolean) =>
    cn(
      'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-medium transition-colors',
      selected ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:bg-accent',
    )
  const shown = learnShown > 0
  const messageRef = useRevealScroll(talking)
  const profileRef = useRevealScroll(shown, 'center')
  const ready = segments.length > 0 && SKILLS.every((k) => skills[k])

  return (
    <div className="mx-auto w-full max-w-[760px] px-6 pb-16 pt-10">
      <h2 className="text-2xl font-medium">Teach Pact your business</h2>
      <p className="mt-1 text-xs font-medium text-muted-foreground">
        Pact proposes your profile from what it read · you add what only you know · it keeps asking as {user.company} grows
      </p>

      <DocumentsSection />

      {talking && (
        <div ref={messageRef} className="mt-8 scroll-mt-6 space-y-4 border-t pt-8">
          <AssistantMessage message={message} animate={!shown} onDone={() => setLearnShown(1)} />

          {shown && (
            <div ref={profileRef} className="space-y-4 rounded-lg border bg-background p-4">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Segments to hunt</p>
                <div className="flex flex-wrap gap-2">
                  {SEGMENTS.map((s) => (
                    <button key={s.name} onClick={() => toggleSegment(s.name)} className={chip(segments.includes(s.name))}>
                      {segments.includes(s.name) && <Check className="size-3.5" />}
                      {s.name}
                      <span className={cn('text-xs font-normal', segments.includes(s.name) ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{s.meta}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Only teams</p>
                <div className="flex flex-wrap gap-2">
                  {CRITERIA.map((c) => {
                    const on = criteria.includes(c.name)
                    return (
                      <button key={c.name} onClick={() => toggleCriterion(c.name)} className={cn(chip(on), c.name === ONCALL && !on && 'demo-pulse')}>
                        {on && <Check className="size-3.5" />}
                        {c.name}
                        <span className={cn('text-xs font-normal', on ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{c.meta}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Where Pact executes, and where it teaches</p>
                <ul className="divide-y rounded-lg border">
                  {SKILLS.map((k) => (
                    <li key={k} className="flex h-10 items-center justify-between px-3">
                      <span className="text-[13px]">{k}</span>
                      <Segmented<SkillLevel | ''>
                        value={skills[k] ?? ''}
                        onChange={(v) => v && setSkill(k, v)}
                        options={[
                          { value: 'strong', label: "I'm strong" },
                          { value: 'help', label: 'Teach me' },
                        ]}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-end">
                <Button
                  disabled={!ready}
                  className={cn(ready && criteria.includes(ONCALL) && 'demo-pulse')}
                  onClick={() => {
                    next()
                    navigate('/onboarding/plan')
                  }}
                >
                  Confirm profile <ArrowRight />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
