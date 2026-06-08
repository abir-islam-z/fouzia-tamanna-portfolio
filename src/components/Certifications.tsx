import { certificationsQuery } from "@/lib/queries"
import { RiExternalLinkLine, RiShieldCheckLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"

interface CertificationItem {
  title: string
  issuer: string
  date: string
  link?: string | null
}

interface CertificationsProps {
  sectionConfig?: {
    badge?: string | null
    heading?: string | null
    subtext?: string | null
  }
}

export default function Certifications({
  sectionConfig,
}: CertificationsProps = {}) {
  const { data: rawCerts } = useSuspenseQuery(certificationsQuery)
  const certs = (rawCerts ?? []) as CertificationItem[]

  if (certs.length === 0) return null

  const badge = sectionConfig?.badge ?? "// CREDENTIALS.CRT"
  const heading = sectionConfig?.heading ?? "Certifications"
  const subtext =
    sectionConfig?.subtext ?? "Industry-recognized security credentials."

  return (
    <section
      id="certifications"
      className="relative px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex items-center gap-4 md:mb-14">
          <div className="cyber-chamfer relative flex h-12 w-12 items-center justify-center border border-primary text-primary md:h-14 md:w-14">
            <RiShieldCheckLine className="text-glow-sm size-6 md:size-7" />
            <span className="status-dot absolute -top-1 -right-1" />
          </div>
          <div>
            <div className="label-mono mb-1">{badge}</div>
            <h2 className="font-display text-2xl leading-none font-bold tracking-wide uppercase md:text-3xl">
              {heading}
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground md:text-sm">
              {subtext}
            </p>
          </div>
        </div>

        <div className="cyber-chamfer border border-border">
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
                  <span className="text-glow-sm mt-1 font-mono text-xs text-primary">
                    ▸
                  </span>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-display text-base leading-tight font-bold tracking-wide uppercase transition-colors group-hover:text-primary md:text-lg">
                      {item.title}
                    </h4>
                    <p className="font-mono text-xs text-muted-foreground md:text-sm">
                      {item.issuer}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                  <span className="cyber-chamfer-sm border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
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
