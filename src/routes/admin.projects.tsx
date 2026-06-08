import {
  EntityList,
  type EntityListColumn,
} from "@/components/admin/entity-list"
import { Card } from "@/components/ui/card"
import { getQueryClient, projectsQuery, useDeleteProject } from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { toast } from "sonner"

interface ProjectListItem {
  id?: number
  slug: string
  title: string
  summary: string
  tags: string
  isFeatured: boolean
  order: number
  cover?: { url: string; originalName: string } | null
}

function AdminProjectsComponent() {
  const { data: rawProjects = [] } = useSuspenseQuery(projectsQuery)
  const projects = rawProjects as unknown as Array<ProjectListItem>
  const deleteMutation = useDeleteProject()

  const handleDelete = async (item: ProjectListItem) => {
    if (!item.id) return
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Project deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete project")
    }
  }

  const columns: EntityListColumn<ProjectListItem>[] = [
    {
      key: "cover",
      header: "Cover",
      width: "w-20",
      render: (item) =>
        item.cover ? (
          <img
            src={item.cover.url}
            alt={item.cover.originalName}
            className="h-10 w-16 rounded border border-border object-cover"
          />
        ) : (
          <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed border-border bg-muted/30 text-[9px] text-muted-foreground">
            none
          </div>
        ),
    },
    {
      key: "title",
      header: "Project",
      render: (item) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{item.title}</p>
            {item.isFeatured && (
              <span className="rounded border border-yellow-500/40 bg-yellow-500/10 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-yellow-500 uppercase">
                Featured
              </span>
            )}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            /{item.slug}
          </p>
        </div>
      ),
    },
    {
      key: "summary",
      header: "Summary",
      render: (item) => (
        <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
          {item.summary}
        </p>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      render: (item) => (
        <div className="flex max-w-[180px] flex-wrap gap-1">
          {item.tags
            .split(",")
            .slice(0, 3)
            .map((s, i) => (
              <span
                key={i}
                className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-muted-foreground"
              >
                {s.trim()}
              </span>
            ))}
        </div>
      ),
    },
  ]

  const isChildRoute = useRouterState({
    select: (s) => s.location.pathname !== "/admin/projects",
  })

  if (isChildRoute) return <Outlet />

  return (
    <Card variant="admin" className="p-6">
      <EntityList
        title="Projects"
        subtitle="Manage your portfolio projects and case studies."
        newHref="/admin/projects/new"
        newLabel="Add Project"
        items={projects}
        columns={columns}
        editHref={(item) =>
          `/admin/projects/${item.id}` as `/admin/projects/${number}`
        }
        onDelete={handleDelete}
        emptyMessage="No projects yet. Add your first one to feature on the landing page."
      />
    </Card>
  )
}

export const Route = createFileRoute("/admin/projects")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(projectsQuery)
  },
  component: AdminProjectsComponent,
})
