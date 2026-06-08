import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { useUpdateExperience } from "@/lib/queries"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function AdminExperienceNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateExperience()
  const [form, setForm] = useState({
    role: "",
    company: "",
    period: "",
    description: "",
    skills: "",
    order: 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!form.role.trim() || !form.company.trim()) {
      toast.error("Role and company are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync(form)
      toast.success("Experience entry created!")
      router.navigate({ to: "/admin/experience" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to create entry")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title="New Experience Entry"
      subtitle="Add a new position to your professional timeline."
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
              placeholder="SOC Analyst (Tier 2)"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Company *</Label>
            <Input
              variant="admin"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="SecureNet Operations"
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
              placeholder="SIEM, Splunk, Wireshark, MITRE ATT&CK"
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

export const Route = createFileRoute("/admin/experience/new")({
  component: AdminExperienceNewComponent,
})
