import { AdminFormField } from "@/components/admin/admin-form-field"
import { EditPageShell } from "@/components/admin/edit-page-shell"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { Switch } from "@/components/ui/switch"
import {
  getQueryClient,
  publicationsQuery,
  useUpdatePublication,
} from "@/lib/queries"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, useRouter } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

const TYPE_OPTIONS = [
  "journal",
  "conference",
  "preprint",
  "workshop",
  "book-chapter",
] as const

interface PublicationItem {
  id: number
  title: string
  authors: string
  venue: string
  year: string
  abstract: string
  link: string | null
  tags: string
  type: (typeof TYPE_OPTIONS)[number]
  isPublished: boolean
  order: number
}

function AdminPublicationsEditComponent() {
  const { id } = Route.useParams()
  const router = useRouter()
  const pubId = parseInt(id)
  const { data: rawPubs = [] } = useSuspenseQuery(publicationsQuery(true))
  const pubs = rawPubs as unknown as Array<PublicationItem>
  const pub = pubs.find((p) => p.id === pubId)
  const updateMutation = useUpdatePublication()
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm({
    defaultValues: {
      title: pub?.title ?? "",
      authors: pub?.authors ?? "",
      venue: pub?.venue ?? "",
      year: pub?.year ?? "",
      abstract: pub?.abstract ?? "",
      link: pub?.link ?? "",
      tags: pub?.tags ?? "",
      type: pub?.type ?? ("journal" as (typeof TYPE_OPTIONS)[number]),
      isPublished: pub?.isPublished ?? true,
      order: pub?.order ?? 0,
    },
    onSubmit: async ({ value }) => {
      if (!value.title.trim() || !value.authors.trim()) {
        toast.error("Title and authors are required.")
        return
      }
      setIsSaving(true)
      try {
        await updateMutation.mutateAsync({
          id: pub!.id,
          ...value,
          link: value.link || null,
        })
        toast.success("Publication updated!")
        router.navigate({ to: "/admin/publications" })
      } catch (err: any) {
        toast.error(err?.message || "Failed to update publication")
      } finally {
        setIsSaving(false)
      }
    },
  })

  if (!pub) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">Publication not found.</p>
      </div>
    )
  }

  return (
    <EditPageShell
      title={`Edit: ${pub.title}`}
      subtitle={`${pub.authors} · ${pub.venue}`}
      backTo="/admin/publications"
      onSave={() => form.handleSubmit()}
      isSaving={isSaving}
    >
      <Card variant="admin" className="space-y-6 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <form.Field
            name="title"
            children={(f) => (
              <div className="md:col-span-2">
                <AdminFormField field={f} label="Title" required />
              </div>
            )}
          />
          <form.Field
            name="authors"
            children={(f) => (
              <AdminFormField field={f} label="Authors" required />
            )}
          />
          <form.Field
            name="venue"
            children={(f) => <AdminFormField field={f} label="Venue" />}
          />
          <form.Field
            name="year"
            children={(f) => <AdminFormField field={f} label="Year" />}
          />
          <form.Field
            name="type"
            children={(f) => (
              <div className="space-y-1.5">
                <Label variant="admin">Type</Label>
                <select
                  value={f.state.value as string}
                  onChange={(e) =>
                    f.handleChange(
                      e.target.value as (typeof TYPE_OPTIONS)[number]
                    )
                  }
                  className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />
          <form.Field
            name="tags"
            children={(f) => <AdminFormField field={f} label="Tags" />}
          />
          <form.Field
            name="link"
            children={(f) => <AdminFormField field={f} label="Link" />}
          />
          <form.Field
            name="order"
            children={(f) => (
              <AdminFormField field={f} label="Order" type="number" />
            )}
          />
          <form.Field
            name="isPublished"
            children={(f) => (
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
                <div className="space-y-0.5">
                  <Label variant="admin">Published</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Show on the public site
                  </p>
                </div>
                <Switch
                  checked={f.state.value as boolean}
                  onCheckedChange={(val) => f.handleChange(val)}
                />
              </div>
            )}
          />
        </div>
        <form.Field
          name="abstract"
          children={(f) => (
            <div className="space-y-1.5">
              <Label variant="admin">Abstract</Label>
              <RichTextEditor
                value={f.state.value as string}
                onChange={(html) => f.handleChange(html)}
                minHeight={200}
              />
            </div>
          )}
        />
      </Card>
    </EditPageShell>
  )
}

export const Route = createFileRoute("/admin/publications/$id")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(publicationsQuery(true))
  },
  component: AdminPublicationsEditComponent,
})
