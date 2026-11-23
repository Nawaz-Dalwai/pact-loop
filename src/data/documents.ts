/**
 * Sample documents a seed-stage founder usually already has. The demo "uploads" these
 * instead of real files; nothing leaves the browser.
 */
export type DocId = 'deck' | 'icp' | 'playbook' | 'messaging' | 'interviews' | 'customers'
export type DocKind = 'pdf' | 'docx' | 'md' | 'csv'

export interface SampleDoc {
  id: DocId
  name: string
  kind: DocKind
  size: string
  /** pages, slides, rows… */
  meta: string
  /** what Pact takes from it, shown in the picker */
  learns: string
  /** the line Pact reports after reading it */
  finding: string
}

export const SAMPLE_DOCS: SampleDoc[] = [
  {
    id: 'deck',
    name: 'Seed pitch deck.pdf',
    kind: 'pdf',
    size: '4.2 MB',
    meta: '18 slides',
    learns: 'Product, market, traction',
    finding: '**Product and traction:** on-call alerting for backend teams, built on tracing, priced per seat with a usage tier; $310K ARR from 7 paid customers [[Seed deck · slides 6, 9]]',
  },
  {
    id: 'icp',
    name: 'ICP and target segments.docx',
    kind: 'docx',
    size: '184 KB',
    meta: '2 pages',
    learns: 'Who you sell to, and who buys',
    finding: '**Who you sell to:** Series A fintech and dev-tools teams of 20 to 80 engineers; the buyer is the head of platform [[ICP one-pager · p.1]]',
  },
  {
    id: 'playbook',
    name: 'Founder sales playbook.docx',
    kind: 'docx',
    size: '412 KB',
    meta: '11 pages',
    learns: 'Discovery, outreach, objections',
    finding: '**How you sell:** 12 discovery questions and 4 outreach templates, but no section yet on pricing or running pilots [[Sales playbook · §2–3]]',
  },
  {
    id: 'messaging',
    name: 'Messaging and positioning.pdf',
    kind: 'pdf',
    size: '1.1 MB',
    meta: '6 pages',
    learns: 'Value props and one-liner',
    finding: '**How you say it:** "Find the slow span before your customers do" [[Messaging · p.2]]',
  },
  {
    id: 'interviews',
    name: 'Customer interview notes.md',
    kind: 'md',
    size: '96 KB',
    meta: '14 interviews',
    learns: "Pains in customers' own words",
    finding: '**In their words:** 9 of 14 teams first hear about incidents from their own customers [[Interview notes]]',
  },
  {
    id: 'customers',
    name: 'Customers and pilots.csv',
    kind: 'csv',
    size: '38 KB',
    meta: '61 rows',
    learns: 'Who bought, who piloted',
    finding: '**Who bought:** 7 customers and 3 live pilots, matched to the accounts in your email [[Customers and pilots.csv]]',
  },
]

export const docById = (id: DocId) => SAMPLE_DOCS.find((d) => d.id === id)!
