import { useState } from 'react'
import { Check, UserRoundPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const TOPICS = [
  { name: 'Renewal terms and pricing', hint: 'If adoption lands late, what to offer and what to hold' },
  { name: 'Technical onboarding plan', hint: 'Getting the other five teams set up fast' },
  { name: 'Buyer mapping', hint: "Who signs, and what Grace (CFO) needs to see" },
]

/** "Human experts on call for big decisions": request a review from a person. Topic is required. */
export function ExpertDialog({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (topic: string) => void }) {
  const [topic, setTopic] = useState<string | null>(null)
  const [note, setNote] = useState(
    'Quillstack pilot ends in 12 days. Slack alerts promised for 6 teams, on for 1. I sent a check-in today. Want a second pair of eyes before renewal.',
  )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-5">
        <span className="flex size-8 items-center justify-center rounded-md bg-violet-50">
          <UserRoundPlus className="size-4 text-violet-600" />
        </span>
        <DialogTitle className="mt-3 text-[15px] font-medium">Bring in a human expert</DialogTitle>
        <DialogDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
          For big decisions, a revenue expert at Pact reviews the account with you, usually within one business day. They see
          the same evidence you do.
        </DialogDescription>

        <div className="mt-4 space-y-1.5">
          <Label>What should they look at?</Label>
          <ul className="space-y-1.5">
            {TOPICS.map((t) => (
              <li key={t.name}>
                <button
                  onClick={() => setTopic(t.name)}
                  className={cn(
                    'flex w-full items-start gap-2.5 rounded-lg border px-3 py-2 text-left hover:bg-table-background-hover',
                    topic === t.name && 'border-primary',
                  )}
                >
                  <span className={cn('mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border', topic === t.name && 'border-primary bg-primary text-primary-foreground')}>
                    {topic === t.name && <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.hint}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 space-y-1.5">
          <Label htmlFor="expert-note">Note for the expert</Label>
          <textarea
            id="expert-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border px-2.5 py-2 text-[13px] shadow-xs outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!topic || !note.trim()} className={cn(topic && 'demo-pulse')} onClick={() => topic && onConfirm(topic)}>
            Request expert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
