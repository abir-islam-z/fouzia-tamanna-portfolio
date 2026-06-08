import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import {
  getQueryClient,
  publicationsQuery,
  useUpdatePublication,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const TYPE_OPTIONS = [
  "journal",
  "conference",
  "preprint",
  "workshop",
  "book-chapter",
] as const

interface PublicationItem {
  id: number
  title: string
  authors: string
  venue: string
  year: string
  abstract: string
  link: string | null
  tags: string
  type: (typeof TYPE_OPTIONS)[number]
  isPublished: boolean
  order: number
}

function AdminPublicationsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const pubId = parseInt(id)
  const { data: rawPubs = [] } = useSuspenseQuery(publicationsQuery(true))
  const pubs = rawPubs as unknown as Array<PublicationItem>
  const pub = pubs.find((p) => p.id === pubId)
  const updateMutation = useUpdatePublication()

  const [form, setForm] = useState({
    title: pub?.title ?? "",
    authors: pub?.authors ?? "",
    venue: pub?.venue ?? "",
    year: pub?.year ?? "",
    abstract: pub?.abstract ?? "",
    link: pub?.link ?? "",
    tags: pub?.tags ?? "",
    type: pub?.type ?? ("journal" as (typeof TYPE_OPTIONS)[number]),
    isPublished: pub?.isPublished ?? true,
    order: pub?.order ?? 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (pub) {
      setForm({
        title: pub.title,
        authors: pub.authors,
        venue: pub.venue,
        year: pub.year,
        abstract: pub.abstract,
        link: pub.link ?? "",
        tags: pub.tags,
        type: pub.type,
        isPublished: pub.isPublished,
        order: pub.order,
      })
    }
  }, [pub])

  if (!pub) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Publication not found.</p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.authors.trim()) {
      toast.error("Title and authors are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: pub.id,
        ...form,
        link: form.link || null,
      })
      toast.success("Publication updated!")
      router.navigate({ to: "/admin/publications" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to update publication")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title={`Edit: ${pub.title}`}
      subtitle={`${pub.authors} · ${pub.venue}`}
      backTo="/admin/publications"
      onSave={handleSave}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label variant="admin">Title *</Label>
            <Input
              variant="admin"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Authors *</Label>
            <Input
              variant="admin"
              value={form.authors}
              onChange={(e) => setForm({ ...form, authors: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Venue</Label>
            <Input
              variant="admin"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Year</Label>
            <Input
              variant="admin"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Type</Label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as (typeof TYPE_OPTIONS)[number],
                })
              }
              className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Tags</Label>
            <Input
              variant="admin"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Link</Label>
            <Input
              variant="admin"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Order</Label>
            <Input
              variant="admin"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
            <div className="space-y-0.5">
              <Label variant="admin">Published</Label>
              <p className="text-[10px] text-muted-foreground">
                Show on the public site
              </p>
            </div>
            <Switch
              checked={form.isPublished}
              onCheckedChange={(val) => setForm({ ...form, isPublished: val })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label variant="admin">Abstract</Label>
          <RichTextEditor
            value={form.abstract}
            onChange={(html) => setForm({ ...form, abstract: html })}
            minHeight={200}
          />
        </div>
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/publications/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(publicationsQuery(true))
  },
  component: AdminPublicationsEditComponent,
})
