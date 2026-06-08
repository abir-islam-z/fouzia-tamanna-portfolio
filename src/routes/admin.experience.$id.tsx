import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  experienceQuery,
  getQueryClient,
  useUpdateExperience,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ExperienceItem {
  id: number
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
  const expId = parseInt(id)
  const { data: rawExp = [] } = useSuspenseQuery(experienceQuery)
  const experience = rawExp as unknown as Array<ExperienceItem>
  const exp = experience.find((e) => e.id === expId)
  const updateMutation = useUpdateExperience()

  const [form, setForm] = useState({
    role: exp?.role ?? "",
    company: exp?.company ?? "",
    period: exp?.period ?? "",
    description: exp?.description ?? "",
    skills: exp?.skills ?? "",
    order: exp?.order ?? 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (exp) {
      setForm({
        role: exp.role,
        company: exp.company,
        period: exp.period,
        description: exp.description,
        skills: exp.skills,
        order: exp.order,
      })
    }
  }, [exp])

  if (!exp) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Experience entry not found.</p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!form.role.trim() || !form.company.trim()) {
      toast.error("Role and company are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({ id: exp.id, ...form })
      toast.success("Experience entry updated!")
      router.navigate({ to: "/admin/experience" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to update entry")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title={`Edit: ${exp.role}`}
      subtitle={`at ${exp.company}`}
      backTo="/admin/experience"
      onSave={handleSave}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label variant="admin">Role *</Label>
            <Input
              variant="admin"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Company *</Label>
            <Input
              variant="admin"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Period</Label>
            <Input
              variant="admin"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="2023 - Present"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Skills (comma-separated)</Label>
            <Input
              variant="admin"
              value={form.skills}
              onChange={(e) => setForm({ ...form, skills: e.target.value })}
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
          <Label variant="admin">Description</Label>
          <RichTextEditor
            value={form.description}
            onChange={(html) => setForm({ ...form, description: html })}
            placeholder="Describe your responsibilities and achievements…"
          />
        </div>
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
