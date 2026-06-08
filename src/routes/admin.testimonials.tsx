import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteTestimonial,
  getTestimonials,
  updateTestimonial,
} from "@/lib/cms"
import { RiAddLine, RiDeleteBinLine, RiSaveLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface TestimonialItem {
  id?: number
  name: string
  role: string
  content: string
  image?: string | null
  order: number
}

function AdminTestimonialsComponent() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getTestimonials()
      setTestimonials(data as TestimonialItem[])
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSave = async (item: TestimonialItem) => {
    try {
      await updateTestimonial({ data: item })
      const updated = await getTestimonials()
      setTestimonials(updated as TestimonialItem[])
      toast.success("Testimonial saved!")
    } catch (error: any) {
      console.error("Testimonial save failed:", error)
      toast.error(error?.message || "Failed to save testimonial")
    }
  }

  const handleDelete = async (id?: number) => {
    try {
      if (id) {
        await deleteTestimonial({ data: id })
        const updated = await getTestimonials()
        setTestimonials(updated as TestimonialItem[])
        toast.success("Testimonial removed.")
      } else {
        setTestimonials(testimonials.filter((t) => t.id !== undefined))
      }
    } catch (error: any) {
      console.error("Testimonial delete failed:", error)
      toast.error(error?.message || "Failed to remove testimonial")
    }
  }

  const handleAdd = () => {
    setTestimonials([
      {
        name: "Client Name",
        role: "Position, Company",
        content: "Kind words...",
        order: testimonials.length,
      },
      ...testimonials,
    ])
  }

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading testimonials…</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Testimonials
          </h1>
          <p className="text-muted-foreground">
            Manage client feedback and reviews.
          </p>
        </div>
        <Button variant="admin" onClick={handleAdd} className="gap-2">
          <RiAddLine size={20} />
          Add Testimonial
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {testimonials.length > 0 ? (
          testimonials.map((item, i) => (
            <Card key={i} variant="admin" className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label variant="admin">Client Name</Label>
                    <Input
                      variant="admin"
                      value={item.name}
                      onChange={(e) => {
                        const next = [...testimonials]
                        next[i].name = e.target.value
                        setTestimonials(next)
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label variant="admin">Position / Role</Label>
                      <Input
                        variant="admin"
                        value={item.role}
                        onChange={(e) => {
                          const next = [...testimonials]
                          next[i].role = e.target.value
                          setTestimonials(next)
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label variant="admin">Order</Label>
                      <Input
                        variant="admin"
                        type="number"
                        value={item.order}
                        onChange={(e) => {
                          const next = [...testimonials]
                          next[i].order = parseInt(e.target.value) || 0
                          setTestimonials(next)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label variant="admin">Content</Label>
                  <Textarea
                    variant="admin"
                    rows={4}
                    value={item.content}
                    onChange={(e) => {
                      const next = [...testimonials]
                      next[i].content = e.target.value
                      setTestimonials(next)
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
                <Button
                  variant="admin"
                  onClick={() => handleSave(item)}
                  className="gap-2 px-8"
                >
                  <RiSaveLine size={20} />
                  Save Testimonial
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No testimonials found. Add your first one.
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/admin/testimonials")({
  component: AdminTestimonialsComponent,
})
