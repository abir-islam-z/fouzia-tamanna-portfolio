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
  certificationsQuery,
  getQueryClient,
  useDeleteCertification,
  useUpdateCertification,
} from "@/lib/queries"
import { RiAddLine, RiDeleteBinLine, RiSaveLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
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
  const { data: rawCerts = [] } = useSuspenseQuery(certificationsQuery)
  const certs = rawCerts as unknown as Array<CertificationItem>

  const updateMutation = useUpdateCertification()
  const deleteMutation = useDeleteCertification()

  const [localCerts, setLocalCerts] = useState<Array<CertificationItem> | null>(
    null
  )
  const displayItems = localCerts ?? certs

  const handleSave = async (item: CertificationItem) => {
    try {
      await updateMutation.mutateAsync(item)
      setLocalCerts(null)
      toast.success("Certification saved!")
    } catch (error: any) {
      console.error("Certification save failed:", error)
      toast.error(error?.message || "Failed to save certification")
    }
  }

  const handleDelete = async (id?: number) => {
    try {
      if (id) {
        await deleteMutation.mutateAsync(id)
        setLocalCerts(null)
        toast.success("Certification removed.")
      }
    } catch (error: any) {
      console.error("Certification delete failed:", error)
      toast.error(error?.message || "Failed to remove certification")
    }
  }

  const handleAdd = () => {
    const newItem: CertificationItem = {
      title: "New Certification",
      issuer: "Issuing Organization",
      date: "Month, Year",
      order: displayItems.length,
    }
    setLocalCerts([newItem, ...displayItems])
  }

  const update = (i: number, patch: Partial<CertificationItem>) => {
    const next = [...displayItems]
    next[i] = { ...next[i], ...patch }
    setLocalCerts(next)
  }

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

      {displayItems.length > 0 ? (
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
              {displayItems.map((item, i) => (
                <TableRow key={item.id ?? `new-${i}`}>
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
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(certificationsQuery)
  },
  component: AdminCertificationsComponent,
})
