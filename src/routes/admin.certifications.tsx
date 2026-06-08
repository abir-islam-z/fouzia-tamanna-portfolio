import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  deleteCertification,
  getCertifications,
  updateCertification,
} from "@/lib/cms"
import { RiAddLine, RiDeleteBinLine, RiSaveLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface CertificationItem {
  id?: number
  title: string
  issuer: string
  date: string
  link?: string | null
  order: number
}

function AdminCertificationsComponent() {
  const [certs, setCerts] = useState<Array<CertificationItem>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getCertifications()
      setCerts(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async (item: CertificationItem) => {
    try {
      await updateCertification({ data: item })
      const updated = await getCertifications()
      setCerts(updated)
      toast.success("Certification saved!")
    } catch (error: any) {
      console.error("Certification save failed:", error)
      toast.error(error?.message || "Failed to save certification")
    }
  }

  const handleDelete = async (id?: number) => {
    try {
      if (id) {
        await deleteCertification({ data: id })
        const updated = await getCertifications()
        setCerts(updated)
        toast.success("Certification removed.")
      } else {
        setCerts(certs.filter((c) => c.id !== undefined))
      }
    } catch (error: any) {
      console.error("Certification delete failed:", error)
      toast.error(error?.message || "Failed to remove certification")
    }
  }

  const handleAdd = () => {
    setCerts([
      {
        title: "New Certification",
        issuer: "Issuing Organization",
        date: "Month, Year",
        order: certs.length,
      },
      ...certs,
    ])
  }

  const update = (i: number, patch: Partial<CertificationItem>) => {
    const next = [...certs]
    next[i] = { ...next[i], ...patch }
    setCerts(next)
  }

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Loading certifications…
          </p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Certifications
          </h1>
          <p className="text-muted-foreground">
            Manage your professional credentials.
          </p>
        </div>
        <Button variant="admin" onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Certification
        </Button>
      </header>

      {certs.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Certification</TableHead>
                <TableHead>Issuer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Link</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certs.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Input
                      variant="admin"
                      type="number"
                      value={item.order}
                      onChange={(e) =>
                        update(i, { order: parseInt(e.target.value) || 0 })
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
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.issuer}
                      onChange={(e) => update(i, { issuer: e.target.value })}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.date}
                      onChange={(e) => update(i, { date: e.target.value })}
                      className="h-9 w-32"
                      placeholder="Month, Year"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.link ?? ""}
                      onChange={(e) => update(i, { link: e.target.value })}
                      className="h-9"
                      placeholder="https://..."
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No certifications found. Add your first one.
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/certifications")({
  component: AdminCertificationsComponent,
})
