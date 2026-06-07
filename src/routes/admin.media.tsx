import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  applyR2Cors,
  deleteMedia,
  finalizeMediaUploadFn,
  getMedia,
  getPresignedUpload,
  getR2CorsStatus,
  getR2Status,
  updateMedia,
} from "@/lib/cms"
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiDeleteBinLine,
  RiDownloadLine,
  RiFile3Line,
  RiFileChartLine,
  RiFileCodeLine,
  RiFileImageLine,
  RiFileMusicLine,
  RiFilePdfLine,
  RiFileVideoLine,
  RiFolderLine,
  RiImageLine,
  RiLoader4Line,
  RiUploadCloud2Line
} from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

interface MediaItem {
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
  createdAt: string | Date
  uploadedBy?: { id: number; username: string } | null
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
  if (mime.includes("json") || mime.includes("javascript") || mime.includes("xml"))
    return RiFileCodeLine
  if (mime.includes("zip") || mime.includes("compressed")) return RiFileChartLine
  return RiFile3Line
}

function AdminMediaComponent() {
  const [items, setItems] = useState<Array<MediaItem>>([])
  const [loading, setLoading] = useState(true)
  const [folder, setFolder] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [r2Ok, setR2Ok] = useState<boolean | null>(null)
  const [r2Error, setR2Error] = useState<string | null>(null)
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
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ alt: string; folder: string }>({
    alt: "",
    folder: "general",
  })
  const [corsApplying, setCorsApplying] = useState(false)
  const [corsStatus, setCorsStatus] = useState<{
    checked: boolean
    hasRules: boolean
    error?: string
  }>({ checked: false, hasRules: false })
  const [corsOrigins, setCorsOrigins] = useState<string>("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void (async () => {
      try {
        const [list, status, cors] = await Promise.all([
          getMedia({ data: undefined }),
          getR2Status(),
          getR2CorsStatus(),
        ])
        setItems(list as Array<MediaItem>)
        setR2Ok(status.ok)
        if (!status.ok) setR2Error(status.error)
        setCorsStatus({
          checked: true,
          hasRules: Array.isArray(cors.rules) && cors.rules.length > 0,
          error: cors.ok ? undefined : cors.error,
        })
        if (typeof window !== "undefined") {
          setCorsOrigins(window.location.origin)
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to load media")
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  async function applyCors() {
    const origins = corsOrigins
      .split(/[,\s]+/)
      .map((o) => o.trim())
      .filter(Boolean)
    if (origins.length === 0) {
      toast.error("Enter at least one origin (e.g. https://yourdomain.com)")
      return
    }
    setCorsApplying(true)
    try {
      const res = await applyR2Cors({ data: { origins } })
      if (!res.ok) {
        toast.error(res.error || "Failed to apply CORS")
        setCorsStatus({ checked: true, hasRules: false, error: res.error })
        return
      }
      toast.success("CORS policy applied — uploads should work now")
      setCorsStatus({ checked: true, hasRules: true, error: undefined })
    } catch (err: any) {
      toast.error(err?.message || "Failed to apply CORS")
    } finally {
      setCorsApplying(false)
    }
  }

  const folders = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => set.add(i.folder))
    return ["all", ...Array.from(set).sort()]
  }, [items])

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (folder !== "all" && i.folder !== folder) return false
      if (search && !`${i.originalName} ${i.alt ?? ""}`.toLowerCase().includes(search.toLowerCase()))
        return false
      return true
    })
  }, [items, folder, search])

  const totalSize = useMemo(
    () => filtered.reduce((acc, i) => acc + i.size, 0),
    [filtered]
  )

  async function refresh(folderName?: string) {
    const list = await getMedia({ data: folderName ? { folder: folderName } : undefined })
    setItems(list as Array<MediaItem>)
  }

  async function uploadFiles(fileList: FileList | Array<File>) {
    const files = Array.from(fileList)
    if (files.length === 0) return
    if (r2Ok === false) {
      toast.error("R2 is not configured. Set the required environment variables.")
      return
    }

    // Track uploads by a stable id so progress updates always target the
    // correct entry, even when multiple files share a name.
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
          throw new Error(`File too large (${formatBytes(file.size)}). Max 25 MB.`)
        }

        // 1) Ask server for a presigned URL
        const { key, uploadUrl, publicUrl } = await getPresignedUpload({
          data: {
            fileName: file.name,
            mimeType: file.type,
            folder: folder === "all" ? "general" : folder,
          },
        })

        // 2) Upload directly to R2 with XHR for progress
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
              new Error(
                "Network error — this is usually a CORS misconfiguration on the R2 bucket. Use the CORS fixer below."
              )
            )
          xhr.ontimeout = () => reject(new Error("Upload timed out"))
          xhr.send(file)
        })

        // 3) Persist DB record
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

    await refresh()
    setTimeout(() => {
      setUploading((prev) => prev.filter((q) => q.status === "uploading"))
    }, 1500)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      void uploadFiles(e.dataTransfer.files)
    }
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Delete "${item.originalName}"? This cannot be undone.`)) return
    try {
      await deleteMedia({ data: item.id })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
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
      await updateMedia({
        data: { id: editingId, alt: editForm.alt, folder: editForm.folder },
      })
      setItems((prev) =>
        prev.map((i) =>
          i.id === editingId
            ? { ...i, alt: editForm.alt, folder: editForm.folder }
            : i
        )
      )
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
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">
            Upload, organize, and manage all your media assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-1.5">
            <RiFile3Line size={14} />
            {items.length} files
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
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
        className={`relative rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border bg-card/30 hover:border-primary/50"
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
          <Button onClick={onPickFiles} className="mt-2 gap-2">
            <RiAddLine size={18} />
            Choose Files
          </Button>
        </div>
      </div>

      {/* Active uploads */}
      {uploading.length > 0 && (
        <Card className="border-border bg-card/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Uploading</h3>
            <span className="text-xs text-muted-foreground">
              {uploading.filter((u) => u.status === "done").length} / {uploading.length}
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
                    style={{ width: `${u.status === "done" ? 100 : u.progress}%` }}
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
              variant={folder === f ? "default" : "outline"}
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
            placeholder="Search by name or alt text…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <RiLoader4Line size={28} className="animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center">
          <RiImageLine size={48} className="mx-auto mb-4 text-muted-foreground opacity-20" />
          <p className="text-muted-foreground">No media found. Upload your first file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const Icon = pickIcon(item.mimeType)
            const isImage = item.mimeType.startsWith("image/")
            return (
              <Card
                key={item.id}
                className="group overflow-hidden border-border bg-card/30 transition-all hover:border-primary/40"
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
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {item.mimeType.split("/")[1]?.slice(0, 8) ?? "file"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => handleCopy(item.url)}
                      title="Copy URL"
                    >
                      <RiDownloadLine size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      onClick={() => startEdit(item)}
                      title="Edit details"
                    >
                      <RiAddLine size={14} />
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
                  <p className="truncate text-sm font-semibold" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-medium">{formatBytes(item.size)}</span>
                    <span className="capitalize">{item.folder}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()}
                    {item.uploadedBy ? ` · @${item.uploadedBy.username}` : ""}
                  </p>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingId != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          onClick={() => setEditingId(null)}
        >
          <Card
            className="w-full max-w-md space-y-5 border-border bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Media</h2>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setEditingId(null)}
              >
                <RiCloseLine size={18} />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Folder</Label>
              <Input
                value={editForm.folder}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, folder: e.target.value }))
                }
                placeholder="general"
              />
            </div>
            <div className="space-y-2">
              <Label>Alt text</Label>
              <Input
                value={editForm.alt}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, alt: e.target.value }))
                }
                placeholder="Describe the asset…"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditingId(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save changes</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaComponent,
})
