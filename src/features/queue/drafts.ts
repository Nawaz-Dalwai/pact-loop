import type { DraftSpec } from './DraftSheet'
import { LOOKALIKES } from '@/data/accounts'
import type { DocId } from '@/data/documents'
import type { SkillLevel } from '@/store'

/** Turn 1: Pact's first note to Halcyon Labs. Its opener runs long; the founder must cut it. */
export function halcyonDraft(skills: Record<string, SkillLevel>, uploads: DocId[]): DraftSpec {
  const teach = skills['Writing outreach'] === 'help'
  const messaging = uploads.includes('messaging')
  return {
    id: 'halcyon-first-note',
    to: 'maya@halcyonlabs.io',
    subject: 'Congrats on the round',
    paneTitle: 'Why Pact drafted this',
    maxOpenerWords: 15,
    myOpener: 'Congrats on the round, Maya, and on hiring your first SDR.',
    html: [
      '<p>Hi Maya,</p>',
      "<p>Congratulations on the seed round, and on opening your first sales role. That is a big moment for any team, and it usually means a lot more customers on your payments API very soon, which is exactly when slow calls start to hurt.</p>",
      "<p>In March you said you'd revisit tracing once you'd raised. Your status page shows three incidents in the last 60 days, each from a slow downstream call. That's the pattern Tracelane catches before your customers do.</p>",
      '<p>Would a 30-minute look at your p99 latency by customer be useful this week or next?</p>',
      '<p>Priya</p>',
    ].join('\n'),
    message: {
      id: 'halcyon-why',
      role: 'assistant',
      context: ["Read your March 2025 thread with Maya", "Read Halcyon's funding news", 'Read the SDR job post', 'Compared with 41 past pilots'],
      thoughtSeconds: 7,
      blocks: [
        {
          type: 'p',
          text: 'Halcyon just raised **$6M** [[Funding news]] and posted its **first SDR job** [[Job post]]. In March, Maya said to revisit once they had raised [[Email · Mar 14, 2025]].',
        },
        { type: 'p', text: 'It looks like **3 past deals that converted from pilot**:' },
        { type: 'table', columns: ['Account', 'Size', 'Signal', 'Outcome'], rows: LOOKALIKES },
        ...(teach
          ? [
              { type: 'h' as const, level: 3 as const, text: 'How the note is built' },
              {
                type: 'ul' as const,
                items: [
                  '**Opener:** name the news first, so it reads as a reply to their moment, not a pitch.',
                  "**Bridge:** use Maya's own words from March. It's her idea to revisit, not yours.",
                  '**Proof:** one fact from their status page beats any feature list.',
                  '**Ask:** one small, specific next step.',
                ],
              },
            ]
          : [{ type: 'p' as const, text: "You're strong at outreach, so it's ready to send. I've kept the reasoning short." }]),
        ...(messaging ? [{ type: 'p' as const, text: 'The proof line follows your positioning: "find the slow span before your customers do" [[Messaging · p.2]].' }] : []),
      ],
    },
  }
}

/** Turn 2: a check-in to Quillstack that owns the missed promise. Approve only, no edit required. */
export function checkinDraft(): DraftSpec {
  return {
    id: 'quillstack-checkin',
    to: 'ana@quillstack.com',
    subject: 'Slack alerts: 20 minutes to set them up together?',
    paneTitle: 'Why Pact flagged this',
    html: [
      '<p>Hi Ana,</p>',
      '<p>Quick one before quarter-end: Slack alerts are on for one of your six teams so far.</p>',
      "<p>On our kickoff I promised all six by week two, so that one's on me. Could we take 20 minutes this week to set them up together? I'll bring a config for the other five teams, so it's mostly copy and paste.</p>",
      '<p>Wednesday or Thursday afternoon work on my side.</p>',
      '<p>Priya</p>',
    ].join('\n'),
    message: {
      id: 'checkin-why',
      role: 'assistant',
      context: ['Read the kickoff transcript', 'Checked Slack alert usage for 6 teams', 'Compared 5 past fintech pilots'],
      thoughtSeconds: 6,
      blocks: [
        { type: 'p', text: "Quillstack is behind on the one promise that decides this pilot." },
        {
          type: 'ul',
          items: [
            '**The promise:** "We\'ll have Slack alerts set up for all six teams in the first two weeks." [[Kickoff call · 14:31]]',
            '**The usage:** alerts are on for **1 of 6** teams in week 2 [[Product usage]]',
            '**Why it matters:** fintech pilots with alerts set up in week 1 converted **3 of 3**; without, **0 of 2** [[Your deal history]]',
          ],
        },
        { type: 'p', text: 'The check-in owns the miss and offers a short setup session. The pilot ends in **12 days**, so renewal terms are worth a second pair of eyes.' },
      ],
    },
  }
}
