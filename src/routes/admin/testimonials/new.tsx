import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useUpdateTestimonial } from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function AdminTestimonialsNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateTestimonial()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      name: "",
      role: "",
      content: "",
      order: 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim() || !value.content.trim()) {
        toast.error("Name and content are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync(value)
        toast.success("Testimonial created!")
        router.navigate({ to: "/admin/testimonials" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to create testimonial")
      } finally {
        setIsSaving(false)
      }
    },
  })

  return (
    <EditPageShell
      title="New Testimonial"
      subtitle="Add a new client or partner testimonial."
      backTo="/admin/testimonials"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="name"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Name"
                required
                placeholder="Daniel Okafor"
              />
            )}
          />
          <form.Field
            name="role"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Role"
                placeholder="SOC Lead at SecureNet Operations"
              />
            )}
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
                placeholder="Kind words from the client…"
                minHeight={180}
              />
            </div>
          )}
        />
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/testimonials/new")({
  component: AdminTestimonialsNewComponent,
})
