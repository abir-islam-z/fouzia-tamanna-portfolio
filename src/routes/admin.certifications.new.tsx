import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateCertification } from "@/lib/queries"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function AdminCertificationsNewComponent() {
  const router = useRouter()
  const updateMutation = useUpdateCertification()
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date: "",
    link: "",
    order: 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim()) {
      toast.error("Title and issuer are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        title: form.title,
        issuer: form.issuer,
        date: form.date,
        link: form.link || null,
        order: form.order,
      })
      toast.success("Certification created!")
      router.navigate({ to: "/admin/certifications" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to create certification")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title="New Certification"
      subtitle="Add a new professional credential."
      backTo="/admin/certifications"
      onSave={handleSave}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label variant="admin">Title *</Label>
            <Input
              variant="admin"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="CompTIA Security+"
            />
          </div>

          <div className="space-y-1.5">
            <Label variant="admin">Issuer *</Label>
            <Input
              variant="admin"
              value={form.issuer}
              onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              placeholder="CompTIA"
            />
          </div>

          <div className="space-y-1.5">
            <Label variant="admin">Date</Label>
            <Input
              variant="admin"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              placeholder="May 2024"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label variant="admin">Link</Label>
            <Input
              variant="admin"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="https://www.comptia.org/..."
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
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/certifications/new")({
  component: AdminCertificationsNewComponent,
})
