import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useUpdateExperience } from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function AdminExperienceNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateExperience()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      role: "",
      company: "",
      period: "",
      description: "",
      skills: "",
      order: 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.role.trim() || !value.company.trim()) {
        toast.error("Role and company are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync(value)
        toast.success("Experience entry created!")
        router.navigate({ to: "/admin/experience" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to create entry")
      } finally {
        setIsSaving(false)
      }
    },
  })

  return (
    <EditPageShell
      title="New Experience Entry"
      subtitle="Add a new position to your professional timeline."
      backTo="/admin/experience"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="role"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Role"
                required
                placeholder="SOC Analyst (Tier 2)"
              />
            )}
          />
          <form.Field
            name="company"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Company"
                required
                placeholder="SecureNet Operations"
              />
            )}
          />
          <form.Field
            name="period"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Period"
                placeholder="2023 - Present"
              />
            )}
          />
          <form.Field
            name="skills"
            children={(f) => (
              <AdminFormField
                field={f}
                label="Skills (comma-separated)"
                placeholder="SIEM, Splunk, Wireshark, MITRE ATT&CK"
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
          name="description"
          children={(f) => (
            <div className="space-y-1.5">
              <Label variant="admin">Description</Label>
              <RichTextEditor
                value={f.state.value as string}
                onChange={(html) => f.handleChange(html)}
                placeholder="Describe your responsibilities and achievements…"
              />
            </div>
          )}
        />
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/experience/new")({
  component: AdminExperienceNewComponent,
})
