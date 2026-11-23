import type { DraftSpec } from './DraftSheet'
import { LOOKALIKES } from '@/data/accounts'
import type { DocId } from '@/data/documents'
import { currentUser, type SkillLevel, type SourceId } from '@/store'
import { pilotView } from '@/demo/sources'

/** Turn 1: Pact's first note to Halcyon Labs. Its opener runs long; the founder must cut it. */
export function halcyonDraft(skills: Record<string, SkillLevel>, uploads: DocId[]): DraftSpec {
  const u = currentUser()
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
      `<p>In March you said you'd revisit tracing once you'd raised. At Brightline, your team cut on-call pages by 41% with ${u.company}, and Halcyon's status page shows three incidents in 60 days, each from a slow downstream call. That's the pattern we catch before your customers do.</p>`,
      '<p>Would a 30-minute look at your p99 latency by customer be useful this week or next?</p>',
      `<p>${u.first}</p>`,
    ].join('\n'),
    message: {
      id: 'halcyon-why',
      role: 'assistant',
      context: ["Read your March 2025 thread with Maya", "Checked Maya's results at Brightline", "Read Halcyon's funding news", 'Read the SDR job post', 'Compared with 41 past pilots'],
      thoughtSeconds: 7,
      blocks: [
        {
          type: 'p',
          text: 'Halcyon just raised **$6M** [[Funding news]] and posted its **first SDR job** [[Job post]]. In March, Maya said to revisit once they had raised [[Email · Mar 14, 2025]].',
        },
        {
          type: 'p',
          text: "I wrote to **Maya**, not the CTO: she championed you at Brightline, where her team cut on-call pages by **41%** [[Brightline account]]. Your deals with a returning champion closed in **26 days**, against **71** without one [[Your deal history]].",
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

/**
 * Turn 2: a check-in to Quillstack. When Pact can see the miss (usage or Slack) it owns it;
 * when it can't, it asks. Approve only, no edit required.
 */
export function checkinDraft(connected: SourceId[]): DraftSpec {
  const v = pilotView(connected)
  const u = currentUser()
  const said = connected.includes('calls') ? 'On our kickoff' : 'In our pilot plan'
  return {
    id: 'quillstack-checkin',
    to: 'ana@quillstack.com',
    subject: 'Slack alerts: 20 minutes to set them up together?',
    paneTitle: 'Why Pact flagged this',
    html: [
      '<p>Hi Ana,</p>',
      ...(v.known
        ? [
            v.evidence === 'usage'
              ? '<p>Quick one before quarter-end: Slack alerts are on for one of your six teams so far, and the other five stopped at the webhook step.</p>'
              : '<p>Quick one before quarter-end: Slack alerts are on for one of your six teams so far.</p>',
            `<p>${said} I promised all six by week two, so that one's on me. Could we take 20 minutes this week to set them up together? I'll bring a config for the other five teams, so it's mostly copy and paste.</p>`,
          ]
        : [
            '<p>Quick one before quarter-end: how are the Slack alerts going across your six teams?</p>',
            `<p>${said} I promised all six by week two, and I'd rather fix anything stuck on our side now than at the end. Could we take 20 minutes this week to set them up together? I'll bring a config for every team, so it's mostly copy and paste.</p>`,
          ]),
      '<p>Wednesday or Thursday afternoon work on my side.</p>',
      `<p>${u.first}</p>`,
    ].join('\n'),
    message: {
      id: 'checkin-why',
      role: 'assistant',
      context: [
        connected.includes('calls') ? 'Read the kickoff transcript' : 'Read the pilot plan email',
        { usage: 'Checked Slack alert usage for 6 teams', slack: 'Read the shared Slack channel', none: "Checked Ana's replies since kickoff" }[v.evidence],
        'Compared 5 past fintech pilots',
      ],
      thoughtSeconds: 6,
      blocks: [
        {
          type: 'p',
          text: v.known
            ? 'Quillstack is behind on the one promise that decides this pilot.'
            : "Quillstack has gone quiet on the one promise that decides this pilot. I can't see their usage, so the note asks rather than tells.",
        },
        {
          type: 'ul',
          items: [
            `**The promise:** "${v.promise.quote}" [[${v.promise.source}]]`,
            v.evidenceLine,
            ...(v.cause ? [v.cause] : []),
            '**Why it matters:** fintech pilots with alerts set up in week 1 converted **3 of 3**; without, **0 of 2** [[Your deal history]]',
          ],
        },
        { type: 'p', text: "The check-in owns the miss and offers a short setup session. It's week 2 of six, so there's time to recover, but renewal terms are worth a second pair of eyes." },
      ],
    },
  }
}

/** Workflow 3's "grow": once Quillstack converts, Pact drafts the expansion. Approve only. */
export function expansionDraft(connected: SourceId[]): DraftSpec {
  const v = pilotView(connected)
  const u = currentUser()
  return {
    id: 'quillstack-expansion',
    to: 'grace@quillstack.com',
    subject: 'Adding the data and risk teams',
    paneTitle: 'Why Pact drafted this',
    html: [
      '<p>Hi Grace,</p>',
      '<p>Thanks for signing, and for the push to get all six teams live.</p>',
      v.expansion.body,
      '<p>Adding 14 seats to your annual plan comes to about $8K a year, prorated from today. Shall I send the updated order form?</p>',
      `<p>${u.first}</p>`,
    ].join('\n'),
    message: {
      id: 'expansion-why',
      role: 'assistant',
      context: [v.expansion.context, 'Read your pricing page', 'Compared 5 past expansions'],
      thoughtSeconds: 5,
      blocks: [
        { type: 'p', text: 'Quillstack just converted, and the account has room to grow.' },
        {
          type: 'ul',
          items: [
            v.expansion.line,
            '**The price:** 14 seats at your per-seat rate, about **$8K ARR**, prorated [[Pricing page]]',
            '**Why now:** 4 of your 5 expansions closed within 30 days of signing [[Your deal history]]',
          ],
        },
        { type: 'p', text: 'Nothing sends without your yes.' },
      ],
    },
  }
}
