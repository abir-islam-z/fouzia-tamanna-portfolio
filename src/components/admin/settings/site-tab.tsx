import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { siteSettingsQuery, useUpdateSiteSettings } from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface SiteSettings {
  heroHeadline: string | null
  heroCtaPrimary: string | null
  heroCtaSecondary: string | null
  contactHeading: string | null
  contactSubtext: string | null
  marqueeItems: string | null
  textLogo: string | null
}

export function SiteTab() {
  const { data: rawSettings } = useSuspenseQuery(siteSettingsQuery)
  const settingsMutation = useUpdateSiteSettings()
  const settings = rawSettings as unknown as SiteSettings

  const [siteState, setSiteState] = useState<SiteSettings>(settings)
  useEffect(() => {
    setSiteState(settings)
  }, [settings])

  const saveSiteSettings = async () => {
    try {
      await settingsMutation.mutateAsync(siteState)
      toast.success("Site settings saved.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save settings")
    }
  }

  return (
    <div className="space-y-4">
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
            <Label variant="admin">Text Logo</Label>
            <Input
              variant="admin"
              value={siteState.textLogo ?? ""}
              onChange={(e) =>
                setSiteState({ ...siteState, textLogo: e.target.value })
              }
              placeholder="Fouzia Tamanna"
            />
            <p className="text-[10px] text-muted-foreground">
              Overrides navbar brand and image logo when set. Leave empty to use
              the logo or brand above.
            </p>
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
    </div>
  )
}
