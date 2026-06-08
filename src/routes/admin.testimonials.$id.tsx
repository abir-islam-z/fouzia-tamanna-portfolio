import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  getQueryClient,
  testimonialsQuery,
  useUpdateTestimonial,
} from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface TestimonialItem {
  id: string
  name: string
  role: string
  content: string
  order: number
}

function AdminTestimonialsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const { data: rawTest = [] } = useSuspenseQuery(testimonialsQuery)
  const testimonials = rawTest as unknown as Array<TestimonialItem>
  const test = testimonials.find((t) => t.id === id)
  const updateMutation = useUpdateTestimonial()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      name: test?.name ?? "",
      role: test?.role ?? "",
      content: test?.content ?? "",
      order: test?.order ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim() || !value.content.trim()) {
        toast.error("Name and content are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({ id: test!.id, ...value })
        toast.success("Testimonial updated!")
        router.navigate({ to: "/admin/testimonials" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to update testimonial")
      } finally {
        setIsSaving(false)
      }
    },
  })

  if (!test) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Testimonial not found.</p>
      </div>
    )
  }

  return (
    <EditPageShell
      title={`Edit: ${test.name}`}
      subtitle={test.role}
      backTo="/admin/testimonials"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="name"
            children={(f) => <AdminFormField field={f} label="Name" required />}
          />
          <form.Field
            name="role"
            children={(f) => <AdminFormField field={f} label="Role" />}
          />
          <form.Field
            name="order"
            children={(f) => (
              <AdminFormField field={f} label="Order" type="number" />
            )}
          />
        </div>
        <form.Field
          name="content"
          children={(f) => (
            <div className="space-y-1.5">
              <Label variant="admin">Content *</Label>
              <RichTextEditor
                value={f.state.value as string}
                onChange={(html) => f.handleChange(html)}
                minHeight={180}
              />
            </div>
          )}
        />
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
