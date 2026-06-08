import { AppDialog } from "@/components/app-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mediaQuery } from "@/lib/queries"
import { cn } from "@/lib/utils"
import {
  RiCheckLine,
  RiFile3Line,
  RiFileImageLine,
  RiImageLine,
  RiSearchLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

export interface MediaItem {
  id: number
  key: string
  url: string
  originalName: string
  mimeType: string
  size: number
  folder: string
  alt: string | null
  width: number | null
  height: number | null
}

interface MediaPickerProps {
  onSelect: (media: MediaItem) => void
  trigger: React.ReactNode
  folder?: string
  className?: string
}

export function MediaPicker({
  onSelect,
  trigger,
  folder,
  className,
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const { data: rawItems = [] } = useSuspenseQuery(mediaQuery(folder))
  const items = rawItems as unknown as Array<MediaItem>
  const [search, setSearch] = useState("")
  const [activeFolder, setActiveFolder] = useState<string>("all")

  const folders = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => set.add(i.folder))
    return ["all", ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (activeFolder !== "all" && i.folder !== activeFolder) return false
      if (
        search &&
        !`${i.originalName} ${i.alt ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [items, activeFolder, search])

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer"
      >
        {trigger}
      </span>

      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title="Media Library"
        description="Choose an image to insert"
        className={cn("max-w-4xl", className)}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              {folders.map((f) => (
                <Button
                  key={f}
                  size="xs"
                  variant={activeFolder === f ? "admin" : "outline"}
                  onClick={() => setActiveFolder(f)}
                  className="capitalize"
                >
                  {f}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <RiSearchLine
                size={14}
                className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                variant="admin"
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-border py-12 text-center">
              <RiImageLine
                size={32}
                className="mx-auto mb-2 text-muted-foreground opacity-30"
              />
              <p className="text-sm text-muted-foreground">
                No media found. Upload files in the Media Library first.
              </p>
            </div>
          ) : (
            <div className="grid max-h-[480px] grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => {
                const isImage = item.mimeType.startsWith("image/")
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item)
                      setOpen(false)
                    }}
                    className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary focus:border-primary focus:outline-none"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-secondary">
                      {isImage ? (
                        <img
                          src={item.url}
                          alt={item.alt ?? item.originalName}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
                          <RiFile3Line size={28} />
                          <span className="text-[10px]">
                            {item.mimeType.split("/")[1]?.slice(0, 8) ?? "file"}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/0 opacity-0 transition-all group-hover:bg-primary/20 group-hover:opacity-100">
                        <RiCheckLine
                          size={28}
                          className="text-primary drop-shadow"
                        />
                      </div>
                    </div>
                    <div className="space-y-1 p-2 text-left">
                      <p className="line-clamp-1 font-mono text-[10px] text-foreground">
                        {item.originalName}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <Badge variant="admin" className="text-[9px]">
                          {item.folder}
                        </Badge>
                        {isImage && (
                          <RiFileImageLine
                            size={12}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </AppDialog>
    </>
  )
}
