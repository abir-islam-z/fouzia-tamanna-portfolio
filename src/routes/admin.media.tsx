import { AppDialog } from "@/components/app-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { finalizeMediaUploadFn, getPresignedUpload } from "@/lib/cms"
import {
  getQueryClient,
  mediaQuery,
  queryKeys,
  r2StatusQuery,
  useDeleteMedia,
  useUpdateMedia,
} from "@/lib/queries"
import {
  RiAddLine,
  RiCheckLine,
  RiClipboardLine,
  RiDeleteBinLine,
  RiFile3Line,
  RiFileChartLine,
  RiFileCodeLine,
  RiFileImageLine,
  RiFileMusicLine,
  RiFilePdfLine,
  RiFileVideoLine,
  RiFolderLine,
  RiImageLine,
  RiPencilLine,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useRef, useState } from "react"
import { toast } from "sonner"

interface MediaItem {
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
  createdAt: string | Date
  uploadedBy?: { id: string; username: string } | null
}

const MAX_BYTES = 25 * 1024 * 1024
const ACCEPTED_MIME = [
  "image/",
  "video/",
  "audio/",
  "application/pdf",
  "application/zip",
  "application/json",
  "text/",
  "application/msword",
  "application/vnd.openxmlformats-officedocument",
]

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B"
  const k = 1024
  const units = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

function isAccepted(mime: string) {
  return ACCEPTED_MIME.some((p) => mime.startsWith(p))
}

function pickIcon(mime: string) {
  if (mime.startsWith("image/")) return RiFileImageLine
  if (mime.startsWith("video/")) return RiFileVideoLine
  if (mime.startsWith("audio/")) return RiFileMusicLine
  if (mime === "application/pdf") return RiFilePdfLine
  if (
    mime.includes("json") ||
    mime.includes("javascript") ||
    mime.includes("xml")
  )
    return RiFileCodeLine
  if (mime.includes("zip") || mime.includes("compressed"))
    return RiFileChartLine
  return RiFile3Line
}

