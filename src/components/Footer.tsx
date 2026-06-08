import { footerQuery, siteSettingsQuery } from "@/lib/queries"
import {
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMailFill,
  RiShieldKeyholeLine,
  RiTwitterXFill,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"

interface FooterData {
  bio: string
  email: string
  linkedin: string
  github: string
  twitter: string
  availability: string
}

interface SiteSettings {
  marqueeItems: string | null
}

export default function Footer() {
  const { data: rawFooter } = useSuspenseQuery(footerQuery)
  const { data: rawSettings } = useSuspenseQuery(siteSettingsQuery)
  const f = rawFooter as any
  const s = rawSettings as SiteSettings | null

  const footer: FooterData = {
    bio: f?.bio ?? "",
    email: f?.email ?? "",
    linkedin: f?.linkedin ?? "#",
    github: f?.github ?? "#",
    twitter: f?.twitter ?? "#",
    availability: f?.availability ?? "",
  }

  const [year] = useState<number>(new Date().getFullYear())

  if (!footer.bio && !footer.email) return null

  const marqueeTokens = (s?.marqueeItems ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)

  return (
    <footer className="relative border-t border-border/60">
      {marqueeTokens.length > 0 && (
        <div className="relative overflow-hidden border-y border-primary/30 bg-muted/40">
          <div className="flex animate-marquee py-3 font-mono text-xs tracking-[0.3em] whitespace-nowrap text-primary/80 uppercase">
            {[...Array(2)].map((_, dup) => (
              <div key={dup} className="flex shrink-0 items-center gap-12 px-6">
                {marqueeTokens.map((token, i) => (
                  <span key={i}>
                    {token.startsWith("//") || token.startsWith("SOC") ? (
                      token
                    ) : (
                      <>
                        <span className="text-primary/40">//</span>{" "}
                        {token.replace(/_/g, " ")}
                      </>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 pt-4 text-center md:grid-cols-2 md:gap-10 md:text-left lg:grid-cols-4">
            <div className="space-y-5 md:space-y-6">
              <div className="flex items-center justify-center gap-3 md:justify-start">
                <span className="cyber-chamfer-sm relative flex h-9 w-9 items-center justify-center border border-primary text-primary">
                  <RiShieldKeyholeLine size={20} />
                </span>
                <span className="font-display text-base font-bold tracking-[0.18em] uppercase md:text-lg">
                  <span className="text-glow-sm text-primary">Fouzia</span>
                  <span className="text-foreground"> Tamanna</span>
                </span>
              </div>
              {footer.bio && (
                <p className="mx-auto max-w-62.5 font-mono text-sm leading-relaxed text-muted-foreground md:mx-0">
                  {footer.bio}
                </p>
              )}
            </div>

            <div className="space-y-5 md:space-y-6">
              <h4 className="font-label text-[10px] tracking-[0.22em] text-primary uppercase md:text-xs">
                Say Hello
              </h4>
              <div className="flex flex-col gap-2 font-mono">
                {footer.email && (
                  <a
                    href={`mailto:${footer.email}`}
                    className="text-sm font-bold transition-colors hover:text-primary"
                  >
                    {footer.email}
                  </a>
                )}
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

            <div className="space-y-5 md:space-y-6">
              <h4 className="font-label text-[10px] tracking-[0.22em] text-primary uppercase md:text-xs">
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
                {footer.email && (
                  <SocialIcon
                    href={`mailto:${footer.email}`}
                    label="Email"
                    icon={<RiMailFill />}
                  />
                )}
              </div>
            </div>

            <div className="space-y-5 md:space-y-6">
              <h4 className="font-label text-[10px] tracking-[0.22em] text-primary uppercase md:text-xs">
                Availability
              </h4>
              <p className="font-mono text-sm font-bold transition-colors hover:text-primary">
                {footer.availability}
              </p>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 md:flex-row">
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              © {year} · Fouzia Tamanna
            </p>
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground/60 uppercase">
              v2.6.4 · built with care
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel="noopener noreferrer"
      aria-label={label}
      className="cyber-chamfer-sm flex h-9 w-9 items-center justify-center border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
    >
      <span className="text-base">{icon}</span>
    </a>
  )
}
