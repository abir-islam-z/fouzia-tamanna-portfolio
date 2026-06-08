import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  getQueryClient,
  testimonialsQuery,
  useUpdateTestimonial,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface TestimonialItem {
  id: number
  name: string
  role: string
  content: string
  order: number
}

function AdminTestimonialsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const testId = parseInt(id)
  const { data: rawTest = [] } = useSuspenseQuery(testimonialsQuery)
  const testimonials = rawTest as unknown as Array<TestimonialItem>
  const test = testimonials.find((t) => t.id === testId)
  const updateMutation = useUpdateTestimonial()

  const [form, setForm] = useState({
    name: test?.name ?? "",
    role: test?.role ?? "",
    content: test?.content ?? "",
    order: test?.order ?? 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (test) {
      setForm({
        name: test.name,
        role: test.role,
        content: test.content,
        order: test.order,
      })
    }
  }, [test])

  if (!test) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Testimonial not found.</p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Name and content are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({ id: test.id, ...form })
      toast.success("Testimonial updated!")
      router.navigate({ to: "/admin/testimonials" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to update testimonial")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title={`Edit: ${test.name}`}
      subtitle={test.role}
      backTo="/admin/testimonials"
      onSave={handleSave}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label variant="admin">Name *</Label>
            <Input
              variant="admin"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Role</Label>
            <Input
              variant="admin"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
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
        </div>
        <div className="space-y-1.5">
          <Label variant="admin">Content *</Label>
          <RichTextEditor
            value={form.content}
            onChange={(html) => setForm({ ...form, content: html })}
            minHeight={180}
          />
        </div>
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/testimonials/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(testimonialsQuery)
  },
  component: AdminTestimonialsEditComponent,
})
