import { cn } from '@/lib/utils'

/** Pact mark: a rounded "P" whose bowl opens into a handshake-like hook. Original artwork. */
export function PactMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-6', className)} aria-label="Pact">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path
        d="M10 23V9h7a5 5 0 0 1 0 10h-3.5"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PactWordmark() {
  return (
    <div className="flex items-center gap-2">
      <PactMark />
      <span className="text-[15px] font-semibold tracking-tight">Pact</span>
    </div>
  )
}
