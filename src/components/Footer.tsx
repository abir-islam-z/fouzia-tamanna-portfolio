import { useEffect, useState } from "react"
import {
  RiGithubFill,
  RiLinkedinBoxFill,
  RiMailFill,
  RiShieldKeyholeLine,
  RiTwitterXFill,
} from "@remixicon/react"
import { Button } from "./ui/button"
import { getFooter } from "@/lib/cms"

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
    <footer className="border-t border-border px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Footer Grid */}
        <div className="grid gap-12 pt-8 text-center md:grid-cols-2 md:gap-10 md:text-left lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-center gap-2 text-xl font-black tracking-tighter md:justify-start">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <RiShieldKeyholeLine size={20} />
              </span>
              <span>
                <span className="text-primary">Fouzia</span>
                <span className="text-foreground"> Tamanna</span>
              </span>
            </div>
            <p className="mx-auto max-w-62.5 text-sm leading-relaxed text-muted-foreground md:mx-0">
              {footer.bio}
            </p>
          </div>

          {/* Say Hello */}
          <div className="space-y-4 md:space-y-6">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase md:text-xs">
              Say Hello
            </h4>
            <div className="flex flex-col space-y-2">
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
          <div className="space-y-4 md:space-y-6">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase md:text-xs">
              Elsewhere
            </h4>
            <div className="flex justify-center gap-4 md:justify-start">
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
          <div className="space-y-4 md:space-y-6">
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-primary uppercase md:text-xs">
              Availability
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary shadow-[0_0_8px_rgba(0,255,170,0.7)]" />
                <p className="text-sm font-bold">{footer.availability}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                SOC · Network Security · Incident Response
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/20 pt-8 font-mono text-[9px] font-bold tracking-widest text-muted-foreground/40 uppercase md:flex-row md:text-[10px]">
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
      variant="ghost"
      size="icon"
      asChild
      aria-label={label}
      className="h-10 w-10 rounded-xl border border-border bg-secondary text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        {icon}
      </a>
    </Button>
  )
}
