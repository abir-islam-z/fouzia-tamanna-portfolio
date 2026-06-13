import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { finalizeMediaUploadFn, getPresignedUpload } from "@/lib/cms"
import { heroQuery, r2StatusQuery, useUpdateHero } from "@/lib/queries"
import { cn } from "@/lib/utils"
import { RiLoader4Line, RiUploadCloud2Line } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
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
  typedLines?: string
  cvButtonLabel?: string
  researchButtonLabel?: string
}

export function HeroTab() {
  const { data: rawHero } = useSuspenseQuery(heroQuery)
  const { data: r2Status } = useSuspenseQuery(r2StatusQuery)
  const heroMutation = useUpdateHero()
  const hero = rawHero as unknown as HeroData
  const r2Ok = (r2Status as { ok: boolean } | undefined)?.ok ?? false

  const [heroState, setHeroState] = useState<HeroData>(hero)
  useEffect(() => {
    setHeroState(hero)
  }, [hero])

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

  // Resume upload
  const [resumeUploading, setResumeUploading] = useState(false)
  const [resumeProgress, setResumeProgress] = useState(0)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Resume too large. Max 10 MB.")
      return
    }
    if (
      !file.type.startsWith("application/pdf") &&
      !file.type.startsWith("image/")
    ) {
      toast.error("Please select a PDF or image file.")
      return
    }
    setResumeUploading(true)
    setResumeProgress(0)
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
          setResumeProgress(Math.round((ev.loaded / ev.total) * 100))
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
          alt: "Resume / CV",
        },
      })

      setHeroState((prev) => ({ ...prev, resumeUrl: publicUrl }))
      toast.success("Resume uploaded — click Save Hero to persist.")
    } catch (err: any) {
      toast.error(err?.message || "Resume upload failed")
    } finally {
      setResumeUploading(false)
      setResumeProgress(0)
    }
  }

  function removeResume() {
    setHeroState((prev) => ({ ...prev, resumeUrl: "#" }))
  }

  const saveHero = async () => {
    try {
      await heroMutation.mutateAsync(heroState)
      toast.success("Hero section saved.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save hero")
    }
  }

  return (
    <div className="space-y-4">
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
                Upload a logo to replace the &quot;Fouzia Tamanna&quot; text in
                the navbar. Leave empty to keep text.
              </p>
            </div>
            {!r2Ok && (
              <Badge variant="admin" className="bg-amber-500/10 text-amber-600">
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

        {/* Resume upload */}
        <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-start justify-between">
            <div>
              <Label variant="admin">Resume / CV</Label>
              <p className="text-xs text-muted-foreground">
                Upload a PDF or image of your resume. Visitors can download it
                from the hero section.
              </p>
            </div>
            {!r2Ok && (
              <Badge variant="admin" className="bg-amber-500/10 text-amber-600">
                R2 Not Configured
              </Badge>
            )}
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-secondary/30">
              {heroState.resumeUrl && heroState.resumeUrl !== "#" ? (
                <div className="flex flex-col items-center gap-1 p-2 text-center">
                  <RiUploadCloud2Line size={20} className="text-primary" />
                  <span className="max-w-full truncate font-mono text-[10px] text-muted-foreground">
                    {heroState.resumeUrl.split("/").pop() ?? "Resume"}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">No resume</span>
              )}
            </div>
            <div className="flex flex-1 gap-2">
              <input
                ref={resumeInputRef}
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleResumeUpload}
              />
              <Button
                variant="admin"
                size="sm"
                onClick={() => resumeInputRef.current?.click()}
                disabled={resumeUploading}
                className="gap-2"
              >
                {resumeUploading ? (
                  <RiLoader4Line size={16} className="animate-spin" />
                ) : (
                  <RiUploadCloud2Line size={16} />
                )}
                {resumeUploading ? `${resumeProgress}%` : "Upload Resume"}
              </Button>
              {heroState.resumeUrl && heroState.resumeUrl !== "#" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeResume}
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
          ].map(({ key, label }) => (
            <div
              key={key}
              className={cn(
                "space-y-1.5",
                key === "introBadge" ? "md:col-span-2" : ""
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
          <div className="space-y-1.5">
            <Label variant="admin">Download CV Button</Label>
            <Input
              variant="admin"
              value={heroState.cvButtonLabel ?? "Download CV"}
              onChange={(e) =>
                setHeroState({ ...heroState, cvButtonLabel: e.target.value })
              }
              placeholder="Download CV"
            />
          </div>
          <div className="space-y-1.5">
            <Label variant="admin">View Research Button</Label>
            <Input
              variant="admin"
              value={heroState.researchButtonLabel ?? "View Research"}
              onChange={(e) =>
                setHeroState({
                  ...heroState,
                  researchButtonLabel: e.target.value,
                })
              }
              placeholder="View Research"
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label variant="admin">Terminal Lines</Label>
            <p className="text-xs text-muted-foreground">
              One line per row. Lines starting with &quot;$ &quot; appear as
              commands, others as output. Leave empty for defaults.
            </p>
            <Textarea
              variant="admin"
              rows={8}
              value={heroState.typedLines ?? ""}
              onChange={(e) =>
                setHeroState({ ...heroState, typedLines: e.target.value })
              }
              placeholder="$ whoami\nfouzia_tamanna\n$ role --current\nSOC Analyst (Tier 2)..."
              className="font-mono text-xs"
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
