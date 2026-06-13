import { AppDialog } from "@/components/app-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getQueryClient,
  statsQuery,
  useDeleteStat,
  useUpdateStat,
} from "@/lib/queries"
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface StatItem {
  id?: string
  value: string
  label: string
  order: number
}

const emptyStat: StatItem = { value: "", label: "", order: 0 }

function AdminStatsComponent() {
  const { data: rawStats = [] } = useSuspenseQuery(statsQuery)
  const stats = rawStats as unknown as Array<StatItem>
  const deleteMutation = useDeleteStat()
  const updateMutation = useUpdateStat()

  // ─── Add / Edit modal ─────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StatItem | null>(null)
  const [form, setForm] = useState<StatItem>(emptyStat)

  function openAdd() {
    setEditing(null)
    setForm({ value: "", label: "", order: stats.length })
    setFormOpen(true)
  }

  function openEdit(item: StatItem) {
    setEditing(item)
    setForm({ ...item })
    setFormOpen(true)
  }

  async function handleSave() {
    if (!form.label.trim() || !form.value.trim()) {
      toast.error("Value and label are required.")
      return
    }
    try {
      await updateMutation.mutateAsync({
        ...(editing?.id ? { id: editing.id } : {}),
        value: form.value,
        label: form.label,
        order: editing?.id ? editing.order : form.order,
      })
      toast.success(editing?.id ? "Stat updated." : "Stat added.")
      setFormOpen(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to save stat")
    }
  }

  // ─── Delete confirmation ──────────────────────────────────────
  const [deleting, setDeleting] = useState<StatItem | null>(null)

  async function handleDelete() {
    if (!deleting?.id) return
    try {
      await deleteMutation.mutateAsync(deleting.id)
      toast.success("Stat deleted.")
      setDeleting(null)
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete")
    }
  }

  const sorted = [...stats].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <Card variant="admin" className="space-y-4 p-6">
      {/* ─── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Stats</h1>
          <p className="text-muted-foreground">
            Key numbers shown in the profile section.
          </p>
        </div>
        <Button variant="admin" className="gap-2" onClick={openAdd}>
          <RiAddLine size={18} />
          Add Stat
        </Button>
      </div>

      {/* ─── Table ─────────────────────────────────────────────── */}
      {sorted.length > 0 ? (
        <div className="rounded-lg border border-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-16 px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Order
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Value
                </th>
                <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Label
                </th>
                <th className="w-32 px-4 py-3 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item) => (
                <tr
                  key={item.id ?? `tmp-${Math.random()}`}
                  className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {item.order ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-display text-lg font-bold text-primary">
                      {item.value}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {item.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Edit"
                        onClick={() => openEdit(item)}
                      >
                        <RiPencilLine size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setDeleting(item)}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <RiDeleteBinLine size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Badge variant="admin" className="mb-3">
            0 items
          </Badge>
          <p className="text-sm text-muted-foreground">No stats yet.</p>
          <Button variant="admin" className="mt-4 gap-2" onClick={openAdd}>
            <RiAddLine size={16} />
            Add Stat
          </Button>
        </div>
      )}

      {/* ─── Add / Edit Dialog ─────────────────────────────────── */}
      <AppDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing?.id ? "Edit Stat" : "Add Stat"}
        description={
          editing?.id
            ? "Update the value and label for this stat."
            : "Add a new stat to display on your profile."
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label variant="admin">Value</Label>
            <Input
              variant="admin"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. 2K+, 150+, 99.9%"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Label</Label>
            <Input
              variant="admin"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Threats Triaged"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="admin"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending
                ? "Saving…"
                : editing?.id
                  ? "Update"
                  : "Add"}
            </Button>
          </div>
        </div>
      </AppDialog>

      {/* ─── Delete Confirmation Dialog ─────────────────────────── */}
      <AppDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null)
        }}
        title="Delete Stat"
        description="This action cannot be undone."
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete <strong>{deleting?.label}</strong>?
        </p>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </AppDialog>
    </Card>
  )
}

export const Route = createFileRoute("/admin/stats")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(statsQuery)
  },
  component: AdminStatsComponent,
})
