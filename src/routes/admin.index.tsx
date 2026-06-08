import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  deleteStat,
  finalizeMediaUploadFn,
  getFooter,
  getHero,
  getPresignedUpload,
  getR2Status,
  getStats,
  updateFooter,
  updateHero,
  updateStat,
} from "@/lib/cms"
import {
  RiAddLine,
  RiDeleteBinLine,
  RiImageLine,
  RiLoader4Line,
  RiSaveLine,
  RiUploadCloud2Line,
} from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
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
  const [hero, setHero] = useState<HeroData>({
    id: "singleton",
    title: "Fouzia Tamanna",
    subtitle: "MSc Computer Networks & Systems Security",
    description:
      "Network Security & SOC Analyst specializing in threat detection, incident response, and systems security.",
    introBadge: "OPEN TO WORK — SOC ANALYST",
    location: "London, UK",
    sponsorshipInfo: "No sponsorship needed",
    resumeUrl: "#",
    openToWork: true,
    logoUrl: null,
    logoKey: null,
  })
  const [stats, setStats] = useState<Array<StatItem>>([])
  const [footer, setFooter] = useState<FooterData>({
    bio: "",
    email: "",
    linkedin: "",
    github: "",
    twitter: "",
    availability: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoProgress, setLogoProgress] = useState(0)
  const [r2Ok, setR2Ok] = useState<boolean | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      setError(null)
      try {
        const h = await getHero()
        setHero({
          id: h.id,
          title: h.title || "Fouzia Tamanna",
          subtitle: h.subtitle || "",
          description: h.description || "",
          introBadge: h.introBadge || "OPEN TO WORK — SOC ANALYST",
          location: h.location || "London, UK",
          sponsorshipInfo: h.sponsorshipInfo || "No sponsorship needed",
          resumeUrl: h.resumeUrl || "#",
          openToWork: h.openToWork ?? true,
          logoUrl: h.logoUrl ?? null,
          logoKey: h.logoKey ?? null,
        })

        const s = await getStats()
        setStats(s)

        const f = await getFooter()
        setFooter(f)

        // Check R2 status for logo upload capability
        try {
          const status = await getR2Status()
          setR2Ok(status.ok)
        } catch {
          setR2Ok(false)
        }
      } catch (err: any) {
        console.error("Dashboard load error:", err)
        setError(
          err?.message ||
            "Failed to load dashboard data. Please check your connection."
        )
        toast.error("Error loading dashboard data")
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSaveHero = async () => {
    try {
      await updateHero({ data: hero })
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
      await updateFooter({ data: footer })
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
      await updateStat({ data: stat })
      const updatedStats = await getStats()
      setStats(updatedStats)
      toast.success("Stat saved successfully!")
    } catch (err: unknown) {
      console.error("Stat save failed:", err)
      if (err instanceof Error) {
        toast.error(err.message || "Failed to save stat")
      }
    }
  }

  // --- LOGO UPLOAD HANDLERS ---
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = "" // reset so the same file can be re-selected

    const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
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
      // 1) presigned PUT URL
      const { key, uploadUrl, publicUrl } = await getPresignedUpload({
        data: {
          fileName: file.name,
          mimeType: file.type,
          folder: "branding",
        },
      })

      // 2) upload directly to R2 with XHR for progress
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

      // 3) persist Media record
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

      // 4) update local state (and persist via a delayed saveHero on user action)
      //    Old logo cleanup is best-effort and handled server-side on next
      //    updateHero call (cms.server prunes orphaned R2 objects).
      void hero.logoKey // referenced for parity with future cleanup hook
      setHero((prev) => ({ ...prev, logoUrl: publicUrl, logoKey: key }))
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
    if (!hero.logoKey && !hero.logoUrl) return
    setHero((prev) => ({ ...prev, logoUrl: null, logoKey: null }))
    toast.success(
      "Logo removed — click Save Changes to persist. The 'Fouzia Tamanna' text logo will reappear."
    )
  }

  const handleAddStat = () => {
    setStats([...stats, { value: "0", label: "New Stat", order: stats.length }])
  }

  const handleDeleteStat = async (id?: number) => {
    if (id) {
      await deleteStat({ data: id })
      const updatedStats = await getStats()
      setStats(updatedStats)
    } else {
      setStats(stats.filter((s) => s.id !== undefined))
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md space-y-4 border-destructive/50 bg-secondary/30 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <RiDeleteBinLine size={24} />
          </div>
          <h2 className="text-xl font-bold text-destructive">Failed to Load</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry Loading
          </Button>
        </Card>
      </div>
    )
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
          <Button onClick={handleSaveHero} className="gap-2">
            <RiSaveLine size={18} />
            Save Changes
          </Button>
        </div>

        <Card className="space-y-6 border-border bg-card/30 p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-xl border border-border bg-background/50 p-4 md:col-span-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold tracking-tight">
                  Open to Work
                </Label>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Show availability badge on landing page
                </p>
              </div>
              <Switch
                checked={hero.openToWork}
                onCheckedChange={(val) => setHero({ ...hero, openToWork: val })}
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-3 rounded-xl border border-border bg-background/50 p-4 md:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold tracking-tight">
                    Brand Logo
                  </Label>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">
                    Upload a logo to replace the "Fouzia Tamanna" text in the
                    navbar. Leave empty to keep the text.
                  </p>
                </div>
                {r2Ok === false && (
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold tracking-widest text-amber-600 uppercase">
                    R2 Not Configured
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/30">
                  {hero.logoUrl ? (
                    <img
                      src={hero.logoUrl}
                      alt="Current logo"
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                      <RiImageLine size={20} />
                      <span className="text-[9px] font-bold tracking-widest uppercase">
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
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={logoUploading || r2Ok === false}
                    onClick={() => logoInputRef.current?.click()}
                    className="w-full gap-2 sm:w-auto"
                  >
                    {logoUploading ? (
                      <>
                        <RiLoader4Line size={16} className="animate-spin" />
                        Uploading… {logoProgress}%
                      </>
                    ) : (
                      <>
                        <RiUploadCloud2Line size={16} />
                        {hero.logoUrl ? "Replace Logo" : "Upload Logo"}
                      </>
                    )}
                  </Button>
                  {hero.logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                    >
                      <RiDeleteBinLine size={14} />
                      Remove Logo (use text instead)
                    </Button>
                  )}
                  <p className="text-[10px] text-muted-foreground">
                    PNG, JPG, SVG, or WEBP. Recommended height 32–48px,
                    transparent background.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Intro Badge Text</Label>
              <Input
                value={hero.introBadge}
                onChange={(e) =>
                  setHero({ ...hero, introBadge: e.target.value })
                }
                placeholder="OPEN TO WORK — SOC ANALYST"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle (shown under name)</Label>
              <Input
                value={hero.subtitle ?? ""}
                onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                placeholder="MSc Computer Networks & Systems Security"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Resume URL (Google Drive/Dropbox/Direct Link)</Label>
              <Input
                value={hero.resumeUrl}
                onChange={(e) =>
                  setHero({ ...hero, resumeUrl: e.target.value })
                }
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Main Title (your name as it appears in the brand)</Label>
              <Input
                value={hero.title}
                onChange={(e) => setHero({ ...hero, title: e.target.value })}
                placeholder="Fouzia Tamanna"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={hero.description}
                onChange={(e) =>
                  setHero({ ...hero, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={hero.location}
                onChange={(e) => setHero({ ...hero, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Sponsorship Info</Label>
              <Input
                value={hero.sponsorshipInfo}
                onChange={(e) =>
                  setHero({ ...hero, sponsorshipInfo: e.target.value })
                }
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Footer Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Footer & Socials</h2>
          <Button onClick={handleSaveFooter} className="gap-2">
            <RiSaveLine size={18} />
            Save Footer
          </Button>
        </div>

        <Card className="space-y-6 border-border bg-card/30 p-6 backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Footer Bio</Label>
              <Textarea
                value={footer.bio}
                onChange={(e) => setFooter({ ...footer, bio: e.target.value })}
                rows={3}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Public Email</Label>
              <Input
                type="email"
                value={footer.email}
                onChange={(e) =>
                  setFooter({ ...footer, email: e.target.value })
                }
                className="bg-background/50"
                placeholder="hello@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Availability Status</Label>
              <Input
                value={footer.availability}
                onChange={(e) =>
                  setFooter({ ...footer, availability: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn URL</Label>
              <Input
                value={footer.linkedin}
                onChange={(e) =>
                  setFooter({ ...footer, linkedin: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub URL</Label>
              <Input
                value={footer.github}
                onChange={(e) =>
                  setFooter({ ...footer, github: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>Twitter URL</Label>
              <Input
                value={footer.twitter}
                onChange={(e) =>
                  setFooter({ ...footer, twitter: e.target.value })
                }
                className="bg-background/50"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Stats</h2>
          <Button variant="outline" onClick={handleAddStat} className="gap-2">
            <RiAddLine size={18} />
            Add Stat
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {stats.length > 0 ? (
            stats.map((stat, i) => (
              <Card key={i} className="space-y-4 border-border bg-card/30 p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Value
                    </Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...stats]
                        newStats[i].value = e.target.value
                        setStats(newStats)
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Label
                    </Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...stats]
                        newStats[i].label = e.target.value
                        setStats(newStats)
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-bold text-muted-foreground uppercase">
                      Order
                    </Label>
                    <Input
                      type="number"
                      className="h-8 w-16 text-xs"
                      value={stat.order}
                      onChange={(e) => {
                        const newStats = [...stats]
                        newStats[i].order = parseInt(e.target.value) || 0
                        setStats(newStats)
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStat(stat.id)}
                      className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <RiDeleteBinLine size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleSaveStat(stat)}
                      className="h-8 px-4"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-2 rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              No stats found. Add your first stat to get started.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export const Route = createFileRoute("/admin/")({
  component: AdminIndexComponent,
})
