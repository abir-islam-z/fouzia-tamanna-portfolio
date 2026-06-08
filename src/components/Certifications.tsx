import { getCertifications } from "@/lib/cms"
import { RiShieldCheckLine, RiExternalLinkLine } from "@remixicon/react"
import { useEffect, useState } from "react"

interface CertificationItem {
    title: string
    issuer: string
    date: string
    link?: string | null
}

/**
 * Cyberpunk Certifications.
 *
 * - Terminal-style list — each cert is a row in a monospace log.
 * - Date appears as a "[YYYY]" tag, like a commit timestamp.
 * - Hover reveals an external link chevron.
 */
export default function Certifications() {
    const [certs, setCerts] = useState<Array<CertificationItem>>([])

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getCertifications()
                if (data && data.length > 0) setCerts(data as Array<CertificationItem>)
            } catch (error) {
                console.error("Failed to fetch certifications.", error)
            }
        }
        loadData()
    }, [])

    if (certs.length === 0) return null

    return (
        <section
            id="certifications"
            className="relative px-4 py-16 md:px-6 md:py-24"
        >
            <div className="mx-auto max-w-4xl">
                <div className="mb-10 flex items-center gap-4 md:mb-14">
                    <div className="relative flex h-12 w-12 items-center justify-center border border-primary text-primary cyber-chamfer md:h-14 md:w-14">
                        <RiShieldCheckLine className="size-6 text-glow-sm md:size-7" />
                        <span className="status-dot absolute -right-1 -top-1" />
                    </div>
                    <div>
                        <div className="label-mono mb-1">// CREDENTIALS.CRT</div>
                        <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-wide md:text-3xl">
                            Certifications
                        </h2>
                        <p className="mt-1 font-mono text-xs text-muted-foreground md:text-sm">
                            Industry-recognized security credentials.
                        </p>
                    </div>
                </div>

                <div className="border border-border cyber-chamfer">
                    {certs.map((item, i) => {
                        const Wrapper = item.link && item.link !== "#" ? "a" : "div"
                        const wrapperProps: Record<string, string> = {}
                        if (Wrapper === "a") {
                            wrapperProps.href = item.link!
                            wrapperProps.target = "_blank"
                            wrapperProps.rel = "noopener noreferrer"
                        }
                        return (
                            <Wrapper
                                key={i}
                                {...wrapperProps}
                                className={`group flex flex-col items-start justify-between gap-3 border-b border-border/60 p-5 transition-all last:border-b-0 hover:bg-primary/5 md:flex-row md:items-center md:gap-6 md:p-6 ${
                                    Wrapper === "a" ? "cursor-pointer" : ""
                                }`}
                            >
                                <div className="flex w-full items-start gap-3 md:gap-4">
                                    <span className="mt-1 font-mono text-xs text-primary text-glow-sm">
                                        ▸
                                    </span>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="font-display text-base font-bold uppercase leading-tight tracking-wide transition-colors group-hover:text-primary md:text-lg">
                                            {item.title}
                                        </h4>
                                        <p className="font-mono text-xs text-muted-foreground md:text-sm">
                                            {item.issuer}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 self-end md:self-auto">
                                    <span className="border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-primary cyber-chamfer-sm">
                                        [{item.date}]
                                    </span>
                                    {Wrapper === "a" && (
                                        <RiExternalLinkLine
                                            size={14}
                                            className="text-muted-foreground transition-colors group-hover:text-primary"
                                        />
                                    )}
                                </div>
                            </Wrapper>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
