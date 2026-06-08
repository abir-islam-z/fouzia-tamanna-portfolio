import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  experienceQuery,
  getQueryClient,
  useUpdateExperience,
} from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface ExperienceItem {
  id: string
  role: string
  company: string
  period: string
  description: string
  skills: string
  order: number
}

function AdminExperienceEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const { data: rawExp = [] } = useSuspenseQuery(experienceQuery)
  const experience = rawExp as unknown as Array<ExperienceItem>
  const exp = experience.find((e) => e.id === id)
  const updateMutation = useUpdateExperience()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      role: exp?.role ?? "",
      company: exp?.company ?? "",
      period: exp?.period ?? "",
      description: exp?.description ?? "",
      skills: exp?.skills ?? "",
      order: exp?.order ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.role.trim() || !value.company.trim()) {
        toast.error("Role and company are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({ id: exp!.id, ...value })
        toast.success("Experience entry updated!")
        router.navigate({ to: "/admin/experience" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to update entry")
      } finally {
        setIsSaving(false)
      }
    },
  })

  if (!exp) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Experience entry not found.</p>
      </div>
    )
  }

  return (
    <EditPageShell
      title={`Edit: ${exp.role}`}
      subtitle={`at ${exp.company}`}
      backTo="/admin/experience"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="role"
            children={(f) => <AdminFormField field={f} label="Role" required />}
          />
          <form.Field
            name="company"
            children={(f) => (
              <AdminFormField field={f} label="Company" required />
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
              <AdminFormField field={f} label="Skills (comma-separated)" />
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
                value={f.state.value}
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

export const Route = createFileRoute("/admin/experience/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(experienceQuery)
  },
  component: AdminExperienceEditComponent,
})
