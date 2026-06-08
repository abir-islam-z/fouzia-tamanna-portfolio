import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  getQueryClient,
  publicationsQuery,
  useDeletePublication,
  useUpdatePublication,
} from "@/lib/queries"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiSaveLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface PublicationItem {
  id?: number
  title: string
  authors: string
  venue: string
  year: string
  abstract: string
  link: string | null
  tags: string
  type: "journal" | "conference" | "preprint" | "workshop" | "book-chapter"
  isPublished: boolean
  order: number
}

const TYPE_OPTIONS: PublicationItem["type"][] = [
  "journal",
  "conference",
  "preprint",
  "workshop",
  "book-chapter",
]

function AdminPublicationsComponent() {
  const { data: rawPubs = [] } = useSuspenseQuery(publicationsQuery(true))
  const pubs = rawPubs as unknown as Array<PublicationItem>

  const updateMutation = useUpdatePublication()
  const deleteMutation = useDeletePublication()

  const [localPubs, setLocalPubs] = useState<Array<PublicationItem> | null>(
    null
  )
  const displayItems = localPubs ?? pubs

  const handleSave = async (item: PublicationItem) => {
    try {
      await updateMutation.mutateAsync(item)
      setLocalPubs(null)
      toast.success("Publication saved!")
    } catch (error: any) {
      console.error("Publication save failed:", error)
      toast.error(error?.message || "Failed to save publication")
    }
  }

  const handleDelete = async (id?: number) => {
    if (id) {
      try {
        await deleteMutation.mutateAsync(id)
        setLocalPubs(null)
        toast.success("Publication removed.")
      } catch (error: any) {
        console.error("Publication delete failed:", error)
        toast.error(error?.message || "Failed to remove publication")
      }
    }
  }

  const handleAdd = () => {
    const newItem: PublicationItem = {
      title: "New Publication Title",
      authors: "F. Tamanna",
      venue: "Conference / Journal Name",
      year: new Date().getFullYear().toString(),
      abstract: "Short abstract describing the contribution…",
      link: "",
      tags: "Network Security, SOC",
      type: "journal",
      isPublished: true,
      order: displayItems.length,
    }
    setLocalPubs([newItem, ...displayItems])
  }

  const update = (i: number, patch: Partial<PublicationItem>) => {
    const next = [...displayItems]
    next[i] = { ...next[i], ...patch }
    setLocalPubs(next)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Publications
          </h1>
          <p className="text-muted-foreground">
            Manage your research publications and preprints.
          </p>
        </div>
        <Button variant="admin" onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Publication
        </Button>
      </header>

      {displayItems.length > 0 ? (
        <div className="space-y-6">
          {displayItems.map((item, i) => (
            <div
              key={item.id ?? `new-${i}`}
              className="rounded-lg border border-border bg-card p-4"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Authors</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead className="w-20">Year</TableHead>
                    <TableHead className="w-32">Type</TableHead>
                    <TableHead className="w-20">Pub</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input
                        variant="admin"
                        type="number"
                        value={item.order}
                        onChange={(e) =>
                          update(i, {
                            order: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-9 w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.title}
                        onChange={(e) => update(i, { title: e.target.value })}
                        className="h-9"
                        placeholder="Paper / article title"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.authors}
                        onChange={(e) => update(i, { authors: e.target.value })}
                        className="h-9"
                        placeholder="F. Tamanna, M. Rahman"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.venue}
                        onChange={(e) => update(i, { venue: e.target.value })}
                        className="h-9"
                        placeholder="IEEE / ACM…"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.year}
                        onChange={(e) => update(i, { year: e.target.value })}
                        className="h-9"
                        placeholder="2025"
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={item.type}
                        onChange={(e) =>
                          update(i, {
                            type: e.target.value as PublicationItem["type"],
                          })
                        }
                        className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground"
                      >
                        {TYPE_OPTIONS.map((t) => (
                          <option key={t} value={t}>
                            {t.charAt(0).toUpperCase() +
                              t.slice(1).replace("-", " ")}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        <Switch
                          checked={item.isPublished}
                          onCheckedChange={(val) =>
                            update(i, { isPublished: val })
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-primary"
                            title="Open link"
                          >
                            <RiExternalLinkLine size={14} />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Remove"
                        >
                          <RiDeleteBinLine size={16} />
                        </Button>
                        <Button
                          variant="admin"
                          size="icon"
                          onClick={() => handleSave(item)}
                          className="h-8 w-8"
                          title="Save"
                        >
                          <RiSaveLine size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Abstract
                  </label>
                  <Textarea
                    variant="admin"
                    rows={2}
                    value={item.abstract}
                    onChange={(e) => update(i, { abstract: e.target.value })}
                    className="text-sm"
                    placeholder="Short summary of the contribution…"
                  />
                </div>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Tags
                    </label>
                    <Input
                      variant="admin"
                      value={item.tags}
                      onChange={(e) => update(i, { tags: e.target.value })}
                      className="h-9"
                      placeholder="Encrypted Traffic, ML"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Link (DOI / arXiv)
                    </label>
                    <Input
                      variant="admin"
                      value={item.link ?? ""}
                      onChange={(e) => update(i, { link: e.target.value })}
                      className="h-9"
                      placeholder="https://doi.org/10.1109/…"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No publications yet. Click &quot;Add Publication&quot; to create your
          first.
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/publications")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(publicationsQuery(true))
  },
  component: AdminPublicationsComponent,
})
