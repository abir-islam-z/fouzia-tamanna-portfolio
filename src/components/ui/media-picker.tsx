import { AppDialog } from "@/components/app-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { finalizeMediaUploadFn, getPresignedUpload } from "@/lib/cms"
import { mediaQuery, queryKeys } from "@/lib/queries"
import { cn } from "@/lib/utils"
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiFile3Line,
  RiFileImageLine,
  RiImageLine,
  RiSearchLine,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"

export interface MediaItem {
  id: string
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

const MAX_BYTES = 25 * 1024 * 1024
const ACCEPTED = [
  "image/",
  "video/",
  "audio/",
  "application/pdf",
  "application/zip",
  "application/x-rar",
  "text/",
]

function isAccepted(mime: string) {
  return ACCEPTED.some((a) => mime.startsWith(a))
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
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
  const [showUpload, setShowUpload] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const [uploads, setUploads] = useState<
    Array<{
      id: number
      name: string
      progress: number
      status: "uploading" | "done" | "error"
      error?: string
      mediaItem?: MediaItem
    }>
  >([])

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

  async function uploadFiles(fileList: FileList | Array<File>) {
    const files = Array.from(fileList)
    if (files.length === 0) return

    let nextId = Date.now()
    type UploadEntry = {
      id: number
      name: string
      progress: number
      status: "uploading" | "done" | "error"
      error?: string
      mediaItem?: MediaItem
    }
    const placeholders: Array<UploadEntry> = files.map((f) => ({
      id: nextId++,
      name: f.name,
      progress: 0,
      status: "uploading",
    }))
    setUploads((prev) => [...prev, ...placeholders])
    const idByFile = new Map<File, number>()
    files.forEach((f, i) => idByFile.set(f, placeholders[i].id))

    function setProgress(id: number, patch: Partial<UploadEntry>) {
      setUploads((prev) =>
        prev.map((q) => (q.id === id ? { ...q, ...patch } : q))
      )
    }

    for (const file of files) {
      const id = idByFile.get(file)!
      try {
        if (!isAccepted(file.type)) {
          throw new Error(`Unsupported file type: ${file.type || "unknown"}`)
        }
        if (file.size > MAX_BYTES) {
          throw new Error(
            `File too large (${formatBytes(file.size)}). Max 25 MB.`
          )
        }

        const { key, uploadUrl } = await getPresignedUpload({
          data: {
            fileName: file.name,
            mimeType: file.type,
            folder: folder ?? "general",
          },
        })

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("PUT", uploadUrl, true)
          xhr.setRequestHeader("Content-Type", file.type)
          xhr.upload.onprogress = (e) => {
            if (!e.lengthComputable) return
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(id, { progress: pct })
          }
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) resolve()
            else
              reject(
                new Error(
                  `Upload failed: ${xhr.status} ${xhr.statusText || "R2 rejected the request"}`
                )
              )
          }
          xhr.onerror = () =>
            reject(
              new Error("Network error — check your connection and try again.")
            )
          xhr.ontimeout = () => reject(new Error("Upload timed out"))
          xhr.send(file)
        })

        const finalized = await finalizeMediaUploadFn({
          data: {
            key,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            folder: folder ?? "general",
          },
        })

        const mediaItem = finalized as unknown as MediaItem
        setProgress(id, { progress: 100, status: "done", mediaItem })
        void queryClient.invalidateQueries({ queryKey: queryKeys.media() })

        // Auto-select the first successfully uploaded file
        if (files.length === 1) {
          onSelect(mediaItem)
          setOpen(false)
        }
      } catch (err: any) {
        setProgress(id, { status: "error", error: err?.message })
        toast.error(err?.message || `Failed to upload ${file.name}`)
      }
    }

    // Clear completed uploads after a delay
    setTimeout(() => {
      setUploads((prev) => prev.filter((q) => q.status === "uploading"))
    }, 2000)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) {
      void uploadFiles(e.dataTransfer.files)
    }
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function onDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

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
        description="Choose an image or upload a new file"
        className={cn("max-w-4xl", className)}
      >
        <div className="space-y-4">
          {/* Upload toggle + zone */}
          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant={showUpload ? "admin" : "outline"}
              onClick={() => setShowUpload(!showUpload)}
              className="gap-1.5"
            >
              {showUpload ? (
                <RiCloseLine size={14} />
              ) : (
                <RiUploadCloud2Line size={14} />
              )}
              {showUpload ? "Close upload" : "Upload new"}
            </Button>
          </div>

          {showUpload && (
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className={cn(
                "rounded-xl border-2 border-dashed p-6 text-center transition-colors",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <RiUploadCloud2Line
                size={28}
                className={cn(
                  "mx-auto mb-2",
                  isDragging
                    ? "text-primary"
                    : "text-muted-foreground opacity-40"
                )}
              />
              <p className="mb-1 text-sm text-muted-foreground">
                {isDragging
                  ? "Drop files here…"
                  : "Drag & drop files or click to browse"}
              </p>
              <p className="mb-3 text-[10px] text-muted-foreground/60">
                Images, video, audio, PDF · Max 25 MB
              </p>
              <Button
                size="xs"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-1.5"
              >
                <RiAddLine size={14} />
                Choose files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*,application/pdf,.zip,.rar"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    void uploadFiles(e.target.files)
                    e.target.value = ""
                  }
                }}
              />
            </div>
          )}

          {/* Upload progress */}
          {uploads.length > 0 && (
            <div className="space-y-2">
              {uploads.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card/60 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-foreground">
                      {u.name}
                    </p>
                    {u.status === "uploading" && (
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    )}
                    {u.status === "error" && (
                      <p className="mt-0.5 text-[10px] text-destructive">
                        {u.error}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                    {u.status === "done" ? (
                      <RiCheckLine size={14} className="text-green-500" />
                    ) : u.status === "error" ? (
                      <RiCloseLine size={14} className="text-destructive" />
                    ) : (
                      `${u.progress}%`
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Toolbar */}
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
                No media found. Upload files above or in the Media Library.
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
