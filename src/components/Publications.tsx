import { publicationsQuery } from "@/lib/queries"
import {
  RiBookOpenLine,
  RiExternalLinkLine,
  RiFileTextLine,
  RiUserLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"

interface PublicationItem {
  id: number
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

const FALLBACK_PUBLICATIONS: Array<PublicationItem> = [
  {
    id: 1,
    title:
      "A Survey of Machine-Learning Approaches for Encrypted Traffic Classification in Zero-Trust Networks",
    authors: "F. Tamanna, M. Rahman, A. Hossain",
    venue: "IEEE Transactions on Information Forensics and Security",
    year: "2025",
    abstract:
      "We survey recent ML-based techniques for classifying encrypted network traffic in zero-trust architectures, compare feature-engineering vs. deep-packet approaches, and propose a hybrid pipeline that achieves 96.4% F1-score on the CIC-IDS-2017 and USTC-TFC2016 datasets while preserving user privacy.",
    link: "https://doi.org/10.1109/TIFS.2025.0000000",
    tags: "Encrypted Traffic, Machine Learning, Zero Trust, Network Security",
    type: "journal",
    isPublished: true,
    order: 1,
  },
  {
    id: 2,
    title:
      "Detecting Lateral Movement Using Graph Neural Networks on Authentication Logs",
    authors: "F. Tamanna, S. Khan",
    venue:
      "Proceedings of the ACM Conference on Computer and Communications Security (CCS)",
    year: "2024",
    abstract:
      "We present GNN-LMD, a graph-neural-network detector that models authentication events as a temporal graph and identifies lateral-movement attack chains with 0.91 AUC. Evaluated against the LANL and OpTC datasets, GNN-LMD detects attacks on average 2.3 hours earlier than baseline rule-based SIEM correlations.",
    link: "https://doi.org/10.1145/0000000",
    tags: "Lateral Movement, GNN, SOC, Anomaly Detection",
    type: "conference",
    isPublished: true,
    order: 2,
  },
  {
    id: 3,
    title:
      "Hardening Consumer IoT Devices Against Mirai-Style Botnet Recruitment",
    authors: "F. Tamanna",
    venue: "Workshop on Security and Privacy of Cyber-Physical Systems (SPCPS)",
    year: "2023",
    abstract:
      "We analyse 14 default-credential scanning campaigns against consumer IoT devices and propose a lightweight firmware-level hardening framework that blocks 98.7% of Mirai-style brute-force attempts with under 2% performance overhead on a Raspberry Pi 4B.",
    link: "https://arxiv.org/abs/0000.00000",
    tags: "IoT Security, Botnets, Firmware Hardening, Embedded Systems",
    type: "workshop",
    isPublished: true,
    order: 3,
  },
]

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

export default function Publications() {
  const { data: rawPublications } = useSuspenseQuery(publicationsQuery())
  const publications =
    rawPublications && rawPublications.length > 0
      ? (rawPublications as Array<PublicationItem>)
      : FALLBACK_PUBLICATIONS

  if (publications.length === 0) return null

  return (
    <section
      id="publications"
      className="tech-grid relative border-t border-border/50 px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:mb-14">
          <div className="label-mono mb-3 flex items-center justify-center gap-2">
            <RiBookOpenLine size={12} />
            RESEARCH · PUBLICATIONS
          </div>
          <h2 className="font-display text-3xl leading-none font-bold tracking-wide uppercase md:text-5xl">
            Selected <span className="text-gradient-neon-bg">Publications</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-mono text-sm text-muted-foreground md:text-base">
            Peer-reviewed research at the intersection of{" "}
            <span className="text-foreground">network security</span>,{" "}
            <span className="text-foreground">machine learning</span>, and{" "}
            <span className="text-foreground">cyber-defence systems</span>.
          </p>
        </div>

        <div className="space-y-5 md:space-y-6">
          {publications.map((pub, i) => (
            <div
              key={pub.id ?? i}
              className="group hover:neon-glow-sm cyber-chamfer relative overflow-hidden border border-border bg-card/60 p-5 transition-all hover:border-primary md:p-7"
            >
              <span className="via-accent-secondary absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-linear-to-b from-primary to-primary transition-transform duration-300 group-hover:scale-y-100" />

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

                  <p className="font-mono text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {pub.abstract}
                  </p>

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
