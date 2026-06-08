import { experienceQuery } from "@/lib/queries"
import {
  RiBuilding4Line,
  RiCalendarLine,
  RiShieldKeyholeLine,
  RiStackLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"

interface ExperienceItem {
  role: string
  company: string
  period: string
  description: string
  skills: string
}

const FALLBACK_EXPERIENCE: Array<ExperienceItem> = [
  {
    role: "SOC Analyst (Tier 2)",
    company: "SecureNet Operations",
    period: "2023 - Present",
    description:
      "Monitor SIEM dashboards, investigate security alerts, and coordinate incident response for enterprise clients. Developed automated playbooks reducing MTTR by 35%.",
    skills: "SIEM, Splunk, Splunk SOAR, Wireshark, MITRE ATT&CK",
  },
  {
    role: "Network Security Engineer",
    company: "CyberDefence Group",
    period: "2021 - 2023",
    description:
      "Deployed and tuned firewalls, IDS/IPS, and VPN solutions. Led network segmentation project for a financial services client (PCI-DSS compliance).",
    skills: "Palo Alto, Cisco ASA, Suricata, Snort, VPN/IPSec, Nessus",
  },
  {
    role: "Junior Network Administrator",
    company: "IT Infrastructure Team",
    period: "2019 - 2021",
    description:
      "Managed Active Directory, DNS, DHCP, and group policies across a 500-user environment. Assisted with vulnerability scans and patch cycles.",
    skills: "Active Directory, Windows Server, PowerShell, PRTG, pfSense",
  },
]

export default function Experience() {
  const { data: rawExperience } = useSuspenseQuery(experienceQuery)
  const experience =
    rawExperience && rawExperience.length > 0
      ? (rawExperience as Array<ExperienceItem>)
      : FALLBACK_EXPERIENCE

  return (
    <section
      id="experience"
      className="circuit-bg relative px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-12 md:flex-row md:gap-20">
        {/* Left: Heading */}
        <div className="space-y-5 md:w-1/3">
          <div className="label-mono">// TIMELINE.LOG</div>
          <h2 className="font-display text-3xl leading-none font-bold tracking-wide uppercase md:text-5xl">
            Security
            <br />
            <span className="text-gradient-neon-bg">Journey</span>
          </h2>
          <p className="font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            A linear progression through SOC analysis, network security, and IT
            infrastructure — built on hands-on incident response and continuous
            learning.
          </p>
          <div className="flex items-center gap-2 pt-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            <span className="status-dot" />
            {experience.length} nodes detected
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="relative md:w-2/3">
          {/* Vertical neon line */}
          <div className="absolute top-2 bottom-2 left-4 w-px bg-linear-to-b from-primary via-border/60 to-transparent md:left-5" />

          <div className="space-y-10">
            {experience.map((item, i) => (
              <div key={i} className="group relative pl-12 md:pl-16">
                {/* Timeline Node */}
                <div className="group-hover:neon-glow-sm cyber-chamfer-sm absolute top-1.5 left-0 z-10 flex h-8 w-8 items-center justify-center border border-border bg-background transition-all group-hover:border-primary md:h-10 md:w-10">
                  {i === 0 ? (
                    <RiShieldKeyholeLine
                      size={16}
                      className="text-glow animate-pulse text-primary"
                    />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 transition-colors group-hover:bg-primary" />
                  )}
                </div>

                {/* Card */}
                <div className="group-hover:neon-glow-sm cyber-chamfer relative border border-border bg-card/60 p-5 transition-all group-hover:border-primary group-hover:bg-card md:p-6">
                  <div className="absolute top-3 right-3 font-mono text-[9px] tracking-widest text-muted-foreground/40 uppercase">
                    NODE_0{i + 1}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-primary uppercase md:text-xs">
                        <RiCalendarLine size={12} className="opacity-70" />
                        {item.period}
                      </div>
                      <h3 className="font-display text-xl leading-tight font-bold tracking-wide uppercase transition-colors group-hover:text-primary md:text-2xl">
                        {item.role}
                      </h3>
                      <div className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
                        <RiBuilding4Line size={14} />
                        {item.company}
                      </div>
                    </div>

                    <p className="font-mono text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                      <RiStackLine size={14} className="mr-1 text-primary/60" />
                      {(item.skills || "")
                        .split(",")
                        .map((skill: string, j: number) => (
                          <span
                            key={j}
                            className="cyber-chamfer-sm border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] tracking-widest text-muted-foreground uppercase transition-colors group-hover:border-primary/40 group-hover:text-foreground md:text-[10px]"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                    </div>
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
