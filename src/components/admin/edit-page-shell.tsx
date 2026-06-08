import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RiArrowLeftLine, RiLoader4Line } from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

interface EditPageShellProps {
  title: string
  subtitle?: string
  backTo: string
  isSaving?: boolean
  saveLabel?: string
  onSave?: () => void
  saveDisabled?: boolean
  children: ReactNode
  className?: string
}

/**
 * Common shell for admin new/edit pages.
 *
 * Renders a header with a back link, title, subtitle, and an optional
 * save button. Use this for every entity's edit form so the admin
 * experience is consistent.
 */
export function EditPageShell({
  title,
  subtitle,
  backTo,
  isSaving,
  saveLabel = "Save",
  onSave,
  saveDisabled,
  children,
  className,
}: EditPageShellProps) {
  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <RiArrowLeftLine size={14} />
            Back to list
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        {onSave && (
          <Button
            variant="admin"
            onClick={onSave}
            disabled={isSaving || saveDisabled}
            className="gap-2"
          >
            {isSaving ? (
              <RiLoader4Line size={16} className="animate-spin" />
            ) : null}
            {isSaving ? "Saving…" : saveLabel}
          </Button>
        )}
      </header>

      <div className={cn("space-y-6", className)}>{children}</div>
    </div>
  )
}
