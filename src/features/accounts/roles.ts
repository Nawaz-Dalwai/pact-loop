import type { Role } from '@/data/accounts'

/** Buying-role pill colours (same tones as the badges). */
export const ROLE_TONE: Record<Role, string> = {
  Champion: 'bg-green-50 text-green-700',
  'Economic buyer': 'bg-violet-50 text-violet-700',
  Evaluator: 'bg-blue-50 text-blue-800',
  Influencer: 'bg-amber-50 text-amber-700',
}
