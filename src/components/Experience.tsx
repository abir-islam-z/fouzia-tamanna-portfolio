import { getExperience } from "@/lib/cms"
import { RiBuilding4Line, RiCalendarLine, RiShieldKeyholeLine, RiStackLine } from "@remixicon/react"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"

interface ExperienceItem {
  role: string
  company: string
  period: string
  description: string
  skills: string
}

const FALLBACK_EXPERIENCE: ExperienceItem[] = [
  {
    role: "SOC Analyst (Tier 2)",
    company: "SecureNet Operations",
    period: "2023 - Present",
    description: "Monitor SIEM dashboards, investigate security alerts, and coordinate incident response for enterprise clients. Developed automated playbooks reducing MTTR by 35%.",
    skills: "SIEM, Splunk, Splunk SOAR, Wireshark, MITRE ATT&CK"
  },
  {
    role: "Network Security Engineer",
    company: "CyberDefence Group",
    period: "2021 - 2023",
    description: "Deployed and tuned firewalls, IDS/IPS, and VPN solutions. Led network segmentation project for a financial services client (PCI-DSS compliance).",
    skills: "Palo Alto, Cisco ASA, Suricata, Snort, VPN/IPSec, Nessus"
  },
  {
    role: "Junior Network Administrator",
    company: "IT Infrastructure Team",
    period: "2019 - 2021",
    description: "Managed Active Directory, DNS, DHCP, and group policies across a 500-user environment. Assisted with vulnerability scans and patch cycles.",
    skills: "Active Directory, Windows Server, PowerShell, PRTG, pfSense"
  }
]

export default function Experience() {
  const [experience, setExperience] = useState<ExperienceItem[]>(FALLBACK_EXPERIENCE)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getExperience()
        if (data && data.length > 0) {
          // Sort by order or assume most recent first if order is same
          setExperience(data as ExperienceItem[])
        }
      } catch (error) {
        console.error("Failed to fetch experience, using fallback.", error)
      }
    }
    loadData()
  }, [])

  return (
    <section id="experience" className="py-16 md:py-32 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-12 md:gap-20">
        {/* Left Column: Heading */}
        <div className="md:w-1/3 space-y-4">
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 uppercase tracking-widest text-[10px] font-bold">EXPERIENCE</Badge>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Security <br />Journey</h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm">
            A linear progression through SOC analysis, network security, and IT infrastructure — built on hands-on incident response and continuous learning.
          </p>
        </div>

        {/* Right Column: Timeline */}
        <div className="md:w-2/3 relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-5 top-2 bottom-2 w-px bg-linear-to-b from-primary via-border to-transparent" />

          <div className="space-y-12">
            {experience.map((item, i) => (
              <div key={i} className="relative pl-12 md:pl-16 group">
                {/* Timeline Node */}
                <div className="absolute left-0 top-1.5 flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-border bg-background z-10 group-hover:border-primary transition-colors shadow-sm">
                  {i === 0 ? (
                    <RiShieldKeyholeLine
                      size={16}
                      className="text-primary animate-pulse"
                    />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary/50 transition-colors" />
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary">
                      <RiCalendarLine size={14} className="opacity-70" />
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">{item.period}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {item.role}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm md:text-base">
                      <RiBuilding4Line size={16} />
                      {item.company}
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <RiStackLine size={16} className="text-muted-foreground/40 mt-1" />
                    {(item.skills || "").split(",").map((skill: string, j: number) => (
                      <Badge key={j} variant="secondary" className="bg-secondary/50 text-[9px] md:text-[10px] uppercase tracking-tight font-bold border-border/50">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
