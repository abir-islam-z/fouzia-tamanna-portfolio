import { projectsQuery } from "@/lib/queries"
import { RiArrowRightUpLine, RiShieldKeyholeLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Button } from "./ui/button"

interface ProjectItem {
  title: string
  description: string
  image: string
  tags: string
  isFeatured: boolean
  link?: string | null
  github?: string | null
}

const FALLBACK_PROJECTS: Array<ProjectItem> = [
  {
    title: "Threat-Hunting Lab (ELK + Caldera)",
    description:
      "Home SOC lab using Elastic Stack and MITRE Caldera to emulate APT techniques, detect them, and build detection rules. Full ATT&CK coverage.",
    image:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    tags: "ELK, MITRE Caldera, Detection Engineering",
    isFeatured: true,
    link: "#",
    github: "#",
  },
  {
    title: "Network Forensics Toolkit",
    description:
      "Python-based toolkit that parses PCAP files, extracts IOCs (IPs, domains, hashes), and exports to STIX 2.1 for threat-intel platforms.",
    image:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    tags: "Python, Scapy, STIX 2.1, PCAP Analysis",
    isFeatured: true,
    link: "#",
    github: "#",
  },
  {
    title: "Zero-Trust VPN Deployment",
    description:
      "Designed and deployed a WireGuard-based zero-trust mesh VPN with mutual TLS, device posture checks, and per-app access policies.",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
    tags: "WireGuard, mTLS, Zero Trust, OpenWRT",
    isFeatured: false,
    link: "#",
    github: "#",
  },
]

export default function Projects() {
  const { data: rawProjects } = useSuspenseQuery(projectsQuery)
  const projects =
    rawProjects && rawProjects.length > 0
      ? (rawProjects as Array<ProjectItem>)
      : FALLBACK_PROJECTS

  const featuredProject = projects.find((p) => p.isFeatured) || projects[0]
  const otherProjects = projects.filter((p) => p !== featuredProject)

  return (
    <section
      id="projects"
      className="tech-grid relative px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-6 text-center md:mb-16 md:flex-row md:items-end md:justify-between md:text-left">
          <div className="space-y-3">
            <div className="label-mono">// PROJECTS.MKD</div>
            <h2 className="font-display text-3xl leading-none font-bold tracking-wide uppercase md:text-5xl">
              <span className="text-gradient-neon-bg">Security</span> Projects
              &amp;
              <br className="hidden md:block" /> Case Studies
            </h2>
          </div>
          <p className="mx-auto max-w-md font-mono text-sm text-muted-foreground md:mx-0 md:text-base">
            Hands-on projects in threat detection, network forensics, and
            zero-trust infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:gap-10">
          {/* Featured Project */}
          {featuredProject && (
            <div className="group hover:neon-glow cyber-chamfer-lg relative grid items-center gap-6 border border-border bg-card/60 p-6 transition-all hover:border-primary md:grid-cols-2 md:gap-8 md:p-8">
              <div className="cyber-chamfer-sm absolute top-4 right-4 z-10 flex items-center gap-2 border border-primary/60 bg-primary/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-primary uppercase md:top-6 md:right-6 md:text-[10px]">
                <span className="status-dot h-1.5 w-1.5" />
                FEATURED
              </div>

              <div className="order-2 space-y-4 md:order-1 md:space-y-6">
                <div className="flex flex-wrap gap-1.5">
                  {(featuredProject.tags || "")
                    .split(",")
                    .map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="cyber-chamfer-sm border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-primary/80 uppercase md:text-[10px]"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                </div>
                <h3 className="text-center font-display text-2xl leading-tight font-bold tracking-wide uppercase md:text-left md:text-3xl">
                  {featuredProject.title}
                </h3>
                <p className="text-center font-mono text-sm leading-relaxed text-muted-foreground md:text-left md:text-base">
                  {featuredProject.description}
                </p>
                <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row md:justify-start">
                  <Button variant="glitch" size="sm">
                    View Case Study
                  </Button>
                  <div className="flex items-center gap-2">
                    {featuredProject.github && (
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="View source"
                        className="cyber-chamfer-sm"
                      >
                        <RiShieldKeyholeLine size={18} />
                      </Button>
                    )}
                    {featuredProject.link && (
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Open project"
                        className="cyber-chamfer-sm"
                      >
                        <RiArrowRightUpLine size={18} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="cyber-chamfer order-1 aspect-video overflow-hidden border border-border md:order-2">
                <div className="relative h-full w-full overflow-hidden">
                  <img
                    src={featuredProject.image}
                    alt={featuredProject.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
                  <div className="scan-sweep absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </div>
            </div>
          )}

          {/* Other Projects Grid */}
          {otherProjects.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {otherProjects.map((project, i) => (
                <div
                  key={i}
                  className="group hover:neon-glow cyber-chamfer relative overflow-hidden border border-border bg-card/40 p-4 transition-all hover:border-primary"
                >
                  <div className="cyber-chamfer-sm relative aspect-video overflow-hidden border border-border">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="space-y-3 px-1 py-3 md:space-y-4 md:py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {(project.tags || "")
                        .split(",")
                        .map((tag: string, j: number) => (
                          <span
                            key={j}
                            className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase md:text-[10px]"
                          >
                            # {tag.trim()}
                          </span>
                        ))}
                    </div>
                    <h3 className="font-display text-lg leading-tight font-bold tracking-wide uppercase md:text-xl">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 font-mono text-xs text-muted-foreground md:text-sm">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 md:pt-3">
                      <a
                        href="#"
                        className="group/link hover:text-glow inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-primary uppercase transition-all"
                      >
                        Read More
                        <RiArrowRightUpLine
                          size={12}
                          className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                        />
                      </a>
                      <div className="flex items-center gap-1">
                        {project.github && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="View source"
                          >
                            <RiShieldKeyholeLine size={16} />
                          </Button>
                        )}
                        {project.link && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Open project"
                          >
                            <RiArrowRightUpLine size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
