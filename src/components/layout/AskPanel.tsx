import { useState } from 'react'
import { SquarePen, X } from 'lucide-react'
import { useCurrentUser, useUi } from '@/store'
import { AssistantMessage, UserBubble } from '@/components/chat/Message'
import { Composer } from '@/components/chat/Composer'
import type { ChatMessage } from '@/components/chat/types'

const introFor = (first: string): ChatMessage => ({
  id: 'ask-intro',
  role: 'assistant',
  blocks: [
    { type: 'p', text: `Hi ${first}. In this demo I'm scripted to the loop you're walking through.` },
    { type: 'p', text: 'Follow the **guide strip** at the top. It shows where you are (Signal, Act, Surface, Decide, Learn) and the one thing to do next.' },
  ],
})

const answer = (n: number): ChatMessage => ({
  id: `ask-${n}`,
  role: 'assistant',
  context: ['Read the live graph', 'Checked the plan'],
  thoughtSeconds: 2,
  blocks: [
    { type: 'p', text: "Free-form questions aren't part of this prototype, so I can't answer that one here." },
    { type: 'p', text: "Everything I'd use to answer it is in the queue, the account records and the plan. The guide strip will take you through each." },
  ],
})

/** Ask Pact side panel: same frame as the reference, with a scripted reply. */
export function AskPanel() {
  const open = useUi((s) => s.askOpen)
  const setOpen = useUi((s) => s.setAskOpen)
  const [asked, setAsked] = useState<string[]>([])
  const user = useCurrentUser()
  if (!open) return null

  const iconBtn = 'rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground'

  return (
    <aside className="flex h-full w-[420px] shrink-0 flex-col border-l bg-background">
      <div className="flex h-12 shrink-0 items-center gap-1 border-b pl-4 pr-2">
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">Ask Pact</span>
        <button className={iconBtn} title="New chat" aria-label="New chat" onClick={() => setAsked([])}>
          <SquarePen className="size-4" />
        </button>
        <button className={iconBtn} title="Close" aria-label="Close" onClick={() => setOpen(false)}>
          <X className="size-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <AssistantMessage message={introFor(user.first)} />
        {asked.map((q, i) => (
          <div key={i} className="space-y-4">
            <UserBubble text={q} />
            <AssistantMessage message={answer(i)} animate={i === asked.length - 1} />
          </div>
        ))}
      </div>
      <Composer className="border-t p-3" onSend={(t) => setAsked((a) => [...a, t])} />
    </aside>
  )
}
