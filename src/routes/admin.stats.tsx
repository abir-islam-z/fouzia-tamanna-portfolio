import {
  EntityList,
  type EntityListColumn,
} from "@/components/admin/entity-list"
import { Card } from "@/components/ui/card"
import {
  getQueryClient,
  statsQuery,
  useDeleteStat,
  useUpdateStat,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

interface StatItem {
  id?: number
  value: string
  label: string
  order: number
}

function AdminStatsComponent() {
  const { data: rawStats = [] } = useSuspenseQuery(statsQuery)
  const stats = rawStats as unknown as Array<StatItem>
  const deleteMutation = useDeleteStat()
  const updateMutation = useUpdateStat()

  const handleDelete = async (item: StatItem) => {
    if (!item.id) return
    if (!confirm(`Delete stat "${item.label}"?`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Stat deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

  const handleAdd = async () => {
    try {
      await updateMutation.mutateAsync({
        value: "0",
        label: "New Stat",
        order: stats.length,
      })
      toast.success("Stat added. Click to edit.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to add stat")
    }
  }

  const columns: EntityListColumn<StatItem>[] = [
    {
      key: "value",
      header: "Value",
      width: "w-32",
      render: (item) => (
        <span className="font-display text-lg font-bold text-primary">
          {item.value}
        </span>
      ),
    },
    {
      key: "label",
      header: "Label",
      render: (item) => (
        <span className="text-sm text-foreground">{item.label}</span>
      ),
    },
  ]

  return (
    <Card variant="admin" className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Stats</h1>
          <p className="text-muted-foreground">
            Key numbers shown in the profile section.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs hover:bg-muted"
        >
          + Add Stat
        </button>
      </div>
      <EntityList
        title=""
        newHref="/admin"
        newLabel="Add Stat"
        items={stats}
        columns={columns}
        editHref={() => "/admin" as `/admin/${number}`}
        onDelete={handleDelete}
        emptyMessage="No stats yet."
        showOrder={true}
      />
    </Card>
  )
}

export const Route = createFileRoute("/admin/stats")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(statsQuery)
  },
  component: AdminStatsComponent,
})
