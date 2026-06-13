import Certifications from "@/components/Certifications"
import Contact from "@/components/Contact"
import Experience from "@/components/Experience"
import Footer from "@/components/Footer"
import Hero from "@/components/Hero"
import Projects from "@/components/Projects"
import Publications from "@/components/Publications"
import Skills from "@/components/Skills"
import Stats from "@/components/Stats"
import Testimonials from "@/components/Testimonials"
import {
  certificationsQuery,
  experienceQuery,
  footerQuery,
  getQueryClient,
  heroQuery,
  landingSectionsQuery,
  projectsQuery,
  publicationsQuery,
  siteSettingsQuery,
  skillsQuery,
  statsQuery,
  testimonialsQuery,
} from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

const SECTION_RENDERERS: Record<
  string,
  React.ComponentType<{ sectionConfig?: any }>
> = {
  hero: Hero,
  stats: Stats,
  experience: Experience,
  skills: Skills,
  projects: Projects,
  testimonials: Testimonials,
  certifications: Certifications,
  publications: Publications,
  contact: Contact,
}

function IndexComponent() {
  return (
    <main className="min-h-screen bg-background">
      <DynamicSections />
      <Footer />
    </main>
  )
}

function DynamicSections() {
  const { data: sections = [] } = useSuspenseQuery(landingSectionsQuery)
  const enabled = (sections as Array<{ id: string; enabled: boolean }>).filter(
    (s) => s.enabled !== false
  )

  return (
    <>
      {enabled.map((s: any) => {
        const Component = SECTION_RENDERERS[s.id]
        if (!Component) return null
        return (
          <Component
            key={s.id}
            sectionConfig={{
              badge: s.badge ?? null,
              heading: s.heading ?? null,
              subtext: s.subtext ?? null,
              ctaLabel: s.ctaLabel ?? null,
              ctaHref: s.ctaHref ?? null,
            }}
          />
        )
      })}
    </>
  )
}

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await Promise.all([
      queryClient.ensureQueryData(landingSectionsQuery),
      queryClient.ensureQueryData(siteSettingsQuery),
      queryClient.ensureQueryData(heroQuery),
      queryClient.ensureQueryData(statsQuery),
      queryClient.ensureQueryData(experienceQuery),
      queryClient.ensureQueryData(skillsQuery),
      queryClient.ensureQueryData(projectsQuery),
      queryClient.ensureQueryData(testimonialsQuery),
      queryClient.ensureQueryData(certificationsQuery),
      queryClient.ensureQueryData(publicationsQuery()),
      queryClient.ensureQueryData(footerQuery),
    ])
  },
  component: IndexComponent,
})
