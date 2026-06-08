import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  getQueryClient,
  testimonialsQuery,
  useDeleteTestimonial,
  useUpdateTestimonial,
} from "@/lib/queries"
import { RiAddLine, RiDeleteBinLine, RiSaveLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface TestimonialItem {
  id?: number
  name: string
  role: string
  content: string
  image?: string | null
  order: number
}

function AdminTestimonialsComponent() {
  const { data: rawTestimonials = [] } = useSuspenseQuery(testimonialsQuery)
  const testimonials = rawTestimonials as unknown as Array<TestimonialItem>

  const updateMutation = useUpdateTestimonial()
  const deleteMutation = useDeleteTestimonial()

  const [localTestimonials, setLocalTestimonials] =
    useState<Array<TestimonialItem> | null>(null)
  const displayItems = localTestimonials ?? testimonials

  const handleSave = async (item: TestimonialItem) => {
    try {
      await updateMutation.mutateAsync(item)
      setLocalTestimonials(null) // clear local state since server state is updated
      toast.success("Testimonial saved!")
    } catch (error: any) {
      console.error("Testimonial save failed:", error)
      toast.error(error?.message || "Failed to save testimonial")
    }
  }

  const handleDelete = async (id?: number) => {
    if (id) {
      try {
        await deleteMutation.mutateAsync(id)
        setLocalTestimonials(null)
        toast.success("Testimonial removed.")
      } catch (error: any) {
        console.error("Testimonial delete failed:", error)
        toast.error(error?.message || "Failed to remove testimonial")
      }
    }
  }

  const handleAdd = () => {
    const newItem: TestimonialItem = {
      name: "Client Name",
      role: "Position, Company",
      content: "Kind words...",
      order: displayItems.length,
    }
    setLocalTestimonials([newItem, ...displayItems])
  }

  const update = (i: number, patch: Partial<TestimonialItem>) => {
    const next = [...displayItems]
    next[i] = { ...next[i], ...patch }
    setLocalTestimonials(next)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Testimonials
          </h1>
          <p className="text-muted-foreground">
            Manage client feedback and reviews.
          </p>
        </div>
        <Button variant="admin" onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Testimonial
        </Button>
      </header>

      {displayItems.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[40%]">Content</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayItems.map((item, i) => (
                <TableRow key={item.id ?? `new-${i}`}>
                  <TableCell>
                    <Input
                      variant="admin"
                      type="number"
                      value={item.order}
                      onChange={(e) =>
                        update(i, { order: parseInt(e.target.value) || 0 })
                      }
                      className="h-9 w-16"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.name}
                      onChange={(e) => update(i, { name: e.target.value })}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.role}
                      onChange={(e) => update(i, { role: e.target.value })}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      variant="admin"
                      rows={2}
                      value={item.content}
                      onChange={(e) => update(i, { content: e.target.value })}
                      className="min-h-12 text-sm"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Remove"
                      >
                        <RiDeleteBinLine size={16} />
                      </Button>
                      <Button
                        variant="admin"
                        size="icon"
                        onClick={() => handleSave(item)}
                        className="h-8 w-8"
                        title="Save"
                      >
                        <RiSaveLine size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No testimonials found. Add your first one.
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/testimonials")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(testimonialsQuery)
  },
  component: AdminTestimonialsComponent,
})
