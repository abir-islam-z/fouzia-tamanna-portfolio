import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  certificationsQuery,
  getQueryClient,
  useUpdateCertification,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CertificationItem {
  id: number
  title: string
  issuer: string
  date: string
  link: string | null
  order: number
}

function AdminCertificationsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const certId = parseInt(id)
  const { data: rawCerts = [] } = useSuspenseQuery(certificationsQuery)
  const certs = rawCerts as unknown as Array<CertificationItem>
  const cert = certs.find((c) => c.id === certId)

  const updateMutation = useUpdateCertification()
  const [form, setForm] = useState({
    title: cert?.title ?? "",
    issuer: cert?.issuer ?? "",
    date: cert?.date ?? "",
    link: cert?.link ?? "",
    order: cert?.order ?? 0,
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (cert) {
      setForm({
        title: cert.title,
        issuer: cert.issuer,
        date: cert.date,
        link: cert.link ?? "",
        order: cert.order,
      })
    }
  }, [cert])

  if (!cert) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Certification not found.</p>
      </div>
    )
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.issuer.trim()) {
      toast.error("Title and issuer are required.")
      return
    }
    setIsSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: cert.id,
        title: form.title,
        issuer: form.issuer,
        date: form.date,
        link: form.link || null,
        order: form.order,
      })
      toast.success("Certification updated!")
      router.navigate({ to: "/admin/certifications" })
    } catch (err: any) {
      toast.error(err?.message || "Failed to update certification")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <EditPageShell
      title={`Edit: ${cert.title}`}
      subtitle="Update this professional credential."
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

export const Route = createFileRoute("/admin/certifications/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(certificationsQuery)
  },
  component: AdminCertificationsEditComponent,
})
