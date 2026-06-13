import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { MediaItem } from "@/components/ui/media-picker"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { getQueryClient, projectsQuery, useUpdateProject } from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface ProjectListItem {
  id: string
  slug: string
  title: string
  summary: string
  caseStudy: string
  tags: string
  isFeatured: boolean
  link: string | null
  github: string | null
  order: number
  gallery?: Array<{
    id: string
    mediaId: string
    order: number
    media: MediaItem
  }>
}

function AdminProjectsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const { data: rawProjects = [] } = useSuspenseQuery(projectsQuery)
  const projects = rawProjects as unknown as Array<ProjectListItem>
  const project = projects.find((p) => p.id === id)
  const updateMutation = useUpdateProject()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      slug: project?.slug ?? "",
      title: project?.title ?? "",
      summary: project?.summary ?? "",
      caseStudy: project?.caseStudy ?? "",
      tags: project?.tags ?? "",
      isFeatured: project?.isFeatured ?? false,
      link: project?.link ?? "",
      github: project?.github ?? "",
      order: project?.order ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim() || !value.slug.trim()) {
        toast.error("Title and slug are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({
          id: project!.id,
          ...value,
          gallery: (project!.gallery ?? []).map((g) => ({
            mediaId: g.mediaId,
            order: g.order,
          })),
        })
        toast.success("Project updated!")
        router.navigate({ to: "/admin/projects" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to update project")
      } finally {
        setIsSaving(false)
      }
    },
  })

  if (!project) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  return (
    <EditPageShell
      title={`Edit: ${project.title}`}
      subtitle={`/projects/${project.slug}`}
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
                <AdminFormField field={f} label="Title" required />
              )}
            />
            <form.Field
              name="slug"
              children={(f) => (
                <AdminFormField
                  field={f}
                  label="Slug"
                  required
                  helperText={
                    <p className="text-[10px] text-muted-foreground">
                      Public URL: <code>/projects/{f.state.value}</code>
                    </p>
                  }
                />
              )}
            />
            <form.Field
              name="summary"
              children={(f) => <AdminFormField field={f} label="Summary" />}
            />
            <form.Field
              name="tags"
              children={(f) => (
                <AdminFormField field={f} label="Tags (comma-separated)" />
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
                  value={f.state.value}
                  onChange={(html) => f.handleChange(html)}
                  placeholder="Tell the story: problem, approach, results, lessons learned…"
                  minHeight={360}
                />
              )}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card variant="admin" className="space-y-4 p-6"></Card>

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
                    checked={f.state.value}
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

export const Route = createFileRoute("/admin/projects/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(projectsQuery)
  },
  component: AdminProjectsEditComponent,
})
