import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
  RiSaveLine,
} from "@remixicon/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  deletePublication,
  getPublications,
  updatePublication,
} from "@/lib/cms"

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
  const [pubs, setPubs] = useState<Array<PublicationItem>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = (await getPublications({
          data: { includeUnpublished: true },
        })) as PublicationItem[]
        setPubs(data ?? [])
      } catch (err) {
        console.error("Failed to load publications.", err)
        toast.error("Failed to load publications")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async (item: PublicationItem) => {
    try {
      await updatePublication({ data: item })
      const updated = (await getPublications({
        data: { includeUnpublished: true },
      })) as PublicationItem[]
      setPubs(updated ?? [])
      toast.success("Publication saved!")
    } catch (error: any) {
      console.error("Publication save failed:", error)
      toast.error(error?.message || "Failed to save publication")
    }
  }

  const handleDelete = async (id?: number) => {
    if (id) {
      try {
        await deletePublication({ data: id })
        const updated = (await getPublications({
          data: { includeUnpublished: true },
        })) as PublicationItem[]
        setPubs(updated ?? [])
        toast.success("Publication removed.")
      } catch (error: any) {
        console.error("Publication delete failed:", error)
        toast.error(error?.message || "Failed to remove publication")
      }
    } else {
      setPubs(pubs.filter((p) => p.id !== undefined))
    }
  }

  const handleAdd = () => {
    setPubs([
      {
        title: "New Publication Title",
        authors: "F. Tamanna",
        venue: "Conference / Journal Name",
        year: new Date().getFullYear().toString(),
        abstract: "Short abstract describing the contribution…",
        link: "",
        tags: "Network Security, SOC",
        type: "journal",
        isPublished: true,
        order: pubs.length,
      },
      ...pubs,
    ])
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading publications…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Publications</h1>
          <p className="text-muted-foreground">
            Manage your research publications and preprints.
          </p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Publication
        </Button>
      </header>

      <div className="space-y-6">
        {pubs.length > 0 ? (
          pubs.map((item, i) => (
            <Card
              key={item.id ?? `new-${i}`}
              className="border-border bg-card/30 p-6"
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={item.title}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], title: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="Paper / article title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Authors (comma separated)</Label>
                  <Input
                    value={item.authors}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], authors: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="F. Tamanna, M. Rahman, A. Hossain"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Venue (Journal / Conference)</Label>
                  <Input
                    value={item.venue}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], venue: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="IEEE Transactions on Information Forensics and Security"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    value={item.year}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], year: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="2025"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select
                    value={item.type}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = {
                        ...next[i],
                        type: e.target.value as PublicationItem["type"],
                      }
                      setPubs(next)
                    }}
                    className="h-9 w-full rounded-md border border-input bg-background/50 px-3 text-sm"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Abstract</Label>
                  <Textarea
                    rows={4}
                    value={item.abstract}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], abstract: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="Short summary of the contribution, methodology, and key results…"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={item.tags}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], tags: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="Encrypted Traffic, ML, Zero Trust"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Link (DOI / arXiv / publisher URL)</Label>
                  <Input
                    value={item.link ?? ""}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], link: e.target.value }
                      setPubs(next)
                    }}
                    placeholder="https://doi.org/10.1109/…"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Order (Lower = First)</Label>
                  <Input
                    type="number"
                    value={item.order}
                    onChange={(e) => {
                      const next = [...pubs]
                      next[i] = {
                        ...next[i],
                        order: parseInt(e.target.value) || 0,
                      }
                      setPubs(next)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-bold tracking-tight">
                      Published
                    </Label>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      Show on public portfolio
                    </p>
                  </div>
                  <Switch
                    checked={item.isPublished}
                    onCheckedChange={(val) => {
                      const next = [...pubs]
                      next[i] = { ...next[i], isPublished: val }
                      setPubs(next)
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-6">
                <Button
                  variant="ghost"
                  onClick={() => handleDelete(item.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <RiDeleteBinLine size={20} className="mr-2" />
                  Remove
                </Button>
                <div className="flex items-center gap-2">
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-primary"
                      title="Open link"
                    >
                      <RiExternalLinkLine size={16} />
                    </a>
                  )}
                  <Button onClick={() => handleSave(item)} className="gap-2">
                    <RiSaveLine size={18} />
                    Save Publication
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No publications yet. Click "Add Publication" to create your first.
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/admin/publications")({
  component: AdminPublicationsComponent,
})
