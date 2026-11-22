import { Toaster as Sonner } from 'sonner'

/** Global toasts. Use `import { toast } from 'sonner'` anywhere to fire one. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: '!rounded-lg !border !border-border !bg-background !text-foreground !shadow-lg !text-[13px] !font-sans',
          description: '!text-muted-foreground !text-xs',
          actionButton: '!bg-primary !text-primary-foreground !rounded-md',
        },
      }}
    />
  )
}
