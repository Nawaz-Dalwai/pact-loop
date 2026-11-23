/**
 * The customer profile the founder confirms in setup: segments to hunt in, plus filters.
 * Pact proposes the funding filter from its deal history; the on-call filter is the one
 * only the founder knows, so they add it.
 */
export const CRITERIA = [
  { name: 'Funded in the last 90 days', phrase: 'funded in the last 90 days', meta: '38% won' },
  { name: 'On-call team of 5+', phrase: 'with an on-call team of 5+', meta: 'not in your data' },
] as const

export const DEFAULT_CRITERIA: string[] = [CRITERIA[0].name]
export const ONCALL = CRITERIA[1].name

/** "a", "a and b", "a, b and c" */
export const list = (xs: string[]) =>
  xs.length <= 1 ? (xs[0] ?? '') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`

/** e.g. "dev tools, funded in the last 90 days, with an on-call team of 5+" */
export function profileText(segments: string[], criteria: string[]) {
  const seg = segments.length ? list(segments).toLowerCase() : 'dev tools'
  const extra = CRITERIA.filter((c) => criteria.includes(c.name)).map((c) => c.phrase)
  return [seg, ...extra].join(', ')
}
