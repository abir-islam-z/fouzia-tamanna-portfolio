import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import {
  certificationsQuery,
  getQueryClient,
  useUpdateCertification,
} from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface CertificationItem {
  id: string
  title: string
  issuer: string
  date: string
  link: string | null
  order: number
}

function AdminCertificationsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const { data: rawCerts = [] } = useSuspenseQuery(certificationsQuery)
  const certs = rawCerts as unknown as Array<CertificationItem>
  const cert = certs.find((c) => c.id === id)
  const updateMutation = useUpdateCertification()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      title: cert?.title ?? "",
      issuer: cert?.issuer ?? "",
      date: cert?.date ?? "",
      link: cert?.link ?? "",
      order: cert?.order ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim() || !value.issuer.trim()) {
        toast.error("Title and issuer are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({
          id: cert!.id,
          ...value,
          link: value.link || null,
        })
        toast.success("Certification updated!")
        router.navigate({ to: "/admin/certifications" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to update certification")
      } finally {
        setIsSaving(false)
      }
    },
  })

  if (!cert) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Certification not found.</p>
      </div>
    )
  }

  return (
    <EditPageShell
      title={`Edit: ${cert.title}`}
      subtitle="Update this professional credential."
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

export const Route = createFileRoute("/admin/certifications/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(certificationsQuery)
  },
  component: AdminCertificationsEditComponent,
})
