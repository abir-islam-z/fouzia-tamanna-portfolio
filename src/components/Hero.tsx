import { getHero } from "@/lib/cms"
import { RiShieldCheckLine, RiTerminalBoxLine } from "@remixicon/react"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"

interface HeroData {
  title: string
  subtitle?: string
  description: string
  introBadge: string
  location: string
  sponsorshipInfo: string
  openToWork: boolean
  resumeUrl: string
  logoUrl?: string | null
}

const FALLBACK_HERO: HeroData = {
  title: "Fouzia Tamanna",
  subtitle: "MSc Computer Networks & Systems Security",
  description:
    "Network Security & SOC Analyst specializing in threat detection, incident response, and systems security.",
  introBadge: "OPEN TO WORK — SOC ANALYST",
  location: "London, UK",
  sponsorshipInfo: "No sponsorship needed",
  openToWork: true,
  resumeUrl: "#",
  logoUrl: null,
}

const TYPED_LINES = [
  "$ whoami",
  "fouzia_tamanna",
  "$ role --current",
  "SOC Analyst (Tier 2) @ SecureNet Operations",
  "$ focus --primary",
  "Threat Detection · Incident Response · SIEM",
  "$ certs --list",
  "Security+ · CSA · CCNA · BTL1",
  "$ status",
  "[+] All systems nominal. Listening for anomalies...",
]

export default function Hero() {
  const [particles, setParticles] = useState<
    Array<{ left: string; top: string; delay: string; duration: string }>
  >([])
  const [data, setData] = useState<HeroData>(FALLBACK_HERO)
  const [typed, setTyped] = useState("")
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const p = [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${5 + Math.random() * 10}s`,
    }))
    setParticles(p)

    async function loadHero() {
      try {
        const h = await getHero()
        setData({
          title: h.title || FALLBACK_HERO.title,
          subtitle: h.subtitle || FALLBACK_HERO.subtitle,
          description: h.description || FALLBACK_HERO.description,
          introBadge: h.introBadge || FALLBACK_HERO.introBadge,
          location: h.location || FALLBACK_HERO.location,
          sponsorshipInfo:
            h.sponsorshipInfo || FALLBACK_HERO.sponsorshipInfo,
          openToWork: h.openToWork ?? true,
          resumeUrl: h.resumeUrl || "#",
          logoUrl: h.logoUrl ?? null,
        })
      } catch (error) {
        console.error("Failed to fetch hero data, using fallback.", error)
      }
    }
    loadHero()
  }, [])

  // Terminal typing effect
  useEffect(() => {
    if (lineIndex >= TYPED_LINES.length) return
    const current = TYPED_LINES[lineIndex]
    if (charIndex < current.length) {
      const timeout = setTimeout(() => {
        setTyped((prev) => prev + current[charIndex])
        setCharIndex((c) => c + 1)
      }, 28)
      return () => clearTimeout(timeout)
    } else {
      const timeout = setTimeout(() => {
        setTyped((prev) => prev + "\n")
        setLineIndex((l) => l + 1)
        setCharIndex(0)
      }, 700)
      return () => clearTimeout(timeout)
    }
  }, [charIndex, lineIndex])

  return (
    <section
      id="about"
      className="relative overflow-hidden px-4 pt-24 pb-16 md:px-6 md:pt-32 md:pb-20"
    >
      {/* Terminal-style Hero Panel */}
      <div className="group relative mx-auto max-w-6xl overflow-hidden rounded-[24px] border border-border bg-black shadow-2xl transition-all duration-500 md:rounded-[32px]">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-secondary/40 px-4 py-3 md:px-6">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-destructive/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-primary/80" />
            <span className="ml-3 hidden font-mono text-[10px] tracking-widest text-white/50 uppercase md:inline">
              ~/fouzia-portfolio — bash
            </span>
          </div>
          <Badge
            variant="secondary"
            className="border-white/10 bg-white/5 px-2 py-1 font-mono text-[9px] tracking-widest text-white/70 uppercase backdrop-blur-md md:text-[10px]"
          >
            <RiTerminalBoxLine size={12} className="mr-1.5" />
            SECURE_SESSION
          </Badge>
        </div>

        {/* Body */}
        <div className="relative">
          {/* Grid + Particles */}
          <div className="absolute inset-0">
            <div className="grid-overlay absolute inset-0 opacity-15" />
            {particles.map((p, i) => (
              <div
                key={i}
                className="particle animate-float"
                style={{
                  left: p.left,
                  top: p.top,
                  animationDelay: p.delay,
                  animationDuration: p.duration,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          </div>

          <div className="relative grid gap-6 px-5 py-10 md:grid-cols-2 md:gap-8 md:px-10 md:py-14">
            {/* Left: Identity */}
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_12px_rgba(0,255,170,0.8)]" />
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase md:text-xs">
                  {data.introBadge}
                </span>
              </div>

              <h1 className="text-3xl font-black tracking-tighter text-white md:text-5xl lg:text-6xl">
                {data.title}
              </h1>

              {data.subtitle && (
                <p className="font-mono text-sm text-primary/90 md:text-base">
                  {data.subtitle}
                </p>
              )}

              <p className="max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
                {data.description}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={data.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="rounded-full bg-primary px-6 font-bold text-black shadow-[0_0_20px_rgba(0,255,170,0.35)] hover:bg-primary/90">
                    Download CV
                  </Button>
                </a>
                <a href="#publications">
                  <Button
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/5 px-6 font-bold text-white hover:bg-white/10"
                  >
                    View Research
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Terminal Output */}
            <div className="relative rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-primary/90 md:p-6 md:text-xs">
              <pre className="scrollbar-none m-0 max-h-72 overflow-hidden whitespace-pre-wrap">
                {typed}
                <span className="inline-block h-3 w-2 -translate-y-0.5 animate-pulse bg-primary align-middle" />
              </pre>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Pill Badges */}
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-3 md:mt-12 md:gap-4">
        {data.openToWork && (
          <Badge
            variant="outline"
            className="rounded-full border-primary/40 bg-primary/5 px-3 py-1.5 text-[10px] font-semibold text-primary md:px-4 md:py-2 md:text-xs"
          >
            <RiShieldCheckLine size={12} className="mr-2" />
            Open to Work — No Sponsorship Required
          </Badge>
        )}
        <Badge
          variant="outline"
          className="rounded-full border-border bg-secondary/50 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground md:px-4 md:py-2 md:text-xs"
        >
          {data.location}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-border bg-secondary/50 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground md:px-4 md:py-2 md:text-xs"
        >
          {data.sponsorshipInfo}
        </Badge>
      </div>
    </section>
  )
}
