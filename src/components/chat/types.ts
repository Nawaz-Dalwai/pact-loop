/**
 * Structured assistant content. Scripted Ask Pact responses (Phase 4) are written as
 * arrays of blocks, which the thread renders and streams in word by word.
 *
 * Inline text supports: **bold**, _italic_, and citations as [[label]] (rendered as chips).
 */
export type ChatBlock =
  | { type: 'p'; text: string }
  | { type: 'h'; text: string; level?: 2 | 3 }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'table'; columns: string[]; rows: string[][] }
  | { type: 'artifact'; kind: 'list' | 'doc' | 'sequence' | 'email' | 'report'; title: string; to?: string }

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** user prompt text */
  text?: string
  /** assistant content */
  blocks?: ChatBlock[]
  /** "Gathered context" steps shown in a disclosure above the answer */
  context?: string[]
  /** seconds shown in "Thought for Ns" */
  thoughtSeconds?: number
}
