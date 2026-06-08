import { useEffect, useState } from "react"
import { RiDoubleQuotesL } from "@remixicon/react"
import { getTestimonials } from "@/lib/cms"

interface TestimonialItem {
    name: string
    role: string
    content: string
}

/**
 * Cyberpunk Testimonials.
 *
 * - 3-column grid of chamfered cards (stacks on mobile).
 * - Each card has a terminal ">>" prompt leading into the quote.
 * - Author block uses a chamfered monogram instead of a round avatar.
 */
export default function Testimonials() {
    const [testimonials, setTestimonials] = useState<TestimonialItem[]>([])

    useEffect(() => {
        async function loadData() {
            try {
                const data = await getTestimonials()
                if (data && data.length > 0) setTestimonials(data as TestimonialItem[])
            } catch (error) {
                console.error("Failed to fetch testimonials.", error)
            }
        }
        loadData()
    }, [])

    if (testimonials.length === 0) return null

    return (
        <section
            id="testimonials"
            className="relative border-y border-border/50 bg-muted/20 px-4 py-16 md:px-6 md:py-24"
        >
            <div className="mx-auto max-w-6xl">
                <div className="mb-12 space-y-3 text-center md:mb-16">
                    <div className="label-mono">// PEER_REVIEWS.LOG</div>
                    <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-wide md:text-5xl">
                        Kind words from{" "}
                        <span className="text-gradient-neon-bg">partners</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                    {testimonials.map((item, i) => (
                        <div
                            key={i}
                            className="group relative border border-border bg-card/60 p-6 transition-all hover:border-primary hover:neon-glow-sm cyber-chamfer md:p-8"
                        >
                            {/* Quote mark, terminal style */}
                            <RiDoubleQuotesL
                                className="absolute right-6 top-6 size-10 text-primary/15 transition-colors group-hover:text-primary/30 md:size-12"
                            />
                            {/* Top corner index */}
                            <div className="absolute left-4 top-4 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                                SIG_0{i + 1}
                            </div>

                            <div className="relative space-y-5 pt-6 md:space-y-6">
                                <div className="flex items-start gap-2">
                                    <span className="mt-0.5 font-mono text-xs text-primary text-glow-sm">
                                        {">>"}
                                    </span>
                                    <p className="flex-1 font-mono text-sm italic leading-relaxed text-muted-foreground md:text-[15px]">
                                        &ldquo;{item.content}&rdquo;
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 border-t border-border/60 pt-4 md:gap-4">
                                    <div className="flex h-11 w-11 items-center justify-center border border-primary/50 font-display text-base font-bold text-primary cyber-chamfer-sm md:h-12 md:w-12">
                                        {item.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-display text-xs font-bold uppercase tracking-wide md:text-sm">
                                            {item.name}
                                        </h4>
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:text-xs">
                                            {item.role}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
