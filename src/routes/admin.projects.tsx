import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  projectsQuery,
  useDeleteProject,
  useUpdateProject,
} from "@/lib/queries"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiSaveLine,
  RiStarFill,
  RiStarLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

interface ProjectItem {
  id?: number
  title: string
  description: string
  image: string
  tags: string
  isFeatured: boolean
  link?: string | null
  github?: string | null
  order: number
}

function AdminProjectsComponent() {
  const { data: rawProjects = [] } = useSuspenseQuery(projectsQuery)
  const projects = rawProjects as unknown as Array<ProjectItem>

  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  const [localProjects, setLocalProjects] = useState<Array<ProjectItem> | null>(
    null
  )
  const displayItems = localProjects ?? projects

  const handleSave = async (item: ProjectItem) => {
    try {
      await updateMutation.mutateAsync(item)
      setLocalProjects(null)
      toast.success(`Project "${item.title}" saved!`)
    } catch (error: any) {
      console.error("Project save failed:", error)
      toast.error(error?.message || "Failed to save project")
    }
  }

  const handleDelete = async (id?: number) => {
    try {
      if (id) {
        await deleteMutation.mutateAsync(id)
        setLocalProjects(null)
        toast.success("Project deleted.")
      }
    } catch (error: any) {
      console.error("Project delete failed:", error)
      toast.error(error?.message || "Failed to delete project")
    }
  }

  const handleAdd = () => {
    const newItem: ProjectItem = {
      title: "New Project",
      description: "Brief summary...",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
      tags: "React, AI",
      isFeatured: false,
      order: displayItems.length,
    }
    setLocalProjects([newItem, ...displayItems])
  }

  const update = (i: number, patch: Partial<ProjectItem>) => {
    const next = [...displayItems]
    next[i] = { ...next[i], ...patch }
    setLocalProjects(next)
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your portfolio showcase.
          </p>
        </div>
        <Button variant="admin" onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Project
        </Button>
      </header>

      {displayItems.length > 0 ? (
        <div className="space-y-6">
          {displayItems.map((item, i) => (
            <div
              key={item.id ?? `new-${i}`}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className={
                    item.isFeatured
                      ? "h-8 w-8 text-yellow-500"
                      : "h-8 w-8 text-muted-foreground"
                  }
                  onClick={() => update(i, { isFeatured: !item.isFeatured })}
                  title={item.isFeatured ? "Unfeature" : "Feature"}
                >
                  {item.isFeatured ? (
                    <RiStarFill size={18} />
                  ) : (
                    <RiStarLine size={18} />
                  )}
                </Button>
                <div className="flex-1">
                  <Input
                    variant="admin"
                    value={item.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    className="h-9 font-semibold"
                    placeholder="Project title"
                  />
                </div>
                <Input
                  variant="admin"
                  type="number"
                  value={item.order}
                  onChange={(e) =>
                    update(i, { order: parseInt(e.target.value) || 0 })
                  }
                  className="h-9 w-16"
                  title="Order"
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-36">Image</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Live Link</TableHead>
                    <TableHead>GitHub</TableHead>
                    <TableHead className="w-28 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {item.image ? (
                        <img
                          src={item.image}
                          alt="Preview"
                          className="h-14 w-24 rounded border border-border object-cover"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No image
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.tags}
                        onChange={(e) => update(i, { tags: e.target.value })}
                        className="h-9"
                        placeholder="React, AI"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.link || ""}
                        onChange={(e) => update(i, { link: e.target.value })}
                        className="h-9"
                        placeholder="https://..."
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        variant="admin"
                        value={item.github || ""}
                        onChange={(e) => update(i, { github: e.target.value })}
                        className="h-9"
                        placeholder="https://github.com/..."
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id)}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Delete"
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

              <div className="mt-3 space-y-2">
                <Label variant="admin" className="text-xs">
                  Image URL
                </Label>
                <Input
                  variant="admin"
                  value={item.image}
                  onChange={(e) => update(i, { image: e.target.value })}
                  className="h-9"
                  placeholder="https://images.unsplash.com/..."
                />
                <Label variant="admin" className="text-xs">
                  Description
                </Label>
                <Textarea
                  variant="admin"
                  rows={3}
                  value={item.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          No projects found. Add your first project.
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/projects")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(projectsQuery)
  },
  component: AdminProjectsComponent,
})
