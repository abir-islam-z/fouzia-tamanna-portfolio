import { heroQuery } from "@/lib/queries"
import {
    RiArrowRightUpLine,
    RiDownloadLine,
    RiShieldCheckLine,
    RiTerminalBoxLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
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
    const { data: rawHero } = useSuspenseQuery(heroQuery)
    const h = rawHero as any

    const data: HeroData = {
        title: h.title || FALLBACK_HERO.title,
        subtitle: h.subtitle || FALLBACK_HERO.subtitle,
        description: h.description || FALLBACK_HERO.description,
        introBadge: h.introBadge || FALLBACK_HERO.introBadge,
        location: h.location || FALLBACK_HERO.location,
        sponsorshipInfo: h.sponsorshipInfo || FALLBACK_HERO.sponsorshipInfo,
        openToWork: h.openToWork ?? true,
        resumeUrl: h.resumeUrl || "#",
        logoUrl: h.logoUrl ?? null,
    }

    const [particles, setParticles] = useState<
        Array<{ left: string; top: string; delay: string; duration: string }>
    >([])
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
            {/* HUD floating labels */}
            <div className="pointer-events-none absolute top-20 left-4 z-10 hidden font-label text-[10px] uppercase tracking-[0.3em] text-primary/60 lg:block md:left-8">
                // SECURE_SESSION.0001
            </div>
            <div className="pointer-events-none absolute top-20 right-4 z-10 hidden font-label text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 lg:block md:right-8">
                <span className="status-dot mr-2 inline-block align-middle" />
                ALL_SYSTEMS_NOMINAL
            </div>

            <div className="group relative mx-auto max-w-6xl overflow-hidden border-2 border-primary/40 bg-void-card shadow-[0_0_60px_-15px_rgba(0,255,136,0.25)] transition-all duration-500 cyber-chamfer-xl">
                {/* Terminal Header */}
                <div className="relative z-10 flex items-center justify-between border-b border-border bg-muted/40 px-4 py-3 md:px-6">
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_#ff5f57]" />
                        <span className="h-3 w-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_#febc2e]" />
                        <span className="h-3 w-3 rounded-full bg-[#28c840] shadow-[0_0_6px_#28c840]" />
                        <span className="ml-3 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:inline">
                            ~/fouzia-portfolio — bash
                        </span>
                    </div>
                    <div className="flex items-center gap-2 border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-primary cyber-chamfer-sm md:text-[10px]">
                        <RiTerminalBoxLine size={12} className="text-glow-sm" />
                        SECURE_SESSION
                    </div>
                </div>

                {/* Body */}
                <div className="relative">
                    {/* Background layers */}
                    <div className="absolute inset-0 tech-grid opacity-60" />
                    <div className="absolute inset-0">
                        {particles.map((p, i) => (
                            <div
                                key={i}
                                className="h-1 w-1 rounded-full bg-primary"
                                style={{
                                    position: "absolute",
                                    left: p.left,
                                    top: p.top,
                                    animation: `float ${p.duration} ${p.delay} infinite linear`,
                                    boxShadow: "0 0 8px #00ff88",
                                }}
                            />
                        ))}
                    </div>
                    <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
                    <div className="absolute inset-0 scan-sweep opacity-50" />

                    <div className="relative grid gap-6 px-5 py-10 md:grid-cols-2 md:gap-8 md:px-10 md:py-14">
                        {/* Left: Identity */}
                        <div className="space-y-5 md:space-y-6">
                            <div className="inline-flex items-center gap-2 border border-primary/40 bg-primary/5 px-2.5 py-1 cyber-chamfer-sm">
                                <span className="status-dot" />
                                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">
                                    {data.introBadge}
                                </span>
                            </div>

                            <h1
                                className="cyber-glitch cyber-glitch-anim font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl"
                                data-text={data.title}
                            >
                                {data.title}
                            </h1>

                            {data.subtitle && (
                                <p className="font-mono text-sm text-primary text-glow-sm md:text-base">
                                    {data.subtitle}
                                </p>
                            )}

                            <p className="max-w-xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
                                {data.description}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <a
                                    href={data.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="glitch" size="lg">
                                        <RiDownloadLine size={16} />
                                        Download CV
                                    </Button>
                                </a>
                                <a href="#publications">
                                    <Button variant="outline" size="lg">
                                        View Research
                                        <RiArrowRightUpLine size={16} />
                                    </Button>
                                </a>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
                                <span className="flex items-center gap-1.5">
                                    <RiShieldCheckLine size={12} className="text-primary" />
                                    {data.location}
                                </span>
                                <span className="text-border">|</span>
                                <span>{data.sponsorshipInfo}</span>
                            </div>
                        </div>

                        {/* Right: Terminal Output */}
                        <div className="relative border border-primary/30 bg-background/80 cyber-chamfer">
                            <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-3 py-2">
                                <span className="font-label text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                                    OUT
                                </span>
                                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-primary">
                                    <span className="status-dot h-1.5 w-1.5" />
                                    LIVE
                                </span>
                            </div>
                            <div className="relative p-4 font-mono text-[11px] leading-relaxed text-primary/90 md:p-5 md:text-xs">
                                <pre className="m-0 max-h-72 overflow-hidden whitespace-pre-wrap wrap-break-word">
                                    {typed}
                                    <span className="caret" />
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
