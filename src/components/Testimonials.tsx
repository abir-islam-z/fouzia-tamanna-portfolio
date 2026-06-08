import { testimonialsQuery } from "@/lib/queries"
import { RiDoubleQuotesL } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"

interface TestimonialItem {
  name: string
  role: string
  content: string
}

interface TestimonialsProps {
  sectionConfig?: {
    badge?: string | null
    heading?: string | null
    subtext?: string | null
  }
}

export default function Testimonials({
  sectionConfig,
}: TestimonialsProps = {}) {
  const { data: rawTestimonials } = useSuspenseQuery(testimonialsQuery)
  const testimonials = (rawTestimonials ?? []) as TestimonialItem[]

  if (testimonials.length === 0) return null

  const badge = sectionConfig?.badge ?? "// PEER_REVIEWS.LOG"
  const heading = sectionConfig?.heading ?? (
    <>
      Kind words from <span className="text-gradient-neon-bg">partners</span>
    </>
  )

  return (
    <section
      id="testimonials"
      className="relative border-y border-border/50 bg-muted/20 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 space-y-3 text-center md:mb-16">
          <div className="label-mono">{badge}</div>
          <h2 className="font-display text-3xl leading-none font-bold tracking-wide uppercase md:text-5xl">
            {heading}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <div
              key={i}
              className="group hover:neon-glow-sm cyber-chamfer relative border border-border bg-card/60 p-6 transition-all hover:border-primary md:p-8"
            >
              <RiDoubleQuotesL className="absolute top-6 right-6 size-10 text-primary/15 transition-colors group-hover:text-primary/30 md:size-12" />
              <div className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/40 uppercase">
                SIG_0{i + 1}
              </div>

              <div className="relative space-y-5 pt-6 md:space-y-6">
                <div className="flex items-start gap-2">
                  <span className="text-glow-sm mt-0.5 font-mono text-xs text-primary">
                    {">>"}
                  </span>
                  <div
                    className="prose prose-invert prose-p:my-0 max-w-none flex-1 font-mono text-sm leading-relaxed text-muted-foreground italic md:text-[15px]"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                </div>

                <div className="flex items-center gap-3 border-t border-border/60 pt-4 md:gap-4">
                  <div className="cyber-chamfer-sm flex h-11 w-11 items-center justify-center border border-primary/50 font-display text-base font-bold text-primary md:h-12 md:w-12">
                    {item.name?.[0] ?? "?"}
                  </div>
                  <div>
                    <h4 className="font-display text-xs font-bold tracking-wide uppercase md:text-sm">
                      {item.name}
                    </h4>
                    <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase md:text-xs">
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
