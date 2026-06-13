import { FooterTab } from "@/components/admin/settings/footer-tab"
import { HeroTab } from "@/components/admin/settings/hero-tab"
import { SectionsTab } from "@/components/admin/settings/sections-tab"
import { SecurityTab } from "@/components/admin/settings/security-tab"
import { SiteTab } from "@/components/admin/settings/site-tab"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  footerQuery,
  getQueryClient,
  heroQuery,
  landingSectionsQuery,
  r2StatusQuery,
  siteSettingsQuery,
  userProfileQuery,
} from "@/lib/queries"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { z } from "zod"

const TABS = [
  { value: "hero", label: "Hero" },
  { value: "site", label: "Site Text" },
  { value: "footer", label: "Footer" },
  { value: "sections", label: "Sections" },
  { value: "security", label: "Security" },
] as const

const settingsSearchSchema = z.object({
  tab: z.enum(["hero", "site", "footer", "sections", "security"]).catch("hero"),
})

function AdminSettingsComponent() {
  const { tab } = useSearch({ from: "/admin/settings" })
  const navigate = useNavigate({ from: "/admin/settings" })

  return (
    <div className="space-y-6">
      <header>
        <div className="label-mono mb-3">// SETTINGS.SH</div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage the hero section, footer, landing page text, and section order.
        </p>
      </header>

      <Tabs
        value={tab}
        onValueChange={(value) =>
          navigate({ search: { tab: value as typeof tab } })
        }
      >
        <TabsList>
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="hero">
          <HeroTab />
        </TabsContent>
        <TabsContent value="site">
          <SiteTab />
        </TabsContent>
        <TabsContent value="footer">
          <FooterTab />
        </TabsContent>
        <TabsContent value="sections">
          <SectionsTab />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute("/admin/settings")({
  validateSearch: settingsSearchSchema,
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await Promise.all([
      queryClient.ensureQueryData(heroQuery),
      queryClient.ensureQueryData(footerQuery),
      queryClient.ensureQueryData(landingSectionsQuery),
      queryClient.ensureQueryData(siteSettingsQuery),
      queryClient.ensureQueryData(r2StatusQuery),
      queryClient.ensureQueryData(userProfileQuery),
    ])
  },
  component: AdminSettingsComponent,
})
