import * as React from 'react'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root className={cn('grid gap-3', className)} {...props} />
}

/** Round radio; the checked state is a filled dark circle with a check (as in the mailbox modal). */
export function RadioGroupItem({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'flex size-4 shrink-0 items-center justify-center rounded-full border border-neutral-400 outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator>
        <Check className="size-2.5" strokeWidth={4} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

/** Radio with a title + helper line, laid out like the "Mailboxes for emails" options. */
export function RadioOption({
  value,
  title,
  hint,
  children,
}: {
  value: string
  title: React.ReactNode
  hint?: React.ReactNode
  children?: React.ReactNode
}) {
  const id = React.useId()
  return (
    <div className="flex gap-2.5">
      <RadioGroupItem value={value} id={id} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block cursor-pointer text-[13px] font-medium leading-tight">
          {title}
        </label>
        {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        {children && <div className="mt-2.5">{children}</div>}
      </div>
    </div>
  )
}
