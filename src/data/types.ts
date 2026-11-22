/** Shared record types for the demo's fictional data. */
export type Health = 'Healthy' | 'Needs attention' | 'At risk'

/** A change Pact suggests, with the evidence behind it (SuggestionCard). */
export interface SuggestedUpdate {
  id: string
  label: string
  from: string
  to: string
  source: string
  evidence: string
  status: 'pending' | 'accepted' | 'rejected'
}
