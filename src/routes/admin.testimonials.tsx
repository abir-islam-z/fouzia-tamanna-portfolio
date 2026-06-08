import {
  EntityList,
  type EntityListColumn,
} from "@/components/admin/entity-list"
import { Card } from "@/components/ui/card"
import {
  getQueryClient,
  testimonialsQuery,
  useDeleteTestimonial,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router"
import { toast } from "sonner"

interface TestimonialItem {
  id?: number
  name: string
  role: string
  content: string
  order: number
}

function AdminTestimonialsComponent() {
  const { data: rawTest = [] } = useSuspenseQuery(testimonialsQuery)
  const testimonials = rawTest as unknown as Array<TestimonialItem>
  const deleteMutation = useDeleteTestimonial()

  const handleDelete = async (item: TestimonialItem) => {
    if (!item.id) return
    if (!confirm(`Delete testimonial from "${item.name}"?`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Testimonial deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

  const columns: EntityListColumn<TestimonialItem>[] = [
    {
      key: "name",
      header: "Name",
      width: "w-48",
      render: (item) => (
        <div className="space-y-0.5">
          <p className="font-medium text-foreground">{item.name}</p>
          <p className="font-mono text-xs text-muted-foreground">{item.role}</p>
        </div>
      ),
    },
    {
      key: "content",
      header: "Content",
      render: (item) => (
        <p className="line-clamp-3 max-w-xl text-sm text-muted-foreground">
          {item.content}
        </p>
      ),
    },
  ]

  const isChildRoute = useRouterState({
    select: (s) => s.location.pathname !== "/admin/testimonials",
  })

  if (isChildRoute) return <Outlet />

  return (
    <Card variant="admin" className="p-6">
      <EntityList
        title="Testimonials"
        subtitle="Manage client feedback and reviews."
        newHref="/admin/testimonials/new"
        newLabel="Add Testimonial"
        items={testimonials}
        columns={columns}
        editHref={(item) =>
          `/admin/testimonials/${item.id}` as `/admin/testimonials/${number}`
        }
        onDelete={handleDelete}
        emptyMessage="No testimonials yet. Add your first one."
      />
    </Card>
  )
}

export const Route = createFileRoute("/admin/testimonials")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(testimonialsQuery)
  },
  component: AdminTestimonialsComponent,
})
