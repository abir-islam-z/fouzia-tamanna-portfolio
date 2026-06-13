import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  landingSectionsQuery,
  useReorderLandingSections,
  useUpdateLandingSection,
} from "@/lib/queries"
import { cn } from "@/lib/utils"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiDragMove2Line,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface LandingSection {
  id: string
  label: string
  enabled: boolean
  order: number
  badge: string | null
  heading: string | null
  subtext: string | null
  ctaLabel: string | null
  ctaHref: string | null
}

export function SectionsTab() {
  const { data: rawSections = [] } = useSuspenseQuery(landingSectionsQuery)
  const sectionMutation = useUpdateLandingSection()
  const reorderMutation = useReorderLandingSections()
  const sections = rawSections as unknown as Array<LandingSection>

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    const newOrder = arrayMove(sections, oldIndex, newIndex)
    try {
      await reorderMutation.mutateAsync(newOrder.map((s) => s.id))
    } catch (err: any) {
      toast.error(err?.message || "Failed to reorder")
    }
  }

  const updateSection = async (s: LandingSection) => {
    try {
      await sectionMutation.mutateAsync({
        id: s.id,
        label: s.label,
        enabled: s.enabled,
        order: s.order,
        badge: s.badge,
        heading: s.heading,
        subtext: s.subtext,
        ctaLabel: s.ctaLabel,
        ctaHref: s.ctaHref,
      })
      toast.success(`"${s.label}" updated.`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update section")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Landing Page Sections</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag to reorder. Toggle to hide/show. Edit text overrides for the
          heading area of each section.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {sections.map((s) => (
              <SortableSectionRow
                key={s.id}
                section={s}
                onSave={updateSection}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableSectionRow({
  section,
  onSave,
}: {
  section: LandingSection
  onSave: (s: LandingSection) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(section)

  useEffect(() => {
    setDraft(section)
  }, [section])

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-border bg-card",
        isDragging && "z-10 opacity-90 shadow-lg ring-2 ring-primary/40"
      )}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          type="button"
          className="cursor-grab text-muted-foreground transition-colors hover:text-primary active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <RiDragMove2Line size={18} />
        </button>
        <div className="flex-1">
          <p className="font-medium text-foreground">{section.label}</p>
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            /{section.id}
          </p>
        </div>
        <Switch
          checked={section.enabled}
          onCheckedChange={async (v) => {
            await onSave({ ...section, enabled: v })
          }}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setOpen((o) => !o)}
          title="Edit text"
        >
          {open ? <RiArrowUpSLine size={16} /> : <RiArrowDownSLine size={16} />}
        </Button>
      </div>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label variant="admin" className="text-xs">
                Badge (e.g. // PROJECTS.MKD)
              </Label>
              <Input
                variant="admin"
                value={draft.badge ?? ""}
                onChange={(e) => setDraft({ ...draft, badge: e.target.value })}
                placeholder="// PROJECTS.MKD"
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin" className="text-xs">
                Heading
              </Label>
              <Input
                variant="admin"
                value={draft.heading ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, heading: e.target.value })
                }
                placeholder="Section heading"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label variant="admin" className="text-xs">
                Subtext
              </Label>
              <Textarea
                variant="admin"
                rows={2}
                value={draft.subtext ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, subtext: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin" className="text-xs">
                CTA Label
              </Label>
              <Input
                variant="admin"
                value={draft.ctaLabel ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, ctaLabel: e.target.value })
                }
                placeholder="View Case Study"
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin" className="text-xs">
                CTA Href
              </Label>
              <Input
                variant="admin"
                value={draft.ctaHref ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, ctaHref: e.target.value })
                }
                placeholder="#projects"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="admin"
              onClick={() => onSave(draft)}
              disabled={
                draft.badge === section.badge &&
                draft.heading === section.heading &&
                draft.subtext === section.subtext &&
                draft.ctaLabel === section.ctaLabel &&
                draft.ctaHref === section.ctaHref
              }
            >
              Save Section Text
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
