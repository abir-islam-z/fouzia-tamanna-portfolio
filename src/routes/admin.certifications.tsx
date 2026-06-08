import {
  EntityList,
  type EntityListColumn,
} from "@/components/admin/entity-list"
import { Card } from "@/components/ui/card"
import {
  certificationsQuery,
  getQueryClient,
  useDeleteCertification,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"

interface CertificationItem {
  id?: number
  title: string
  issuer: string
  date: string
  link?: string | null
  order: number
}

function AdminCertificationsComponent() {
  const { data: rawCerts = [] } = useSuspenseQuery(certificationsQuery)
  const certs = rawCerts as unknown as Array<CertificationItem>
  const deleteMutation = useDeleteCertification()

  const handleDelete = async (item: CertificationItem) => {
    if (!item.id) return
    if (!confirm(`Delete "${item.title}"? This cannot be undone.`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Certification deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete certification")
    }
  }

  const columns: EntityListColumn<CertificationItem>[] = [
    {
      key: "title",
      header: "Certification",
      render: (item) => (
        <span className="font-medium text-foreground">{item.title}</span>
      ),
    },
    {
      key: "issuer",
      header: "Issuer",
      render: (item) => (
        <span className="font-mono text-sm text-muted-foreground">
          {item.issuer}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      width: "w-36",
      render: (item) => (
        <span className="font-mono text-xs text-muted-foreground">
          {item.date}
        </span>
      ),
    },
    {
      key: "link",
      header: "Link",
      render: (item) =>
        item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary underline-offset-2 hover:underline"
          >
            {(() => {
              try {
                return new URL(item.link).hostname
              } catch {
                return "Link"
              }
            })()}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        ),
    },
  ]

  return (
    <Card variant="admin" className="p-6">
      <EntityList
        title="Certifications"
        subtitle="Manage your professional credentials."
        newHref="/admin/certifications/new"
        newLabel="Add Certification"
        items={certs}
        columns={columns}
        editHref={(item) =>
          `/admin/certifications/${item.id}` as `/admin/certifications/${number}`
        }
        onDelete={handleDelete}
        emptyMessage="No certifications yet. Add your first credential."
      />
    </Card>
  )
}

export const Route = createFileRoute("/admin/certifications")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(certificationsQuery)
  },
  component: AdminCertificationsComponent,
})
