import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useUpdateTestimonial } from "@/lib/queries"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function AdminTestimonialsNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateTestimonial()
  const [form, setForm] = useState({
    name: "",
    role: "",
    content: "",
    order: 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Name and content are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync(form)
      toast.success("Testimonial created!")
      router.navigate({ to: "/admin/testimonials" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to create testimonial")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title="New Testimonial"
      subtitle="Add a new client or partner testimonial."
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
              placeholder="Daniel Okafor"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Role</Label>
            <Input
              variant="admin"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="SOC Lead at SecureNet Operations"
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
            placeholder="Kind words from the client…"
            minHeight={180}
          />
        </div>
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/testimonials/new")({
  component: AdminTestimonialsNewComponent,
})
