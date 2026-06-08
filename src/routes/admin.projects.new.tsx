import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MediaPicker, type MediaItem } from "@/components/ui/media-picker"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { useUpdateProject } from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useRef, useState } from "react"
import slugify from "slugify"
import { toast } from "sonner"

function AdminProjectsNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateProject()
  const [cover, setCover] = useState<MediaItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const slugTouchedRef = useRef(false)

  const form = useForm({
    defaultValues: {
      slug: "",
      title: "",
      summary: "",
      caseStudy: "",
      coverMediaId: null as string | null,
      tags: "",
      isFeatured: false,
      link: "",
      github: "",
      order: 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim() || !value.slug.trim()) {
        toast.error("Title and slug are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync(value)
        toast.success("Project created!")
        router.navigate({ to: "/admin/projects" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to create project")
      } finally {
        setIsSaving(false)
      }
    },
  })

  return (
    <EditPageShell
      title="New Project"
      subtitle="Create a new project with a case study."
      backTo="/admin/projects"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="admin" className="space-y-6 p-6">
            <form.Field
              name="title"
              children={(f) => (
                <AdminFormField
                  field={f}
                  label="Title"
                  required
                  placeholder="Threat-Hunting Lab (ELK + Caldera)"
                  onValueChange={(v) => {
                    if (!slugTouchedRef.current) {
                      form.setFieldValue(
                        "slug",
                        slugify(String(v), { lower: true, strict: true })
                      )
                    }
                  }}
                />
              )}
            />
            <form.Field
              name="slug"
              children={(f) => (
                <AdminFormField
                  field={f}
                  label="Slug"
                  required
                  placeholder="threat-hunting-lab"
                  onValueChange={() => {
                    slugTouchedRef.current = true
                  }}
                  helperText={
                    <p className="text-[10px] text-muted-foreground">
                      Public URL:{" "}
                      <code>
                        /projects/{(f.state.value as string) || "your-slug"}
                      </code>
                    </p>
                  }
                />
              )}
            />
            <form.Field
              name="summary"
              children={(f) => (
                <AdminFormField
                  field={f}
                  label="Summary"
                  placeholder="Short description shown on the project card."
                />
              )}
            />
            <form.Field
              name="tags"
              children={(f) => (
                <AdminFormField
                  field={f}
                  label="Tags (comma-separated)"
                  placeholder="ELK, MITRE Caldera, Detection Engineering"
                />
              )}
            />
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <div>
              <Label variant="admin">Case Study</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Full case study content shown on the dedicated project page.
              </p>
            </div>
            <form.Field
              name="caseStudy"
              children={(f) => (
                <RichTextEditor
                  value={f.state.value as string}
                  onChange={(html) => f.handleChange(html)}
                  placeholder="Tell the story: problem, approach, results, lessons learned…"
                  minHeight={360}
                />
              )}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="admin" className="space-y-4 p-6">
            <div>
              <Label variant="admin">Cover Image</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Used as the project card hero and case-study banner.
              </p>
            </div>
            <form.Field
              name="coverMediaId"
              children={(f) =>
                cover ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-lg border border-border">
                      <img
                        src={cover.url}
                        alt={cover.alt ?? cover.originalName}
                        className="h-auto w-full object-cover"
                      />
                    </div>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {cover.originalName}
                    </p>
                    <div className="flex gap-2">
                      <MediaPicker
                        onSelect={(m) => {
                          setCover(m)
                          f.handleChange(m.id)
                        }}
                        trigger={
                          <button
                            type="button"
                            className="rounded-md border border-border px-3 py-1.5 font-mono text-xs hover:bg-muted"
                          >
                            Replace
                          </button>
                        }
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCover(null)
                          f.handleChange(null)
                        }}
                        className="rounded-md border border-destructive/30 px-3 py-1.5 font-mono text-xs text-destructive hover:bg-destructive/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <MediaPicker
                    onSelect={(m) => {
                      setCover(m)
                      f.handleChange(m.id)
                    }}
                    trigger={
                      <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition-colors hover:border-primary/50">
                        <span className="font-mono text-xs">
                          Choose from media library
                        </span>
                      </div>
                    }
                  />
                )
              }
            />
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <Label variant="admin">Links</Label>
            <div className="space-y-3">
              <form.Field
                name="link"
                children={(f) => (
                  <AdminFormField
                    field={f}
                    label="Live Link"
                    className="text-xs"
                    placeholder="https://..."
                  />
                )}
              />
              <form.Field
                name="github"
                children={(f) => (
                  <AdminFormField
                    field={f}
                    label="GitHub"
                    className="text-xs"
                    placeholder="https://github.com/..."
                  />
                )}
              />
            </div>
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <form.Field
              name="isFeatured"
              children={(f) => (
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                  <div className="space-y-0.5">
                    <Label variant="admin">Featured</Label>
                    <p className="text-[10px] text-muted-foreground">
                      Show on the landing page
                    </p>
                  </div>
                  <Switch
                    checked={f.state.value as boolean}
                    onCheckedChange={(val) => f.handleChange(val)}
                  />
                </div>
              )}
            />
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <form.Field
              name="order"
              children={(f) => (
                <AdminFormField field={f} label="Order" type="number" />
              )}
            />
          </Card>
        </div>
      </div>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/projects/new")({
  component: AdminProjectsNewComponent,
})
