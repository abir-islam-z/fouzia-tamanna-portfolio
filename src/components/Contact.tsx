import { footerQuery, siteSettingsQuery, useSubmitContact } from "@/lib/queries"
import { RiMailLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"

interface FooterData {
  bio: string
  email: string
  linkedin: string
  github: string
  twitter: string
  availability: string
}

interface SiteSettings {
  contactHeading: string | null
  contactSubtext: string | null
}

interface ContactProps {
  sectionConfig?: {
    badge?: string | null
    heading?: string | null
    subtext?: string | null
  }
}

export default function Contact({ sectionConfig }: ContactProps = {}) {
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

  const submitMutation = useSubmitContact()
  const [success, setSuccess] = useState(false)

  const heading = sectionConfig?.heading ?? (
    <>
      Security Analyst <br className="hidden md:block" />
      <span
        className="cyber-glitch text-gradient-neon-bg"
        data-text="who hunts?"
      >
        who hunts?
      </span>
    </>
  )

  const defaultSubtext =
    "Let's build something intelligent together. I'm always open to discussing new projects, partnerships, or opportunities to join innovative teams."
  const subtext = sectionConfig?.subtext ?? s?.contactSubtext ?? defaultSubtext

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())

    try {
      await submitMutation.mutateAsync({
        name: String(data.name || ""),
        email: String(data.email || ""),
        message: String(data.message || ""),
      })
      setSuccess(true)
      e.currentTarget.reset()
      toast.success("Message sent! I'll get back to you soon.")
    } catch (err: any) {
      toast.error(
        err?.message || "Something went wrong. Please try again later."
      )
    }
  }

  return (
    <section
      id="contact"
      className="circuit-bg relative border-t border-border/50 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-start gap-12 md:gap-16 lg:grid-cols-2">
        <div className="space-y-8 text-center lg:text-left">
          <div>
            <div className="label-mono mb-4">
              {sectionConfig?.badge ?? "// CONTACT.SH"}
            </div>
            <h2 className="mb-6 font-display text-4xl leading-none font-bold tracking-wide uppercase md:mb-8 md:text-6xl">
              {heading}
            </h2>
            <p className="font-mono text-base leading-relaxed text-muted-foreground md:text-lg">
              {subtext}
            </p>
          </div>

          {footer.email && (
            <div className="space-y-3 font-mono md:space-y-4">
              <a
                href={`mailto:${footer.email}`}
                className="group flex items-center justify-center gap-3 text-sm transition-colors hover:text-primary md:justify-start md:text-base"
              >
                <span className="text-glow-sm text-primary">{">"}</span>
                <span className="group-hover:text-glow font-bold tracking-widest uppercase">
                  {footer.email}
                </span>
              </a>
              {footer.linkedin && footer.linkedin !== "#" && (
                <a
                  href={footer.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 text-sm transition-colors hover:text-primary md:justify-start md:text-base"
                >
                  <span className="text-glow-sm text-primary">{">"}</span>
                  <span className="group-hover:text-glow font-bold tracking-widest uppercase">
                    linkedin.com/in/fouzia
                  </span>
                </a>
              )}
              {footer.github && footer.github !== "#" && (
                <a
                  href={footer.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 text-sm transition-colors hover:text-primary md:justify-start md:text-base"
                >
                  <span className="text-glow-sm text-primary">{">"}</span>
                  <span className="group-hover:text-glow font-bold tracking-widest uppercase">
                    github.com/fouzia
                  </span>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="hover:neon-glow cyber-chamfer-lg relative border border-border bg-card/70 transition-all hover:border-primary">
          <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_6px_#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[0_0_6px_#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[0_0_6px_#28c840]" />
            <span className="ml-3 font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              ~/message.out — bash
            </span>
          </div>

          <div className="p-6 md:p-8">
            {success ? (
              <div className="space-y-5 py-8 text-center md:py-12">
                <div className="cyber-chamfer mx-auto flex h-16 w-16 items-center justify-center border border-primary bg-primary/10 text-primary md:h-20 md:w-20">
                  <RiMailLine size={32} className="text-glow" />
                </div>
                <h3 className="font-display text-2xl font-bold tracking-wide uppercase md:text-3xl">
                  Message Sent!
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  Thank you for reaching out. I&apos;ll get back to you as soon
                  as possible.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSuccess(false)}
                  className="cyber-chamfer-sm mt-2"
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="block font-label text-[10px] tracking-[0.22em] text-primary uppercase"
                  >
                    $ name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block font-label text-[10px] tracking-[0.22em] text-primary uppercase"
                  >
                    $ email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="hello@example.com"
                    required
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="block font-label text-[10px] tracking-[0.22em] text-primary uppercase"
                  >
                    $ message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project..."
                    required
                    className="min-h-32 md:min-h-36"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  variant="glitch"
                  size="lg"
                  className="h-12 w-full md:h-14"
                >
                  {submitMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="caret h-3 w-3" />
                      TRANSMITTING...
                    </span>
                  ) : (
                    "EXECUTE_SEND"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
