import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { useUpdateCertification } from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function AdminCertificationsNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateCertification()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      title: "",
      issuer: "",
      date: "",
      link: "",
      order: 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim() || !value.issuer.trim()) {
        toast.error("Title and issuer are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({
          ...value,
          link: value.link || null,
        })
        toast.success("Certification created!")
        router.navigate({ to: "/admin/certifications" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to create certification")
      } finally {
        setIsSaving(false)
      }
    },
  })

  return (
    <EditPageShell
      title="New Certification"
      subtitle="Add a new professional credential."
      backTo="/admin/certifications"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="title"
            children={(f) => (
              <div className="md:col-span-2">
                <AdminFormField
                  field={f}
                  label="Title"
                  required
                  placeholder="CompTIA Security+"
                />
              </div>
            )}
          />
          <form.Field
            name="issuer"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Issuer"
                required
                placeholder="CompTIA"
              />
            )}
          />
          <form.Field
            name="date"
            children={(f) => (
              <AdminFormField field={f} label="Date" placeholder="May 2024" />
            )}
          />
          <form.Field
            name="link"
            children={(f) => (
              <div className="md:col-span-2">
                <AdminFormField
                  field={f}
                  label="Link"
                  placeholder="https://www.comptia.org/..."
                />
              </div>
            )}
          />
          <form.Field
            name="order"
            children={(f) => (
              <AdminFormField field={f} label="Order" type="number" />
            )}
          />
        </div>
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/certifications/new")({
  component: AdminCertificationsNewComponent,
})
