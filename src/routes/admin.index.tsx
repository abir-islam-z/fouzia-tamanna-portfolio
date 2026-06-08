import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { finalizeMediaUploadFn, getPresignedUpload } from "@/lib/cms"
import {
  footerQuery,
  getQueryClient,
  heroQuery,
  r2StatusQuery,
  statsQuery,
  useDeleteStat,
  useUpdateFooter,
  useUpdateHero,
  useUpdateStat,
} from "@/lib/queries"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiImageLine,
  RiLoader4Line,
  RiSaveLine,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { useRef, useState } from "react"
import { toast } from "sonner"

interface FooterData {
  id?: string
  bio: string
  email: string
  linkedin: string
  github: string
  twitter: string
  availability: string
}

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

interface StatItem {
  id?: number
  value: string
  label: string
  order: number
}

function AdminIndexComponent() {
  const { data: rawHero } = useSuspenseQuery(heroQuery)
  const { data: stats = [] } = useSuspenseQuery(statsQuery)
  const { data: rawFooter } = useSuspenseQuery(footerQuery)
  const { data: r2Status } = useSuspenseQuery(r2StatusQuery)

  const heroMutation = useUpdateHero()
  const footerMutation = useUpdateFooter()
  const statMutation = useUpdateStat()
  const deleteStatMutation = useDeleteStat()

  const hero = {
    id: (rawHero as any)?.id || "singleton",
    title: (rawHero as any)?.title || "Fouzia Tamanna",
    subtitle: (rawHero as any)?.subtitle || "",
    description: (rawHero as any)?.description || "",
    introBadge: (rawHero as any)?.introBadge || "OPEN TO WORK — SOC ANALYST",
    location: (rawHero as any)?.location || "London, UK",
    sponsorshipInfo:
      (rawHero as any)?.sponsorshipInfo || "No sponsorship needed",
    resumeUrl: (rawHero as any)?.resumeUrl || "#",
    openToWork: (rawHero as any)?.openToWork ?? true,
    logoUrl: (rawHero as any)?.logoUrl ?? null,
    logoKey: (rawHero as any)?.logoKey ?? null,
  }

  const [heroState, setHeroState] = useState<HeroData>(hero)
  const [footerState, setFooterState] = useState<FooterData>({
    bio: (rawFooter as any)?.bio || "",
    email: (rawFooter as any)?.email || "",
    linkedin: (rawFooter as any)?.linkedin || "",
    github: (rawFooter as any)?.github || "",
    twitter: (rawFooter as any)?.twitter || "",
    availability: (rawFooter as any)?.availability || "",
  })

  const [logoUploading, setLogoUploading] = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)
  const r2Ok = r2Status?.ok ?? false
  const logoInputRef = useRef<HTMLInputElement>(null)

  const handleSaveHero = async () => {
    try {
      await heroMutation.mutateAsync(heroState)
      toast.success("Hero updated successfully!")
    } catch (err: unknown) {
      console.error("Hero update failed:", err)
      if (err instanceof Error) {
        toast.error(err.message || "Failed to update Hero section")
      }
    }
  }

  const handleSaveFooter = async () => {
    try {
      await footerMutation.mutateAsync(footerState)
      toast.success("Footer updated successfully!")
    } catch (err: unknown) {
      console.error("Footer update failed:", err)
      if (err instanceof Error) {
        toast.error(
          err.message || "Failed to update Footer (Check if email is valid)"
        )
      }
    }
  }

  const handleSaveStat = async (stat: StatItem) => {
    try {
      await statMutation.mutateAsync(stat)
      toast.success("Stat saved successfully!")
    } catch (err: unknown) {
      console.error("Stat save failed:", err)
      if (err instanceof Error) {
        toast.error(err.message || "Failed to save stat")
      }
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""

    const MAX_BYTES = 5 * 1024 * 1024
    if (file.size > MAX_BYTES) {
      toast.error(
        `Logo too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Max 5 MB.`
      )
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (PNG, JPG, SVG, WEBP).")
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
          else
            reject(
              new Error(
                `Upload failed: ${xhr.status} ${xhr.statusText || "R2 rejected the request"}`
              )
            )
        }
        xhr.onerror = () =>
          reject(
            new Error(
              "Network error — usually a CORS misconfiguration on the R2 bucket."
            )
          )
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
      toast.success("Logo uploaded — don't forget to click Save Changes.")
    } catch (err: any) {
      console.error("Logo upload failed:", err)
      toast.error(err?.message || "Logo upload failed")
    } finally {
      setLogoUploading(false)
      setLogoProgress(0)
    }
  }

  async function handleRemoveLogo() {
    if (!heroState.logoKey && !heroState.logoUrl) return
    setHeroState((prev) => ({ ...prev, logoUrl: null, logoKey: null }))
    toast.success(
      "Logo removed — click Save Changes to persist. The 'Fouzia Tamanna' text logo will reappear."
    )
  }

  const handleDeleteStat = async (id?: number) => {
    if (id) {
      try {
        await deleteStatMutation.mutateAsync(id)
        toast.success("Stat deleted.")
      } catch (err: unknown) {
        console.error("Stat delete failed:", err)
        if (err instanceof Error)
          toast.error(err.message || "Failed to delete stat")
      }
    }
  }

  return (
    <div className="space-y-12">
      <header>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Manage your hero section and key stats.
        </p>
      </header>

      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Hero Section</h2>
          <Button variant="admin" onClick={handleSaveHero} className="gap-2">
            <RiSaveLine size={18} />
            Save Changes
          </Button>
        </div>

        <Card variant="admin" className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
              <div className="space-y-0.5">
                <Label variant="admin">Open to Work</Label>
                <p className="text-xs text-muted-foreground">
                  Show availability badge on landing page
                </p>
              </div>
              <Switch
                checked={heroState.openToWork}
                onCheckedChange={(val) =>
                  setHeroState({ ...heroState, openToWork: val })
                }
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4 md:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <Label variant="admin">Brand Logo</Label>
                  <p className="text-xs text-muted-foreground">
                    Upload a logo to replace the &quot;Fouzia Tamanna&quot; text
                    in the navbar. Leave empty to keep the text.
                  </p>
                </div>
                {!r2Ok && (
                  <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">
                    R2 Not Configured
                  </span>
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
                    <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                      <RiImageLine size={20} />
                      <span className="text-xs text-muted-foreground">
                        No logo
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <div className="flex gap-2">
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
                        onClick={handleRemoveLogo}
                        className="text-destructive"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {[
              { key: "title" as const, label: "Full Name", colSpan: false },
              { key: "subtitle" as const, label: "Subtitle", colSpan: false },
              {
                key: "introBadge" as const,
                label: "Intro Badge",
                colSpan: true,
              },
              { key: "location" as const, label: "Location", colSpan: false },
              {
                key: "sponsorshipInfo" as const,
                label: "Sponsorship",
                colSpan: false,
              },
              { key: "resumeUrl" as const, label: "Resume URL", colSpan: true },
            ].map(({ key, label, colSpan }) => (
              <div
                key={key}
                className={`space-y-1.5 ${colSpan ? "md:col-span-2" : ""}`}
              >
                <Label variant="admin">{label}</Label>
                <Input
                  variant="admin"
                  value={heroState[key] ?? ""}
                  onChange={(e) =>
                    setHeroState({ ...heroState, [key]: e.target.value })
                  }
                  className="h-9"
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
                className="text-sm"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Stats</h2>
          <Button
            variant="admin"
            onClick={() => {
              statMutation.mutateAsync({
                value: "0",
                label: "New Stat",
                order: (stats as unknown as Array<StatItem>).length,
              })
            }}
            className="gap-2"
          >
            <RiAddLine size={18} />
            Add Stat
          </Button>
        </div>

        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Order</TableHead>
                <TableHead className="w-32">Value</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(stats as unknown as Array<StatItem>).map((stat) => (
                <StatRow
                  key={stat.id}
                  stat={stat}
                  onSave={handleSaveStat}
                  onDelete={handleDeleteStat}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Footer Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Footer</h2>
          <Button variant="admin" onClick={handleSaveFooter} className="gap-2">
            <RiSaveLine size={18} />
            Save Footer
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
              className="text-sm"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                key: "email" as const,
                label: "Email",
                placeholder: "hello@example.com",
              },
              {
                key: "linkedin" as const,
                label: "LinkedIn",
                placeholder: "https://linkedin.com/in/...",
              },
              {
                key: "github" as const,
                label: "GitHub",
                placeholder: "https://github.com/...",
              },
              {
                key: "twitter" as const,
                label: "Twitter/X",
                placeholder: "https://x.com/...",
              },
              {
                key: "availability" as const,
                label: "Availability Text",
                placeholder: "Open for...",
              },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <Label variant="admin">{label}</Label>
                <Input
                  variant="admin"
                  value={footerState[key] ?? ""}
                  onChange={(e) =>
                    setFooterState({ ...footerState, [key]: e.target.value })
                  }
                  className="h-9"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}

// StatRow extracted so each row has its own local editing state
function StatRow({
  stat,
  onSave,
  onDelete,
}: {
  stat: StatItem
  onSave: (s: StatItem) => void
  onDelete: (id?: number) => void
}) {
  const [local, setLocal] = useState(stat)

  return (
    <TableRow>
      <TableCell>
        <Input
          variant="admin"
          type="number"
          value={local.order}
          onChange={(e) =>
            setLocal({ ...local, order: parseInt(e.target.value) || 0 })
          }
          className="h-9 w-16"
        />
      </TableCell>
      <TableCell>
        <Input
          variant="admin"
          value={local.value}
          onChange={(e) => setLocal({ ...local, value: e.target.value })}
          className="h-9"
        />
      </TableCell>
      <TableCell>
        <Input
          variant="admin"
          value={local.label}
          onChange={(e) => setLocal({ ...local, label: e.target.value })}
          className="h-9"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(local.id)}
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <RiDeleteBinLine size={16} />
          </Button>
          <Button
            variant="admin"
            size="icon"
            onClick={() => onSave(local)}
            className="h-8 w-8"
            title="Save"
          >
            <RiSaveLine size={16} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export const Route = createFileRoute("/admin/")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await Promise.all([
      queryClient.ensureQueryData(heroQuery),
      queryClient.ensureQueryData(statsQuery),
      queryClient.ensureQueryData(footerQuery),
      queryClient.ensureQueryData(r2StatusQuery),
    ])
  },
  component: AdminIndexComponent,
})
