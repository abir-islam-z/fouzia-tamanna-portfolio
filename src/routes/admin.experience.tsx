import type { EntityListColumn } from "@/components/admin/entity-list"
import { EntityList } from "@/components/admin/entity-list"
import { Card } from "@/components/ui/card"
import {
  experienceQuery,
  getQueryClient,
  useDeleteExperience,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

interface ExperienceItem {
  id?: number
  role: string
  company: string
  period: string
  description: string
  skills: string
  order: number
}

function AdminExperienceComponent() {
  const { data: rawExp = [] } = useSuspenseQuery(experienceQuery)
  const experience = rawExp as unknown as Array<ExperienceItem>
  const deleteMutation = useDeleteExperience()

  const handleDelete = async (item: ExperienceItem) => {
    if (!item.id) return
    if (!confirm(`Delete "${item.role}" at ${item.company}?`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Experience entry deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

  const columns: Array<EntityListColumn<ExperienceItem>> = [
    {
      key: "role",
      header: "Role",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">{item.role}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {item.company}
          </p>
        </div>
      ),
    },
    {
      key: "period",
      header: "Period",
      width: "w-36",
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          {item.period}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (item) => (
        <p className="line-clamp-2 max-w-md text-sm text-muted-foreground">
          {item.description}
        </p>
      ),
    },
    {
      key: "skills",
      header: "Skills",
      render: (item) => (
        <div className="flex max-w-50 flex-wrap gap-1">
          {item.skills
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
          {item.skills.split(",").length > 3 && (
            <span className="font-mono text-[9px] text-muted-foreground/60">
              +{item.skills.split(",").length - 3}
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <Card variant="admin" className="p-6">
      <EntityList
        title="Experience"
        subtitle="Manage your professional timeline."
        newHref="/admin/experience/new"
        newLabel="Add Position"
        items={experience}
        columns={columns}
        editHref={(item) => `/admin/experience/${item.id}`}
        onDelete={handleDelete}
        emptyMessage="No experience yet. Add your first position."
      />
    </Card>
  )
}

export const Route = createFileRoute("/admin/experience")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(experienceQuery)
  },
  component: AdminExperienceComponent,
})
