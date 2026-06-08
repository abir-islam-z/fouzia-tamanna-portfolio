import {
  EntityList,
  type EntityListColumn,
} from "@/components/admin/entity-list"
import { Card } from "@/components/ui/card"
import {
  getQueryClient,
  publicationsQuery,
  useDeletePublication,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

interface PublicationItem {
  id?: number
  title: string
  authors: string
  venue: string
  year: string
  type: "journal" | "conference" | "preprint" | "workshop" | "book-chapter"
  isPublished: boolean
  order: number
}

const TYPE_LABEL: Record<string, string> = {
  journal: "Journal",
  conference: "Conference",
  preprint: "Preprint",
  workshop: "Workshop",
  "book-chapter": "Book Chapter",
}

function AdminPublicationsComponent() {
  const { data: rawPubs = [] } = useSuspenseQuery(publicationsQuery(true))
  const pubs = rawPubs as unknown as Array<PublicationItem>
  const deleteMutation = useDeletePublication()

  const handleDelete = async (item: PublicationItem) => {
    if (!item.id) return
    if (!confirm(`Delete "${item.title}"?`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Publication deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

  const columns: EntityListColumn<PublicationItem>[] = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">{item.title}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {item.authors}
          </p>
        </div>
      ),
    },
    {
      key: "venue",
      header: "Venue",
      render: (item) => (
        <span className="text-sm text-muted-foreground">{item.venue}</span>
      ),
    },
    {
      key: "year",
      header: "Year",
      width: "w-20",
      render: (item) => (
        <span className="font-mono text-sm text-primary">{item.year}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      width: "w-32",
      render: (item) => (
        <span className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase">
          {TYPE_LABEL[item.type] ?? item.type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "w-24",
      render: (item) =>
        item.isPublished ? (
          <span className="font-mono text-[10px] tracking-wider text-emerald-500 uppercase">
            Published
          </span>
        ) : (
          <span className="font-mono text-[10px] tracking-wider text-muted-foreground uppercase">
            Draft
          </span>
        ),
    },
  ]

  return (
    <Card variant="admin" className="p-6">
      <EntityList
        title="Publications"
        subtitle="Manage your research publications and preprints."
        newHref="/admin/publications/new"
        newLabel="Add Publication"
        items={pubs}
        columns={columns}
        editHref={(item) =>
          `/admin/publications/${item.id}` as `/admin/publications/${number}`
        }
        onDelete={handleDelete}
        emptyMessage="No publications yet. Add your first paper."
      />
    </Card>
  )
}

export const Route = createFileRoute("/admin/publications")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(publicationsQuery(true))
  },
  component: AdminPublicationsComponent,
})
