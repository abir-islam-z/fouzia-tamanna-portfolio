import { Card } from "@/components/ui/card"
import {
  RiArrowRightUpLine,
  RiAwardLine,
  RiBookOpenLine,
  RiBriefcaseLine,
  RiCodeBoxLine,
  RiDashboardLine,
  RiImageLine,
  RiMailLine,
  RiSettingsLine,
  RiStarLine,
} from "@remixicon/react"
import { Link, createFileRoute } from "@tanstack/react-router"

interface NavCard {
  to: string
  label: string
  description: string
  icon: typeof RiDashboardLine
  color: string
}

const navCards: NavCard[] = [
  {
    to: "/admin/experience",
    label: "Experience",
    description: "Your professional timeline.",
    icon: RiBriefcaseLine,
    color: "text-cyan-400",
  },
  {
    to: "/admin/projects",
    label: "Projects",
    description: "Portfolio projects & case studies.",
    icon: RiCodeBoxLine,
    color: "text-primary",
  },
  {
    to: "/admin/publications",
    label: "Publications",
    description: "Research papers and preprints.",
    icon: RiBookOpenLine,
    color: "text-amber-400",
  },
  {
    to: "/admin/certifications",
    label: "Certifications",
    description: "Professional credentials.",
    icon: RiAwardLine,
    color: "text-emerald-400",
  },
  {
    to: "/admin/testimonials",
    label: "Testimonials",
    description: "Client feedback and reviews.",
    icon: RiStarLine,
    color: "text-yellow-400",
  },
  {
    to: "/admin/stats",
    label: "Stats",
    description: "Key numbers in your profile.",
    icon: RiDashboardLine,
    color: "text-rose-400",
  },
  {
    to: "/admin/media",
    label: "Media Library",
    description: "Upload, organize, and reuse media.",
    icon: RiImageLine,
    color: "text-violet-400",
  },
  {
    to: "/admin/messages",
    label: "Messages",
    description: "Inquiries from the contact form.",
    icon: RiMailLine,
    color: "text-sky-400",
  },
  {
    to: "/admin/settings",
    label: "Settings",
    description: "Hero, footer, landing page text, section order.",
    icon: RiSettingsLine,
    color: "text-primary",
  },
]

function AdminIndexComponent() {
  return (
    <div className="space-y-10">
      <header>
        <div className="label-mono mb-3">// ADMIN.OVERVIEW</div>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Choose a section to manage. All content is stored in the database and
          rendered dynamically.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navCards.map((card) => (
          <Link key={card.to} to={card.to}>
            <Card
              variant="admin"
              className="group h-full space-y-3 p-5 transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <card.icon
                  size={22}
                  className={`${card.color} transition-transform group-hover:scale-110`}
                />
                <RiArrowRightUpLine
                  size={16}
                  className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{card.label}</h3>
                <p className="text-sm text-muted-foreground">
                  {card.description}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/admin/")({
  component: AdminIndexComponent,
})
