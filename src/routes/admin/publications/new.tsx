import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { useUpdatePublication } from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
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
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
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
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim() || !value.authors.trim()) {
        toast.error("Title and authors are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({
          ...value,
          link: value.link || null,
        })
        toast.success("Publication created!")
        router.navigate({ to: "/admin/publications" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to create publication")
      } finally {
        setIsSaving(false)
      }
    },
  })

  return (
    <EditPageShell
      title="New Publication"
      subtitle="Add a new research publication or preprint."
      backTo="/admin/publications"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="title"
            children={(f) => (
              <div className="md:col-span-2">
                <AdminFormField field={f} label="Title" required />
              </div>
            )}
          />
          <form.Field
            name="authors"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Authors"
                required
                placeholder="F. Tamanna, M. Rahman"
              />
            )}
          />
          <form.Field
            name="venue"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Venue"
                placeholder="IEEE / ACM…"
              />
            )}
          />
          <form.Field
            name="year"
            children={(f) => <AdminFormField field={f} label="Year" />}
          />
          <form.Field
            name="type"
            children={(f) => (
              <div className="space-y-1.5">
                <Label variant="admin">Type</Label>
                <select
                  value={f.state.value as string}
                  onChange={(e) =>
                    f.handleChange(
                      e.target.value as (typeof TYPE_OPTIONS)[number]
                    )
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
            )}
          />
          <form.Field
            name="tags"
            children={(f) => (
              <AdminFormField field={f} label="Tags (comma-separated)" />
            )}
          />
          <form.Field
            name="link"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Link (DOI / arXiv)"
                placeholder="https://doi.org/10.1109/…"
              />
            )}
          />
          <form.Field
            name="order"
            children={(f) => (
              <AdminFormField field={f} label="Order" type="number" />
            )}
          />
          <form.Field
            name="isPublished"
            children={(f) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="space-y-0.5">
                  <Label variant="admin">Published</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Show on the public site
                  </p>
                </div>
                <Switch
                  checked={f.state.value as boolean}
                  onCheckedChange={(val) => f.handleChange(val)}
                />
              </div>
            )}
          />
        </div>
        <form.Field
          name="abstract"
          children={(f) => (
            <div className="space-y-1.5">
              <Label variant="admin">Abstract</Label>
              <RichTextEditor
                value={f.state.value as string}
                onChange={(html) => f.handleChange(html)}
                placeholder="Short summary of the contribution…"
                minHeight={200}
              />
            </div>
          )}
        />
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/publications/new")({
  component: AdminPublicationsNewComponent,
})