function AdminMediaComponent() {
  const { data: rawItems = [] } = useSuspenseQuery(mediaQuery())
  const { data: r2Status } = useSuspenseQuery(r2StatusQuery)
  const items = rawItems as unknown as Array<MediaItem>
  const r2Ok = r2Status?.ok ?? false

  const deleteMutation = useDeleteMedia()
  const updateMutation = useUpdateMedia()
  const queryClient = useQueryClient()

  const [folder, setFolder] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState<
    Array<{
      id: number
      name: string
      progress: number
      status: "uploading" | "done" | "error"
      error?: string
    }>
  >([])
  const [isDragging, setIsDragging] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ alt: string; folder: string }>({
    alt: "",
    folder: "general",
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const folders = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => set.add(i.folder))
    return ["all", ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (folder !== "all" && i.folder !== folder) return false
      if (
        search &&
        !`${i.originalName} ${i.alt ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false
      return true
    })
  }, [items, folder, search])

  const totalSize = useMemo(
    () => filtered.reduce((acc, i) => acc + i.size, 0),
    [filtered]
  )

  async function uploadFiles(fileList: FileList | Array<File>) {
    const files = Array.from(fileList)
    if (files.length === 0) return
    if (r2Ok === false) {
      toast.error(
        "R2 is not configured. Set the required environment variables."
      )
      return
    }

    let nextId = Date.now()
    type UploadEntry = {
      id: number
      name: string
      progress: number
      status: "uploading" | "done" | "error"
      error?: string
    }
    const placeholders: Array<UploadEntry> = files.map((f) => ({
      id: nextId++,
      name: f.name,
      progress: 0,
      status: "uploading",
    }))
    setUploading((prev) => [...prev, ...placeholders])
    const idByFile = new Map<File, number>()
    files.forEach((f, i) => idByFile.set(f, placeholders[i].id))

    function setProgress(id: number, patch: Partial<UploadEntry>) {
      setUploading((prev) =>
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

        const { key, uploadUrl, publicUrl } = await getPresignedUpload({
          data: {
            fileName: file.name,
            mimeType: file.type,
            folder: folder === "all" ? "general" : folder,
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

        await finalizeMediaUploadFn({
          data: {
            key,
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
            folder: folder === "all" ? "general" : folder,
          },
        })

        setProgress(id, { progress: 100, status: "done" })
        toast.success(`Uploaded ${file.name}`)
        void publicUrl
      } catch (err: any) {
        setProgress(id, { status: "error", error: err?.message })
        toast.error(err?.message || `Failed to upload ${file.name}`)
      }
    }

    // Refresh by invalidating the query
    void queryClient.invalidateQueries({ queryKey: queryKeys.media() })

    setTimeout(() => {
      setUploading((prev) => prev.filter((q) => q.status === "uploading"))
    }, 1500)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length) {
      void uploadFiles(e.dataTransfer.files)
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.originalName}"? This cannot be undone.`))
      return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("File deleted")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete file")
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("URL copied to clipboard")
    } catch {
      toast.error("Failed to copy URL")
    }
  }

  function startEdit(item: MediaItem) {
    setEditingId(item.id)
    setEditForm({ alt: item.alt ?? "", folder: item.folder })
  }

  async function saveEdit() {
    if (editingId == null) return
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        alt: editForm.alt,
        folder: editForm.folder,
      })
      toast.success("Updated")
      setEditingId(null)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update")
    }
  }

  function onPickFiles() {
    inputRef.current?.click()
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Media Library
          </h1>
          <p className="text-muted-foreground">
            Upload, organize, and manage all your media assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="admin" className="gap-1.5">
            <RiFile3Line size={14} />
            {items.length} files
          </Badge>
          <Badge variant="admin" className="gap-1.5">
            <RiImageLine size={14} />
            {formatBytes(totalSize)}
          </Badge>
        </div>
      </header>

      {/* Upload area */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-muted/20 hover:border-primary/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RiUploadCloud2Line size={28} />
          </div>
          <div>
            <p className="text-lg font-semibold">Drop files to upload</p>
            <p className="text-sm text-muted-foreground">
              Images, video, audio, PDFs, docs, and archives. Up to 25 MB each.
            </p>
          </div>
          <Button variant="admin" onClick={onPickFiles} className="mt-2 gap-2">
            <RiAddLine size={18} />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Active uploads */}
      {uploading.length > 0 && (
        <Card variant="admin" className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Uploading</h3>
            <span className="text-xs text-muted-foreground">
              {uploading.filter((u) => u.status === "done").length} /{" "}
              {uploading.length}
            </span>
          </div>
          <div className="space-y-2">
            {uploading.map((u, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium">{u.name}</span>
                  <span className="text-muted-foreground">
                    {u.status === "uploading" && `${u.progress}%`}
                    {u.status === "done" && (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <RiCheckLine size={12} /> Done
                      </span>
                    )}
                    {u.status === "error" && (
                      <span className="text-destructive">{u.error}</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all ${
                      u.status === "error"
                        ? "bg-destructive"
                        : u.status === "done"
                          ? "bg-emerald-500"
                          : "bg-primary"
                    }`}
                    style={{
                      width: `${u.status === "done" ? 100 : u.progress}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {folders.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={folder === f ? "admin" : "outline"}
              onClick={() => setFolder(f)}
              className="gap-1.5 capitalize"
            >
              <RiFolderLine size={14} />
              {f}
            </Button>
          ))}
        </div>
        <div className="ml-auto w-full sm:w-64">
          <Input
            variant="admin"
            placeholder="Search by name or alt text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <RiImageLine
            size={48}
            className="mx-auto mb-4 text-muted-foreground opacity-20"
          />
          <p className="text-muted-foreground">
            No media found. Upload your first file above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const Icon = pickIcon(item.mimeType)
            const isImage = item.mimeType.startsWith("image/")
            return (
              <Card
                key={item.id}
                variant="admin"
                className="group overflow-hidden transition-all hover:border-primary/40"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-secondary">
                  {isImage ? (
                    <img
                      src={item.url}
                      alt={item.alt ?? item.originalName}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Icon size={48} />
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.mimeType.split("/")[1]?.slice(0, 8) ?? "file"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => handleCopy(item.url)}
                      title="Copy URL"
                    >
                      <RiClipboardLine size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => startEdit(item)}
                      title="Edit details"
                    >
                      <RiPencilLine size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                      title="Delete"
                    >
                      <RiDeleteBinLine size={14} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1.5 p-3">
                  <p
                    className="truncate text-sm font-semibold"
                    title={item.originalName}
                  >
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">
                      {formatBytes(item.size)}
                    </span>
                    <span className="capitalize">{item.folder}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.uploadedBy ? ` · @${item.uploadedBy.username}` : ""}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit dialog */}
      <AppDialog
        open={editingId != null}
        onOpenChange={(open) => !open && setEditingId(null)}
        title="Edit Media"
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label variant="admin">Folder</Label>
            <Input
              variant="admin"
              value={editForm.folder}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, folder: e.target.value }))
              }
              placeholder="general"
            />
          </div>
          <div className="space-y-2">
            <Label variant="admin">Alt text</Label>
            <Input
              variant="admin"
              value={editForm.alt}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, alt: e.target.value }))
              }
              placeholder="Describe the asset…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
            <Button variant="admin" onClick={saveEdit}>
              Save changes
            </Button>
          </div>
        </div>
      </AppDialog>
    </div>
  )
}

export const Route = createFileRoute("/admin/media")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await Promise.all([
      queryClient.ensureQueryData(mediaQuery()),
      queryClient.ensureQueryData(r2StatusQuery),
    ])
  },
  component: AdminMediaComponent,
})
