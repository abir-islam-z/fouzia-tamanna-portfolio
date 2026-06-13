import { publicationsQuery } from "@/lib/queries"
import {
  RiBookOpenLine,
  RiExternalLinkLine,
  RiFileTextLine,
  RiUserLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"

interface PublicationItem {
  id: string
  title: string
  authors: string
  venue: string
  year: string
  abstract: string
  link: string | null
  tags: string
  type: string
  isPublished: boolean
  order: number
}

interface PublicationsProps {
  sectionConfig?: {
    badge?: string | null
    heading?: string | null
    subtext?: string | null
  }
}

const TYPE_LABEL: Record<string, string> = {
  journal: "Journal",
  conference: "Conference",
  preprint: "Preprint",
  workshop: "Workshop",
  "book-chapter": "Book Chapter",
}

const TYPE_VARIANT: Record<string, string> = {
  journal: "border-primary/60 bg-primary/10 text-primary",
  conference: "border-cyan-500/60 bg-cyan-500/10 text-cyan-400",
  preprint: "border-amber-500/60 bg-amber-500/10 text-amber-400",
  workshop: "border-violet-500/60 bg-violet-500/10 text-violet-400",
  "book-chapter": "border-rose-500/60 bg-rose-500/10 text-rose-400",
}

export default function Publications({
  sectionConfig,
}: PublicationsProps = {}) {
  const { data: rawPublications } = useSuspenseQuery(publicationsQuery())
  const publications = (rawPublications ?? []) as PublicationItem[]

  if (publications.length === 0) return null

  const badge = sectionConfig?.badge ?? "// RESEARCH · PUBLICATIONS"
  const heading = sectionConfig?.heading ?? (
    <>
      Selected <span className="text-gradient-neon-bg">Publications</span>
    </>
  )
  const subtext = sectionConfig?.subtext ?? (
    <>
      Peer-reviewed research at the intersection of{" "}
      <span className="text-foreground">network security</span>,{" "}
      <span className="text-foreground">machine learning</span>, and{" "}
      <span className="text-foreground">cyber-defence systems</span>.
    </>
  )

  return (
    <section
      id="publications"
      className="tech-grid relative border-t border-border/50 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:mb-14">
          <div className="label-mono mb-3 flex items-center justify-center gap-2">
            <RiBookOpenLine size={12} />
            {badge}
          </div>
          <h2 className="font-display text-3xl leading-none font-bold tracking-wide uppercase md:text-5xl">
            {heading}
          </h2>
          {subtext && (
            <p className="mx-auto mt-4 max-w-2xl font-mono text-sm text-muted-foreground md:text-base">
              {subtext}
            </p>
          )}
        </div>

        <div className="space-y-5 md:space-y-6">
          {publications.map((pub, i) => (
            <div
              key={pub.id ?? i}
              className="group hover:neon-glow-sm cyber-chamfer relative overflow-hidden border border-border bg-card/60 p-5 transition-all hover:border-primary md:p-7"
            >
              <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-primary to-primary transition-transform duration-300 group-hover:scale-y-100" />

              <div className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.2em] text-muted-foreground/40 uppercase">
                PUB_0{i + 1}
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                <div className="flex shrink-0 flex-row items-center gap-3 md:w-32 md:flex-col md:items-start md:gap-3">
                  <span className="text-glow-md font-display text-3xl leading-none font-black text-primary md:text-4xl">
                    {pub.year}
                  </span>
                  <span
                    className={`cyber-chamfer-sm border px-2.5 py-1 font-label text-[9px] tracking-[0.2em] uppercase ${
                      TYPE_VARIANT[pub.type] ?? TYPE_VARIANT.journal
                    }`}
                  >
                    {TYPE_LABEL[pub.type] ?? pub.type}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <h3 className="font-display text-lg leading-tight font-bold tracking-wide uppercase md:text-xl">
                    {pub.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground md:text-xs">
                    <span className="flex items-center gap-1.5">
                      <RiUserLine size={12} className="text-primary/70" />
                      {pub.authors}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <RiFileTextLine size={12} className="text-primary/70" />
                      {pub.venue}
                    </span>
                  </div>

                  {pub.abstract && (
                    <div
                      className="prose prose-invert max-w-none font-mono text-sm leading-relaxed text-muted-foreground md:text-[15px]"
                      dangerouslySetInnerHTML={{ __html: pub.abstract }}
                    />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {(pub.tags || "")
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, j) => (
                          <span
                            key={j}
                            className="cyber-chamfer-sm border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] tracking-widest text-muted-foreground uppercase"
                          >
                            #{tag}
                          </span>
                        ))}
                    </div>

                    {pub.link && pub.link !== "" && (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link hover:text-glow inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-primary uppercase transition-colors"
                      >
                        READ_PAPER
                        <RiExternalLinkLine
                          size={12}
                          className="transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                        />
                      </a>
                    )}
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
