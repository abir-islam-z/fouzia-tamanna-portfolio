import { getFooter } from "@/lib/cms"
import {
    RiGithubFill,
    RiLinkedinBoxFill,
    RiMailFill,
    RiShieldKeyholeLine,
    RiTwitterXFill,
} from "@remixicon/react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"

interface FooterData {
    bio: string
    email: string
    linkedin: string
    github: string
    twitter: string
    availability: string
}

const FALLBACK_FOOTER: FooterData = {
    bio: "Network Security & SOC Analyst focused on threat detection, incident response, and systems security. Based in London, UK.",
    email: "hello@example.com",
    linkedin: "#",
    github: "#",
    twitter: "#",
    availability: "Open for SOC Analyst & Network Security Roles",
}

/**
 * Cyberpunk Footer.
 *
 * - Top section: brand, contact, social, availability.
 * - Marquee strip: scrolling terminal text (signature cyberpunk touch).
 * - Bottom bar: monospace legal/links.
 */
export default function Footer() {
    const [footer, setFooter] = useState<FooterData>(FALLBACK_FOOTER)
    const [year, setYear] = useState<number>(new Date().getFullYear())

    useEffect(() => {
        async function loadFooter() {
            try {
                const data = await getFooter()
                if (data) {
                    setFooter({
                        bio: data.bio || FALLBACK_FOOTER.bio,
                        email: data.email || FALLBACK_FOOTER.email,
                        linkedin: data.linkedin || FALLBACK_FOOTER.linkedin,
                        github: data.github || FALLBACK_FOOTER.github,
                        twitter: data.twitter || FALLBACK_FOOTER.twitter,
                        availability: data.availability || FALLBACK_FOOTER.availability,
                    })
                }
            } catch (err) {
                console.error("Failed to fetch footer data.", err)
            }
        }
        loadFooter()
        setYear(new Date().getFullYear())
    }, [])

    return (
        <footer className="relative border-t border-border/60">
            {/* Scrolling marquee strip */}
            <div className="relative overflow-hidden border-y border-primary/30 bg-muted/40">
                <div className="flex animate-marquee whitespace-nowrap py-3 font-mono text-xs uppercase tracking-[0.3em] text-primary/80">
                    {[...Array(2)].map((_, dup) => (
                        <div key={dup} className="flex shrink-0 items-center gap-12 px-6">
                            <span>// SYS://fouzia_tamanna</span>
                            <span className="text-accent-secondary">SOC ANALYST</span>
                            <span>// LONDON, UK</span>
                            <span className="text-accent-tertiary">// THREAT_HUNT // INCIDENT_RESPONSE</span>
                            <span>// OPEN_TO_WORK</span>
                            <span className="text-accent-secondary">// ZERO_TRUST</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 py-16 md:px-6 md:py-20">
                <div className="mx-auto max-w-7xl">
                    {/* Footer Grid */}
                    <div className="grid gap-12 pt-4 text-center md:grid-cols-2 md:gap-10 md:text-left lg:grid-cols-4">
                        {/* Brand */}
                        <div className="space-y-5 md:space-y-6">
                            <div className="flex items-center justify-center gap-3 md:justify-start">
                                <span className="relative flex h-9 w-9 items-center justify-center border border-primary text-primary cyber-chamfer-sm">
                                    <RiShieldKeyholeLine size={20} />
                                </span>
                                <span className="font-display text-base font-bold uppercase tracking-[0.18em] md:text-lg">
                                    <span className="text-primary text-glow-sm">Fouzia</span>
                                    <span className="text-foreground"> Tamanna</span>
                                </span>
                            </div>
                            <p className="mx-auto max-w-[250px] font-mono text-sm leading-relaxed text-muted-foreground md:mx-0">
                                {footer.bio}
                            </p>
                        </div>

                        {/* Say Hello */}
                        <div className="space-y-5 md:space-y-6">
                            <h4 className="font-label text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">
                                Say Hello
                            </h4>
                            <div className="flex flex-col gap-2 font-mono">
                                <a
                                    href={`mailto:${footer.email}`}
                                    className="text-sm font-bold transition-colors hover:text-primary"
                                >
                                    {footer.email}
                                </a>
                                {footer.linkedin && footer.linkedin !== "#" && (
                                    <a
                                        href={footer.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-bold transition-colors hover:text-primary"
                                    >
                                        LinkedIn Profile
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Elsewhere */}
                        <div className="space-y-5 md:space-y-6">
                            <h4 className="font-label text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">
                                Elsewhere
                            </h4>
                            <div className="flex justify-center gap-3 md:justify-start">
                                {footer.github && footer.github !== "#" && (
                                    <SocialIcon
                                        href={footer.github}
                                        label="GitHub"
                                        icon={<RiGithubFill />}
                                    />
                                )}
                                {footer.linkedin && footer.linkedin !== "#" && (
                                    <SocialIcon
                                        href={footer.linkedin}
                                        label="LinkedIn"
                                        icon={<RiLinkedinBoxFill />}
                                    />
                                )}
                                {footer.twitter && footer.twitter !== "#" && (
                                    <SocialIcon
                                        href={footer.twitter}
                                        label="Twitter"
                                        icon={<RiTwitterXFill />}
                                    />
                                )}
                                <SocialIcon
                                    href={`mailto:${footer.email}`}
                                    label="Email"
                                    icon={<RiMailFill />}
                                />
                            </div>
                        </div>

                        {/* Availability */}
                        <div className="space-y-5 md:space-y-6">
                            <h4 className="font-label text-[10px] uppercase tracking-[0.22em] text-primary md:text-xs">
                                Availability
                            </h4>
                            <div className="space-y-1">
                                <div className="flex items-center justify-center gap-2 md:justify-start">
                                    <span className="status-dot" />
                                    <p className="font-mono text-sm font-bold uppercase tracking-wide">
                                        {footer.availability}
                                    </p>
                                </div>
                                <p className="font-mono text-xs text-muted-foreground">
                                    SOC · Network Security · Incident Response
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 md:flex-row md:text-[10px]">
                        <div>© {year} Fouzia Tamanna. All Rights Reserved.</div>
                        <div className="flex gap-6">
                            <a href="#" className="transition-colors hover:text-primary">
                                Privacy Policy
                            </a>
                            <a href="#" className="transition-colors hover:text-primary">
                                Terms of Service
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

function SocialIcon({
    icon,
    href,
    label,
}: {
    icon: React.ReactNode
    href: string
    label: string
}) {
    return (
        <Button
            variant="outline"
            size="icon"
            asChild
            aria-label={label}
            className="h-10 w-10 border-border text-muted-foreground hover:border-primary hover:text-primary cyber-chamfer-sm"
        >
            <a href={href} target="_blank" rel="noopener noreferrer">
                {icon}
            </a>
        </Button>
    )
}
