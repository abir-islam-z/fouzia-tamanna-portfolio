import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { finalizeMediaUploadFn, getPresignedUpload } from "@/lib/cms"
import {
  footerQuery,
  getQueryClient,
  heroQuery,
  landingSectionsQuery,
  r2StatusQuery,
  siteSettingsQuery,
  useReorderLandingSections,
  useUpdateFooter,
  useUpdateHero,
  useUpdateLandingSection,
  useUpdateSiteSettings,
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
  RiLoader4Line,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

interface HeroData {
  id: string
  title: string
  subtitle?: string
  description: string
  introBadge: string
  location: string
  sponsorshipInfo: string
  resumeUrl: string
  openToWork: boolean
  logoUrl?: string | null
  logoKey?: string | null
}

interface FooterData {
  id?: string
  bio: string
  email: string
  linkedin: string
  github: string
  twitter: string
  availability: string
}

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

interface SiteSettings {
  heroHeadline: string | null
  heroCtaPrimary: string | null
  heroCtaSecondary: string | null
  contactHeading: string | null
  contactSubtext: string | null
  marqueeItems: string | null
  navbarBrand: string | null
}

function AdminSettingsComponent() {
  const { data: rawHero } = useSuspenseQuery(heroQuery)
  const { data: rawFooter } = useSuspenseQuery(footerQuery)
  const { data: rawSections = [] } = useSuspenseQuery(landingSectionsQuery)
  const { data: rawSettings } = useSuspenseQuery(siteSettingsQuery)
  const { data: r2Status } = useSuspenseQuery(r2StatusQuery)

  const heroMutation = useUpdateHero()
  const footerMutation = useUpdateFooter()
  const sectionMutation = useUpdateLandingSection()
  const reorderMutation = useReorderLandingSections()
  const settingsMutation = useUpdateSiteSettings()

  const hero = rawHero as unknown as HeroData
  const footer = rawFooter as unknown as FooterData
  const sections = rawSections as unknown as Array<LandingSection>
  const settings = rawSettings as unknown as SiteSettings
  const r2Ok = (r2Status as { ok: boolean } | undefined)?.ok ?? false

  // Hero local state
  const [heroState, setHeroState] = useState<HeroData>(hero)
  useEffect(() => {
    setHeroState(hero)
  }, [hero])

  // Footer local state
  const [footerState, setFooterState] = useState<FooterData>(footer)
  useEffect(() => {
    setFooterState(footer)
  }, [footer])

  // Site settings local state
  const [siteState, setSiteState] = useState<SiteSettings>(settings)
  useEffect(() => {
    setSiteState(settings)
  }, [settings])

  // Logo upload
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)
  const logoInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo too large. Max 5 MB.")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.")
      return
    }
    setLogoUploading(true)
    setLogoProgress(0)
    try {
      const { key, uploadUrl, publicUrl } = await getPresignedUpload({
        data: {
          fileName: file.name,
          mimeType: file.type,
          folder: "branding",
        },
      })

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", uploadUrl, true)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.upload.onprogress = (ev) => {
          if (!ev.lengthComputable) return
          setLogoProgress(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.ontimeout = () => reject(new Error("Upload timed out"))
        xhr.send(file)
      })

      await finalizeMediaUploadFn({
        data: {
          key,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          folder: "branding",
          alt: "Brand logo",
        },
      })

      setHeroState((prev) => ({ ...prev, logoUrl: publicUrl, logoKey: key }))
      toast.success("Logo uploaded — click Save Hero to persist.")
    } catch (err: any) {
      toast.error(err?.message || "Logo upload failed")
    } finally {
      setLogoUploading(false)
      setLogoProgress(0)
    }
  }

  function removeLogo() {
    setHeroState((prev) => ({ ...prev, logoUrl: null, logoKey: null }))
  }

  const saveHero = async () => {
    try {
      await heroMutation.mutateAsync(heroState)
      toast.success("Hero section saved.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save hero")
    }
  }

  const saveFooter = async () => {
    try {
      await footerMutation.mutateAsync(footerState)
      toast.success("Footer saved.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save footer")
    }
  }

  const saveSiteSettings = async () => {
    try {
      await settingsMutation.mutateAsync(siteState)
      toast.success("Site settings saved.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings")
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

  // ─── Drag-and-drop section ordering ───────────────────────────
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

  return (
    <div className="space-y-10">
      <header>
        <div className="label-mono mb-3">// SETTINGS.SH</div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage the hero section, footer, landing page text, and section order.
        </p>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Hero Section</h2>
          <Button
            variant="admin"
            onClick={saveHero}
            disabled={heroMutation.isPending}
          >
            {heroMutation.isPending ? "Saving…" : "Save Hero"}
          </Button>
        </div>
        <Card variant="admin" className="space-y-6 p-6">
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div>
              <Label variant="admin">Open to Work</Label>
              <p className="text-xs text-muted-foreground">
                Show availability badge on the landing page
              </p>
            </div>
            <Switch
              checked={heroState.openToWork}
              onCheckedChange={(v) =>
                setHeroState({ ...heroState, openToWork: v })
              }
            />
          </div>

          {/* Logo */}
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start justify-between">
              <div>
                <Label variant="admin">Brand Logo</Label>
                <p className="text-xs text-muted-foreground">
                  Upload a logo to replace the &quot;Fouzia Tamanna&quot; text
                  in the navbar. Leave empty to keep text.
                </p>
              </div>
              {!r2Ok && (
                <Badge
                  variant="admin"
                  className="bg-amber-500/10 text-amber-600"
                >
                  R2 Not Configured
                </Badge>
              )}
            </div>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/30">
                {heroState.logoUrl ? (
                  <img
                    src={heroState.logoUrl}
                    alt="Current logo"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">No logo</span>
                )}
              </div>
              <div className="flex flex-1 gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
                <Button
                  variant="admin"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploading}
                  className="gap-2"
                >
                  {logoUploading ? (
                    <RiLoader4Line size={16} className="animate-spin" />
                  ) : (
                    <RiUploadCloud2Line size={16} />
                  )}
                  {logoUploading ? `${logoProgress}%` : "Upload Logo"}
                </Button>
                {heroState.logoUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeLogo}
                    className="text-destructive"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Hero fields */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              { key: "title", label: "Full Name" },
              { key: "subtitle", label: "Subtitle" },
              { key: "introBadge", label: "Intro Badge" },
              { key: "location", label: "Location" },
              { key: "sponsorshipInfo", label: "Sponsorship" },
              { key: "resumeUrl", label: "Resume URL" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className={cn(
                  "space-y-1.5",
                  key === "introBadge" || key === "resumeUrl"
                    ? "md:col-span-2"
                    : ""
                )}
              >
                <Label variant="admin">{label}</Label>
                <Input
                  variant="admin"
                  value={(heroState as any)[key] ?? ""}
                  onChange={(e) =>
                    setHeroState({ ...heroState, [key]: e.target.value })
                  }
                />
              </div>
            ))}
            <div className="space-y-1.5 md:col-span-2">
              <Label variant="admin">Description</Label>
              <Textarea
                variant="admin"
                rows={3}
                value={heroState.description}
                onChange={(e) =>
                  setHeroState({ ...heroState, description: e.target.value })
                }
              />
            </div>
          </div>
        </Card>
      </section>

      {/* ─── SITE SETTINGS ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Landing Page Text</h2>
          <Button
            variant="admin"
            onClick={saveSiteSettings}
            disabled={settingsMutation.isPending}
          >
            {settingsMutation.isPending ? "Saving…" : "Save Site Settings"}
          </Button>
        </div>
        <Card variant="admin" className="space-y-6 p-6">
          <p className="text-xs text-muted-foreground">
            These strings replace the previously hardcoded copy in the navbar,
            hero, contact section, and footer marquee.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label variant="admin">Navbar Brand</Label>
              <Input
                variant="admin"
                value={siteState.navbarBrand ?? ""}
                onChange={(e) =>
                  setSiteState({ ...siteState, navbarBrand: e.target.value })
                }
                placeholder="Fouzia Tamanna"
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin">Hero Headline Suffix</Label>
              <Input
                variant="admin"
                value={siteState.heroHeadline ?? ""}
                onChange={(e) =>
                  setSiteState({ ...siteState, heroHeadline: e.target.value })
                }
                placeholder="SOC Analyst"
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin">Hero CTA — Primary</Label>
              <Input
                variant="admin"
                value={siteState.heroCtaPrimary ?? ""}
                onChange={(e) =>
                  setSiteState({ ...siteState, heroCtaPrimary: e.target.value })
                }
                placeholder="Download CV"
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin">Hero CTA — Secondary</Label>
              <Input
                variant="admin"
                value={siteState.heroCtaSecondary ?? ""}
                onChange={(e) =>
                  setSiteState({
                    ...siteState,
                    heroCtaSecondary: e.target.value,
                  })
                }
                placeholder="View Research"
              />
            </div>
            <div className="space-y-1.5">
              <Label variant="admin">Contact Heading</Label>
              <Input
                variant="admin"
                value={siteState.contactHeading ?? ""}
                onChange={(e) =>
                  setSiteState({ ...siteState, contactHeading: e.target.value })
                }
                placeholder="Security Analyst who hunts?"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label variant="admin">Contact Subtext</Label>
              <Textarea
                variant="admin"
                rows={2}
                value={siteState.contactSubtext ?? ""}
                onChange={(e) =>
                  setSiteState({ ...siteState, contactSubtext: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label variant="admin">Footer Marquee Tokens</Label>
              <Input
                variant="admin"
                value={siteState.marqueeItems ?? ""}
                onChange={(e) =>
                  setSiteState({ ...siteState, marqueeItems: e.target.value })
                }
                placeholder="SOC ANALYST, LONDON UK, THREAT_HUNT, ZERO_TRUST, OPEN_TO_WORK"
              />
              <p className="text-[10px] text-muted-foreground">
                Comma-separated tokens shown in the footer marquee strip.
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Footer</h2>
          <Button
            variant="admin"
            onClick={saveFooter}
            disabled={footerMutation.isPending}
          >
            {footerMutation.isPending ? "Saving…" : "Save Footer"}
          </Button>
        </div>
        <Card variant="admin" className="space-y-6 p-6">
          <div className="space-y-1.5">
            <Label variant="admin">Bio</Label>
            <Textarea
              variant="admin"
              rows={3}
              value={footerState.bio}
              onChange={(e) =>
                setFooterState({ ...footerState, bio: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                key: "email",
                label: "Email",
                placeholder: "hello@example.com",
              },
              {
                key: "linkedin",
                label: "LinkedIn",
                placeholder: "https://linkedin.com/in/...",
              },
              {
                key: "github",
                label: "GitHub",
                placeholder: "https://github.com/...",
              },
              {
                key: "twitter",
                label: "Twitter/X",
                placeholder: "https://x.com/...",
              },
              {
                key: "availability",
                label: "Availability Text",
                placeholder: "Open for...",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label variant="admin">{label}</Label>
                <Input
                  variant="admin"
                  value={(footerState as any)[key] ?? ""}
                  onChange={(e) =>
                    setFooterState({ ...footerState, [key]: e.target.value })
                  }
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ─── LANDING SECTIONS (drag + drop) ────────────────────── */}
      <section className="space-y-4">
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
      </section>
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

export const Route = createFileRoute("/admin/settings")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await Promise.all([
      queryClient.ensureQueryData(heroQuery),
      queryClient.ensureQueryData(footerQuery),
      queryClient.ensureQueryData(landingSectionsQuery),
      queryClient.ensureQueryData(siteSettingsQuery),
      queryClient.ensureQueryData(r2StatusQuery),
    ])
  },
  component: AdminSettingsComponent,
})
