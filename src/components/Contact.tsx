import {
    RiGithubFill,
    RiLinkedinBoxFill,
    RiMailFill,
    RiMailLine,
    RiTwitterXFill,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { footerQuery, useSubmitContact } from "@/lib/queries"

interface FooterData {
    bio: string
    email: string
    linkedin: string
    github: string
    twitter: string
    availability: string
}

const FALLBACK_FOOTER: FooterData = {
    bio: "Full Stack Developer specializing in modern web technologies. Based in Silicon Valley, CA.",
    email: "hello@johndoe.com",
    linkedin: "#",
    github: "#",
    twitter: "#",
    availability: "Open for Opportunities",
}

export default function Contact() {
    const { data: rawFooter } = useSuspenseQuery(footerQuery)
    const f = rawFooter as any
    const footer: FooterData = {
        bio: f?.bio || FALLBACK_FOOTER.bio,
        email: f?.email || FALLBACK_FOOTER.email,
        linkedin: f?.linkedin || FALLBACK_FOOTER.linkedin,
        github: f?.github || FALLBACK_FOOTER.github,
        twitter: f?.twitter || FALLBACK_FOOTER.twitter,
        availability: f?.availability || FALLBACK_FOOTER.availability,
    }

    const submitMutation = useSubmitContact()
    const [success, setSuccess] = useState(false)

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
            const errorMessage =
                err?.message || "Something went wrong. Please try again later."
            toast.error(errorMessage)
        }
    }

    return (
        <section
            id="contact"
            className="circuit-bg relative border-t border-border/50 px-4 py-16 md:px-6 md:py-24"
        >
            <div className="mx-auto grid max-w-6xl items-start gap-12 md:gap-16 lg:grid-cols-2">
                {/* Left Side */}
                <div className="space-y-8 text-center lg:text-left">
                    <div>
                        <div className="label-mono mb-4">// CONTACT.SH</div>
                        <h2 className="font-display mb-6 text-4xl font-bold uppercase leading-none tracking-wide md:mb-8 md:text-6xl">
                            Security Analyst{" "}
                            <br className="hidden md:block" />
                            <span className="cyber-glitch text-gradient-neon-bg" data-text="who hunts?">
                                who hunts?
                            </span>
                        </h2>
                        <p className="font-mono text-base leading-relaxed text-muted-foreground md:text-lg">
                            Let&apos;s build something intelligent together. I&apos;m always open
                            to discussing new projects, partnerships, or opportunities to join
                            innovative teams.
                        </p>
                    </div>

                    <div className="space-y-3 font-mono md:space-y-4">
                        <a
                            href={`mailto:${footer.email}`}
                            className="group flex items-center justify-center gap-3 text-sm transition-colors hover:text-primary md:justify-start md:text-base"
                        >
                            <span className="text-primary text-glow-sm">{">"}</span>
                            <span className="font-bold uppercase tracking-widest group-hover:text-glow">
                                {footer.email}
                            </span>
                        </a>
                        {footer.linkedin && (
                            <a
                                href={footer.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-center gap-3 text-sm transition-colors hover:text-primary md:justify-start md:text-base"
                            >
                                <span className="text-primary text-glow-sm">{">"}</span>
                                <span className="font-bold uppercase tracking-widest group-hover:text-glow">
                                    linkedin.com/in/fouzia
                                </span>
                            </a>
                        )}
                        <a
                            href={footer.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-center gap-3 text-sm transition-colors hover:text-primary md:justify-start md:text-base"
                        >
                            <span className="text-primary text-glow-sm">{">"}</span>
                            <span className="font-bold uppercase tracking-widest group-hover:text-glow">
                                github.com/fouzia
                            </span>
                        </a>
                    </div>
                </div>

                {/* Right Side - Terminal Form */}
                <div className="relative border border-border bg-card/70 transition-all hover:border-primary hover:neon-glow cyber-chamfer-lg">
                    <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_6px_#ff5f57]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] shadow-[0_0_6px_#febc2e]" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] shadow-[0_0_6px_#28c840]" />
                        <span className="ml-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                            ~/message.out — bash
                        </span>
                    </div>

                    <div className="p-6 md:p-8">
                        {success ? (
                            <div className="space-y-5 py-8 text-center md:py-12">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center border border-primary bg-primary/10 text-primary cyber-chamfer md:h-20 md:w-20">
                                    <RiMailLine size={32} className="text-glow" />
                                </div>
                                <h3 className="font-display text-2xl font-bold uppercase tracking-wide md:text-3xl">
                                    Message Sent!
                                </h3>
                                <p className="font-mono text-sm text-muted-foreground">
                                    Thank you for reaching out. I&apos;ll get back to you as soon
                                    as possible.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSuccess(false)}
                                    className="mt-2 cyber-chamfer-sm"
                                >
                                    Send another message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="name"
                                        className="block font-label text-[10px] uppercase tracking-[0.22em] text-primary"
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
                                        className="block font-label text-[10px] uppercase tracking-[0.22em] text-primary"
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
                                        className="block font-label text-[10px] uppercase tracking-[0.22em] text-primary"
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

            {/* Embedded footer grid */}
            <div className="mx-auto mt-16 max-w-7xl md:mt-24">
                <div className="grid gap-12 border-t border-border/50 pt-12 text-center md:grid-cols-2 md:gap-10 md:pt-16 md:text-left lg:grid-cols-4">
                    <div className="space-y-4 md:space-y-6">
                        <div className="font-display text-2xl font-black uppercase tracking-wide italic md:justify-start">
                            FT
                        </div>
                        <p className="mx-auto max-w-62.5 font-mono text-sm leading-relaxed text-muted-foreground md:mx-0">
                            {footer.bio}
                        </p>
                    </div>

                    <div className="space-y-4 md:space-y-6">
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

                    <div className="space-y-4 md:space-y-6">
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

                    <div className="space-y-4 md:space-y-6">
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
            </div>
        </section>
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
