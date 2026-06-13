import { projectsQuery } from "@/lib/queries"
import { RiArrowRightUpLine, RiShieldKeyholeLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { Button } from "./ui/button"

interface ProjectItem {
  id: string
  slug: string
  title: string
  summary: string
  tags: string
  isFeatured: boolean
  link?: string | null
  github?: string | null
}

interface ProjectsProps {
  sectionConfig?: {
    badge?: string | null
    heading?: string | null
    subtext?: string | null
  }
}

export default function Projects({ sectionConfig }: ProjectsProps = {}) {
  const { data: rawProjects } = useSuspenseQuery(projectsQuery)
  const projects = (rawProjects ?? []) as unknown as Array<ProjectItem>

  if (projects.length === 0) return null

  const featuredProject = projects.find((p) => p.isFeatured) ?? projects[0]
  const otherProjects = projects.filter((p) => p.id !== featuredProject.id)

  const badge = sectionConfig?.badge ?? "// PROJECTS.MKD"
  const heading = sectionConfig?.heading ?? (
    <>
      <span className="text-gradient-neon-bg">Security</span> Projects &amp;
      <br className="hidden md:block" /> Case Studies
    </>
  )
  const subtext =
    sectionConfig?.subtext ??
    "Hands-on projects in threat detection, network forensics, and zero-trust infrastructure."

  return (
    <section
      id="projects"
      className="tech-grid relative px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 text-center md:mb-16 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="space-y-3">
            <div className="label-mono">{badge}</div>
            <h2 className="font-display text-3xl leading-none font-bold tracking-wide uppercase md:text-5xl">
              {heading}
            </h2>
          </div>
          <p className="mx-auto max-w-md font-mono text-sm text-muted-foreground md:mx-0 md:text-base">
            {subtext}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:gap-10">
          <Link
            to="/projects/$slug"
            params={{ slug: featuredProject.slug }}
            className="group hover:neon-glow cyber-chamfer-lg relative flex flex-col items-start gap-6 border border-border bg-card/60 p-6 transition-all hover:border-primary md:gap-8 md:p-8"
          >
            {featuredProject.isFeatured && (
              <div className="cyber-chamfer-sm absolute top-4 right-4 z-10 flex items-center gap-2 border border-primary/60 bg-primary/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-primary uppercase md:top-6 md:right-6 md:text-[10px]">
                <span className="status-dot h-1.5 w-1.5" />
                Featured
              </div>
            )}

            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-wrap gap-1.5">
                {(featuredProject.tags || "")
                  .split(",")
                  .map((tag: string) => tag.trim())
                  .filter(Boolean)
                  .map((tag, i) => (
                    <span
                      key={i}
                      className="cyber-chamfer-sm border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-primary/80 uppercase md:text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              <h3 className="text-center font-display text-2xl leading-tight font-bold tracking-wide uppercase md:text-left md:text-3xl">
                {featuredProject.title}
              </h3>
              <p className="text-center font-mono text-sm leading-relaxed text-muted-foreground md:text-left md:text-base">
                {featuredProject.summary}
              </p>
              <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row md:justify-start">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-primary uppercase">
                  View Case Study
                  <RiArrowRightUpLine size={12} />
                </span>
                <div className="flex items-center gap-2">
                  {featuredProject.github && featuredProject.github !== "#" && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="View source"
                      className="cyber-chamfer-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(
                          featuredProject.github!,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }}
                    >
                      <RiShieldKeyholeLine size={18} />
                    </Button>
                  )}
                  {featuredProject.link && featuredProject.link !== "#" && (
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Open project"
                      className="cyber-chamfer-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(
                          featuredProject.link!,
                          "_blank",
                          "noopener,noreferrer"
                        )
                      }}
                    >
                      <RiArrowRightUpLine size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Link>

          {otherProjects.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {otherProjects.map((project) => (
                <Link
                  key={project.id}
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="group hover:neon-glow cyber-chamfer relative overflow-hidden border border-border bg-card/40 p-4 transition-all hover:border-primary"
                >
                  <div className="space-y-3 px-1 py-3 md:space-y-4 md:py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.tags || "")
                        .split(",")
                        .map((tag: string) => tag.trim())
                        .filter(Boolean)
                        .map((tag, j) => (
                          <span
                            key={j}
                            className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase md:text-[10px]"
                          >
                            # {tag}
                          </span>
                        ))}
                    </div>
                    <h3 className="font-display text-lg leading-tight font-bold tracking-wide uppercase md:text-xl">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 font-mono text-xs text-muted-foreground md:text-sm">
                      {project.summary}
                    </p>
                    <div className="flex items-center justify-between pt-2 md:pt-3">
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-primary uppercase">
                        Read More
                        <RiArrowRightUpLine size={12} />
                      </span>
                      <div className="flex items-center gap-1">
                        {project.github && project.github !== "#" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="View source"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.open(
                                project.github!,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }}
                          >
                            <RiShieldKeyholeLine size={16} />
                          </Button>
                        )}
                        {project.link && project.link !== "#" && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Open project"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              window.open(
                                project.link!,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }}
                          >
                            <RiArrowRightUpLine size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
