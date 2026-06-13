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
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

const TABS = [
  { value: "hero", label: "Hero" },
  { value: "site", label: "Site Text" },
  { value: "footer", label: "Footer" },
  { value: "sections", label: "Sections" },
  { value: "security", label: "Security" },
] as const

function AdminSettingsComponent() {
  const [activeTab, setActiveTab] = useState("hero")

  return (
    <div className="space-y-6">
      <header>
        <div className="label-mono mb-3">// SETTINGS.SH</div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage the hero section, footer, landing page text, and section order.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
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
