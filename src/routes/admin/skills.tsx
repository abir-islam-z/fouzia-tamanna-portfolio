import { AppDialog } from "@/components/app-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  getQueryClient,
  skillsQuery,
  useDeleteSkill,
  useUpdateSkill,
} from "@/lib/queries"
import { RiAddLine, RiDeleteBinLine, RiPencilLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface SkillItem {
  id?: string
  name: string
  category: string
  level: string | null
  order: number
}

const LEVELS = ["Expert", "Advanced", "Intermediate", "Beginner"]

const emptySkill: SkillItem = {
  name: "",
  category: "",
  level: "Intermediate",
  order: 0,
}

function AdminSkillsComponent() {
  const { data: rawSkills = [] } = useSuspenseQuery(skillsQuery)
  const skills = rawSkills as unknown as Array<SkillItem>
  const deleteMutation = useDeleteSkill()
  const updateMutation = useUpdateSkill()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SkillItem | null>(null)
  const [form, setForm] = useState<SkillItem>(emptySkill)

  function openAdd() {
    setEditing(null)
    setForm({ ...emptySkill, order: skills.length })
    setFormOpen(true)
  }

  function openEdit(item: SkillItem) {
    setEditing(item)
    setForm({ ...item })
    setFormOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category.trim()) {
      toast.error("Name and category are required.")
      return
    }
    try {
      await updateMutation.mutateAsync({
        ...(editing?.id ? { id: editing.id } : {}),
        name: form.name,
        category: form.category,
        level: form.level || undefined,
        order: form.order,
      })
      toast.success(editing?.id ? "Skill updated!" : "Skill added!")
      setFormOpen(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to save skill")
    }
  }

  async function handleDelete(item: SkillItem) {
    if (!item.id) return
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return
    try {
      await deleteMutation.mutateAsync(item.id)
      toast.success("Skill deleted.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete skill")
    }
  }

  // Group skills by category for display
  const grouped = skills.reduce<Record<string, SkillItem[]>>((acc, skill) => {
    const cat = skill.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill)
    return acc
  }, {})

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground">
            Manage technical skills, tools, and competencies.
          </p>
        </div>
        <Button variant="admin" className="gap-2" onClick={openAdd}>
          <RiAddLine size={18} />
          Add Skill
        </Button>
      </header>

      {skills.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                ▸ {category}
              </h3>
              <div className="rounded-lg border border-border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Order
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Level
                      </th>
                      <th className="w-32 px-4 py-3 text-right font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id ?? `tmp-${Math.random()}`}
                        className="border-b border-border/60 transition-colors last:border-b-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {item.order}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground">
                            {item.name}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {item.level && (
                            <Badge variant="admin" className="capitalize">
                              {item.level}
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => openEdit(item)}
                            >
                              <RiPencilLine size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(item)}
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
            </div>
          ))}
        </div>
      ) : (
        <Card variant="admin" className="p-12 text-center">
          <p className="text-muted-foreground">
            No skills yet. Add your first skill.
          </p>
        </Card>
      )}

      <AppDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing?.id ? "Edit Skill" : "Add Skill"}
        description={
          editing?.id ? "Update this skill." : "Add a new technical skill."
        }
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label variant="admin">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              variant="admin"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. SIEM, Python, Nmap"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">
              Category <span className="text-destructive">*</span>
            </Label>
            <Input
              variant="admin"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Security Tools, Programming, Networks"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Level</Label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level) => (
                <Button
                  key={level}
                  variant={form.level === level ? "admin" : "outline"}
                  size="sm"
                  onClick={() => setForm({ ...form, level })}
                  className="capitalize"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">Order</Label>
            <Input
              variant="admin"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) })
              }
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
    </div>
  )
}

export const Route = createFileRoute("/admin/skills")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(skillsQuery)
  },
  component: AdminSkillsComponent,
})
