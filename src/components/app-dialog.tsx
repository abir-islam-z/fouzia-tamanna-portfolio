import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ReactNode } from "react"

interface AppDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/**
 * Single-import dialog wrapper. Pass open state + content as children.
 *
 * ```tsx
 * <AppDialog open={show} onOpenChange={setShow} title="Edit Item">
 *   <p>Form goes here</p>
 * </AppDialog>
 * ```
 */
export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
