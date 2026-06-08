import { statsQuery } from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"

interface StatItem {
  value: string
  label: string
}

const FALLBACK_STATS: Array<StatItem> = [
  { value: "2K+", label: "Threats Triaged" },
  { value: "150+", label: "Incidents Resolved" },
  { value: "99.9%", label: "Network Uptime" },
  { value: "4+", label: "Years in IT Security" },
]

export default function Stats() {
  const { data: rawStats } = useSuspenseQuery(statsQuery)
  const stats =
    rawStats && rawStats.length > 0
      ? (rawStats as Array<StatItem>)
      : FALLBACK_STATS

  return (
    <section className="tech-grid relative border-y border-border/50 px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl items-start gap-12 lg:grid-cols-5 lg:gap-16">
        {/* Left: Heading */}
        <div className="space-y-6 text-center lg:col-span-2 lg:text-left">
          <div className="label-mono">// PROFILE.SYS</div>
          <h2 className="font-display text-2xl leading-tight font-bold tracking-wide uppercase md:text-4xl">
            Hello, I&apos;m Fouzia —
            <br className="hidden md:block" />
            <span
              className="cyber-glitch text-gradient-neon-bg"
              data-text="SOC Analyst"
            >
              SOC Analyst
            </span>{" "}
            &amp; Network Security Specialist.
          </h2>
          <p className="font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            I hold an{" "}
            <span className="text-primary">
              MSc in Computer Networks and Systems Security
            </span>{" "}
            and work at the intersection of threat detection, incident response,
            and systems hardening — protecting enterprise infrastructure from
            evolving cyber threats.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase lg:justify-start">
            <span className="status-dot" />
            <span>System online</span>
            <span className="mx-2 text-border">|</span>
            <span>v2.6.4</span>
          </div>
        </div>

        {/* Right: Stats grid with neon dividers */}
        <div className="cyber-chamfer grid grid-cols-2 divide-x divide-y divide-border/50 border border-border/50 lg:col-span-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative flex flex-col justify-center gap-1 p-6 transition-all hover:bg-primary/5 md:p-8"
            >
              <div className="absolute top-3 right-3 font-mono text-[9px] tracking-widest text-muted-foreground/40 uppercase">
                0{i + 1}
              </div>
              <div className="text-glow-md font-display text-3xl font-black tracking-tight text-primary uppercase md:text-5xl">
                {stat.value}
              </div>
              <div className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase md:text-xs">
                {stat.label}
              </div>
              <div className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-linear-to-r from-transparent via-primary to-transparent transition-transform duration-300 group-hover:scale-x-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
