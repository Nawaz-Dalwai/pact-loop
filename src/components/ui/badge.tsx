import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/** Pills/badges: status, health and type labels in soft tinted tones. */
export const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 h-5 text-xs font-medium [&_svg]:size-3',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-100 text-neutral-900',
        outline: 'border bg-background text-foreground',
        green: 'bg-green-50 text-green-700',
        blue: 'bg-blue-50 text-blue-900',
        purple: 'bg-fuchsia-50 text-fuchsia-700',
        violet: 'bg-violet-50 text-violet-700',
        amber: 'bg-amber-50 text-amber-700',
        red: 'bg-red-50 text-red-700',
        teal: 'bg-teal-50 text-teal-700',
        indigo: 'bg-indigo-50 text-indigo-700',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}
