import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteExperience, getExperience, updateExperience } from "@/lib/cms"
import { RiAddLine, RiDeleteBinLine, RiSaveLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface ExperienceItem {
  id?: number
  role: string
  company: string
  period: string
  description: string
  skills: string
  order: number
}

function AdminExperienceComponent() {
  const [experience, setExperience] = useState<Array<ExperienceItem>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getExperience()
      setExperience(data)
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async (item: ExperienceItem) => {
    try {
      await updateExperience({ data: item })
      const updated = await getExperience()
      setExperience(updated)
      toast.success("Experience saved!")
    } catch (error: any) {
      console.error("Experience save failed:", error)
      toast.error(error?.message || "Failed to save experience")
    }
  }

  const handleDelete = async (id?: number) => {
    try {
      if (id) {
        await deleteExperience({ data: id })
        const updated = await getExperience()
        setExperience(updated)
        toast.success("Experience entry removed.")
      } else {
        setExperience(experience.filter((e) => e.id !== undefined))
      }
    } catch (error: any) {
      console.error("Experience delete failed:", error)
      toast.error(error?.message || "Failed to remove experience")
    }
  }

  const handleAdd = () => {
    setExperience([
      {
        role: "New Role",
        company: "Company Name",
        period: "Year - Year",
        description: "Description...",
        skills: "Skill 1, Skill 2",
        order: experience.length,
      },
      ...experience,
    ])
  }

  const update = (i: number, patch: Partial<ExperienceItem>) => {
    const next = [...experience]
    next[i] = { ...next[i], ...patch }
    setExperience(next)
  }

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading experience…</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground">
            Manage your professional timeline.
          </p>
        </div>
        <Button variant="admin" onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Position
        </Button>
      </header>

      {experience.length > 0 ? (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {experience.map((item, i) => (
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
                      value={item.role}
                      onChange={(e) => update(i, { role: e.target.value })}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.company}
                      onChange={(e) => update(i, { company: e.target.value })}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.period}
                      onChange={(e) => update(i, { period: e.target.value })}
                      className="h-9 w-36"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      variant="admin"
                      value={item.skills}
                      onChange={(e) => update(i, { skills: e.target.value })}
                      className="h-9"
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      variant="admin"
                      value={item.description}
                      onChange={(e) =>
                        update(i, { description: e.target.value })
                      }
                      className="min-h-[60px] text-sm"
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
          No experience entries found. Add your first position.
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/experience")({
  component: AdminExperienceComponent,
})
