import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from "@remixicon/react"
import { Link } from "@tanstack/react-router"
import type { ReactNode } from "react"

export interface EntityListColumn<T> {
  key: string
  header: string
  width?: string
  render: (item: T) => ReactNode
  className?: string
}

interface EntityListProps<T extends { id?: number | string }> {
  title: string
  subtitle?: string
  newHref: string
  newLabel?: string
  items: T[]
  columns: EntityListColumn<T>[]
  editHref: (item: T) => string
  onDelete?: (item: T) => void
  emptyMessage?: string
  showOrder?: boolean
  className?: string
}

/**
 * Common list view for admin entities. Used by every entity's index page
 * — replaces the old inline-editing tables.
 */
export function EntityList<T extends { id?: number | string; order?: number }>({
  title,
  subtitle,
  newHref,
  newLabel = "Add New",
  items,
  columns,
  editHref,
  onDelete,
  emptyMessage = "No items found. Add your first one.",
  showOrder = true,
  className,
}: EntityListProps<T>) {
  const sorted = showOrder
    ? [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : items

  return (
    <div className={cn("space-y-8", className)}>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
        </div>
        <Link to={newHref}>
          <Button variant="admin" className="gap-2">
            <RiAddLine size={18} />
            {newLabel}
          </Button>
        </Link>
      </header>

      {sorted.length > 0 ? (
        <div className="rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {showOrder && (
                  <th className="w-16 px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                    Order
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      "px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase",
                      col.className
                    )}
                  >
                    {col.header}
                  </th>
                ))}
                <th className="w-32 px-4 py-3 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr
                  key={item.id ?? `tmp-${Math.random()}`}
                  className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                >
                  {showOrder && (
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {item.order ?? "—"}
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-4 py-3", col.className)}
                    >
                      {col.render(item)}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={editHref(item)}>
                        <Button variant="ghost" size="icon-sm" title="Edit">
                          <RiPencilLine size={14} />
                        </Button>
                      </Link>
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(item)}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
                        >
                          <RiDeleteBinLine size={14} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Badge variant="admin" className="mb-3">
            0 items
          </Badge>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          <Link to={newHref}>
            <Button variant="admin" className="mt-4 gap-2">
              <RiAddLine size={16} />
              {newLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
