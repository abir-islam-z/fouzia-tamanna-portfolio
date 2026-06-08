import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { useUpdatePublication } from "@/lib/queries"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

const TYPE_OPTIONS = [
  "journal",
  "conference",
  "preprint",
  "workshop",
  "book-chapter",
] as const

function AdminPublicationsNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdatePublication()
  const [form, setForm] = useState({
    title: "",
    authors: "",
    venue: "",
    year: new Date().getFullYear().toString(),
    abstract: "",
    link: "",
    tags: "",
    type: "journal" as (typeof TYPE_OPTIONS)[number],
    isPublished: true,
    order: 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim() || !form.authors.trim()) {
      toast.error("Title and authors are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        ...form,
        link: form.link || null,
      })
      toast.success("Publication created!")
      router.navigate({ to: "/admin/publications" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to create publication")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title="New Publication"
      subtitle="Add a new research publication or preprint."
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
              placeholder="F. Tamanna, M. Rahman"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Venue</Label>
            <Input
              variant="admin"
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              placeholder="IEEE / ACM…"
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
            <Label variant="admin">Tags (comma-separated)</Label>
            <Input
              variant="admin"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Link (DOI / arXiv)</Label>
            <Input
              variant="admin"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://doi.org/10.1109/…"
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
            placeholder="Short summary of the contribution…"
            minHeight={200}
          />
        </div>
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/publications/new")({
  component: AdminPublicationsNewComponent,
})
