import { getProjects } from "@/lib/cms"
import { RiShieldKeyholeLine } from "@remixicon/react"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"

interface ProjectItem {
  title: string
  description: string
  image: string
  tags: string
  isFeatured: boolean
  link?: string | null
  github?: string | null
}

const FALLBACK_PROJECTS: ProjectItem[] = [
  {
    title: "Threat-Hunting Lab (ELK + Caldera)",
    description: "Home SOC lab using Elastic Stack and MITRE Caldera to emulate APT techniques, detect them, and build detection rules. Full ATT&CK coverage.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    tags: "ELK, MITRE Caldera, Detection Engineering",
    isFeatured: true,
    link: "#",
    github: "#"
  },
  {
    title: "Network Forensics Toolkit",
    description: "Python-based toolkit that parses PCAP files, extracts IOCs (IPs, domains, hashes), and exports to STIX 2.1 for threat-intel platforms.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800",
    tags: "Python, Scapy, STIX 2.1, PCAP Analysis",
    isFeatured: true,
    link: "#",
    github: "#"
  },
  {
    title: "Zero-Trust VPN Deployment",
    description: "Designed and deployed a WireGuard-based zero-trust mesh VPN with mutual TLS, device posture checks, and per-app access policies.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=800",
    tags: "WireGuard, mTLS, Zero Trust, OpenWRT",
    isFeatured: false,
    link: "#",
    github: "#"
  }
]

export default function Projects() {
  const [projects, setProjects] = useState<ProjectItem[]>(FALLBACK_PROJECTS)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProjects()
        if (data && data.length > 0) setProjects(data as ProjectItem[])
      } catch (error) {
        console.error("Failed to fetch projects, using fallback.", error)
      }
    }
    loadData()
  }, [])

  const featuredProject = projects.find(p => p.isFeatured) || projects[0]
  const otherProjects = projects.filter(p => p !== featuredProject)

  return (
    <section id="projects" className="py-16 md:py-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 md:mb-16 text-center md:text-left">
          <div>
            <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">MY WORK</Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Security Projects &amp; Case Studies</h2>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto md:mx-0 text-sm md:text-base">
            Hands-on projects in threat detection, network forensics, and zero-trust infrastructure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:gap-12">
          {/* Featured Project */}
          {featuredProject && (
            <div className="group relative grid md:grid-cols-2 gap-6 md:gap-8 items-center bg-secondary/30 rounded-[24px] md:rounded-[40px] p-6 md:p-12 border border-border/50 hover:border-primary/20 transition-all overflow-hidden">
              <div className="absolute top-4 right-4 md:top-8 md:right-8">
                <Badge className="bg-primary text-primary-foreground text-[10px] md:text-xs">FEATURED</Badge>
              </div>
              <div className="order-2 md:order-1 space-y-4 md:space-y-6">
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {(featuredProject.tags || "").split(",").map((tag: string, i: number) => (
                    <span key={i} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-primary/80">{tag.trim()}</span>
                  ))}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-center md:text-left">{featuredProject.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed text-center md:text-left">
                  {featuredProject.description}
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  <Button className="rounded-full px-8 w-full sm:w-auto">View Case Study</Button>
                  <div className="flex items-center gap-2">
                    {featuredProject.github && (
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-background">
                        <RiShieldKeyholeLine size={20} />
                      </Button>
                    )}
                    {featuredProject.link && (
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-background">
                        <span className="font-mono text-xs">↗</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-border shadow-xl md:shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                <img src={featuredProject.image} alt={featuredProject.title} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Other Projects Grid */}
          {otherProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {otherProjects.map((project, i) => (
                <Card key={i} className="p-4 bg-background/50 border-border group hover:border-primary/20 transition-all overflow-hidden rounded-[24px]">
                  <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 border border-border">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="px-2 pb-2 space-y-3 md:space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(project.tags || "").split(",").map((tag: string, j: number) => (
                        <span key={j} className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{tag.trim()}</span>
                      ))}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">{project.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 md:pt-4">
                      <Button variant="link" className="p-0 h-auto text-primary font-bold text-xs md:text-sm">Read More</Button>
                      <div className="flex items-center gap-1">
                        {project.github && <Button variant="ghost" size="icon" className="h-8 w-8"><RiShieldKeyholeLine size={18} /></Button>}
                        {project.link && <Button variant="ghost" size="icon" className="h-8 w-8"><span className="font-mono text-xs">↗</span></Button>}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
