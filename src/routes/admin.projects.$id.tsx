import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { MediaItem } from "@/components/ui/media-picker"
import { MediaPicker } from "@/components/ui/media-picker"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import { getQueryClient, projectsQuery, useUpdateProject } from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import slugify from "slugify"
import { toast } from "sonner"

interface ProjectListItem {
  id: number
  slug: string
  title: string
  summary: string
  caseStudy: string
  coverMediaId: number | null
  cover?: {
    id: number
    url: string
    originalName: string
    alt: string | null
  } | null
  tags: string
  isFeatured: boolean
  link: string | null
  github: string | null
  order: number
  gallery?: Array<{
    id: number
    mediaId: number
    order: number
    media: MediaItem
  }>
}

function AdminProjectsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const projectId = parseInt(id)
  const { data: rawProjects = [] } = useSuspenseQuery(projectsQuery)
  const projects = rawProjects as unknown as Array<ProjectListItem>
  const project = projects.find((p) => p.id === projectId)
  const updateMutation = useUpdateProject()

  const [form, setForm] = useState({
    slug: project?.slug ?? "",
    title: project?.title ?? "",
    summary: project?.summary ?? "",
    caseStudy: project?.caseStudy ?? "",
    coverMediaId: project?.coverMediaId ?? null,
    tags: project?.tags ?? "",
    isFeatured: project?.isFeatured ?? false,
    link: project?.link ?? "",
    github: project?.github ?? "",
    order: project?.order ?? 0,
  })
  const [cover, setCover] = useState<MediaItem | null>(
    (project?.cover as unknown as MediaItem) ?? null
  )
  const [isSaving, setIsSaving] = useState(false)
  const [slugTouched, setSlugTouched] = useState(true)

  useEffect(() => {
    if (project) {
      setForm({
        slug: project.slug,
        title: project.title,
        summary: project.summary,
        caseStudy: project.caseStudy,
        coverMediaId: project.coverMediaId,
        tags: project.tags,
        isFeatured: project.isFeatured,
        link: project.link ?? "",
        github: project.github ?? "",
        order: project.order,
      })
      setCover((project.cover as unknown as MediaItem) ?? null)
    }
  }, [project])

  if (!project) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    )
  }

  const handleTitleChange = (v: string) => {
    setForm((f) => ({
      ...f,
      title: v,
      slug: slugTouched ? f.slug : slugify(v, { lower: true, strict: true }),
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: project.id,
        ...form,
        gallery: (project.gallery ?? []).map((g) => ({
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
  }

  return (
    <EditPageShell
      title={`Edit: ${project.title}`}
      subtitle={`/projects/${project.slug}`}
      backTo="/admin/projects"
      onSave={handleSave}
      isSaving={isSaving}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card variant="admin" className="space-y-6 p-6">
            <div className="space-y-1.5">
              <Label variant="admin">Title *</Label>
              <Input
                variant="admin"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label variant="admin">Slug *</Label>
              <Input
                variant="admin"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true)
                  setForm({ ...form, slug: e.target.value })
                }}
              />
              <p className="text-[10px] text-muted-foreground">
                Public URL: <code>/projects/{form.slug}</code>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label variant="admin">Summary</Label>
              <Input
                variant="admin"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label variant="admin">Tags (comma-separated)</Label>
              <Input
                variant="admin"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <div>
              <Label variant="admin">Case Study</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Full case study content shown on the dedicated project page.
              </p>
            </div>
            <RichTextEditor
              value={form.caseStudy}
              onChange={(html) => setForm({ ...form, caseStudy: html })}
              placeholder="Tell the story: problem, approach, results, lessons learned…"
              minHeight={360}
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
            {cover ? (
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
                      setForm({ ...form, coverMediaId: m.id })
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
                      setForm({ ...form, coverMediaId: null })
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
                  setForm({ ...form, coverMediaId: m.id })
                }}
                trigger={
                  <div className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 text-muted-foreground transition-colors hover:border-primary/50">
                    <span className="font-mono text-xs">
                      Choose from media library
                    </span>
                  </div>
                }
              />
            )}
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <Label variant="admin">Links</Label>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label variant="admin" className="text-xs">
                  Live Link
                </Label>
                <Input
                  variant="admin"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label variant="admin" className="text-xs">
                  GitHub
                </Label>
                <Input
                  variant="admin"
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>
          </Card>

          <Card variant="admin" className="space-y-4 p-6">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
              <div className="space-y-0.5">
                <Label variant="admin">Featured</Label>
                <p className="text-[10px] text-muted-foreground">
                  Show on the landing page
                </p>
              </div>
              <Switch
                checked={form.isFeatured}
                onCheckedChange={(val) => setForm({ ...form, isFeatured: val })}
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
