import { getPublications } from "@/lib/cms"
import {
    RiBookOpenLine,
    RiExternalLinkLine,
    RiFileTextLine,
    RiUserLine
} from "@remixicon/react"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { Card } from "./ui/card"

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

const FALLBACK_PUBLICATIONS: PublicationItem[] = [
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
    title: "Detecting Lateral Movement Using Graph Neural Networks on Authentication Logs",
    authors: "F. Tamanna, S. Khan",
    venue: "Proceedings of the ACM Conference on Computer and Communications Security (CCS)",
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
    title: "Hardening Consumer IoT Devices Against Mirai-Style Botnet Recruitment",
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

const TYPE_COLOR: Record<string, string> = {
  journal: "bg-primary/15 text-primary border-primary/30",
  conference: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  preprint: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  workshop: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  "book-chapter": "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
}

export default function Publications() {
  const [publications, setPublications] = useState<Array<PublicationItem>>([])

  useEffect(() => {
    async function loadData() {
      try {
        const data = (await getPublications({
          data: { includeUnpublished: false },
        })) as PublicationItem[]
        if (data && data.length > 0) {
          setPublications(data)
        } else {
          setPublications(FALLBACK_PUBLICATIONS)
        }
      } catch (error) {
        console.error("Failed to fetch publications, using fallback.", error)
        setPublications(FALLBACK_PUBLICATIONS)
      }
    }
    loadData()
  }, [])

  if (publications.length === 0) return null

  return (
    <section
      id="publications"
      className="border-t border-border px-4 py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center md:mb-14">
          <Badge
            variant="outline"
            className="mb-4 border-primary/20 bg-primary/5 px-3 py-1 font-mono text-[10px] tracking-widest text-primary uppercase"
          >
            <RiBookOpenLine size={12} className="mr-1.5" />
            RESEARCH · PUBLICATIONS
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter md:text-5xl">
            Selected <span className="text-primary">Publications</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
            Peer-reviewed research at the intersection of{" "}
            <span className="text-foreground">network security</span>,{" "}
            <span className="text-foreground">machine learning</span>, and{" "}
            <span className="text-foreground">cyber-defence systems</span>.
          </p>
        </div>

        <div className="space-y-5 md:space-y-6">
          {publications.map((pub, i) => (
            <Card
              key={pub.id ?? i}
              className="group relative overflow-hidden rounded-2xl border-border bg-card/40 p-5 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card/60 md:p-7"
            >
              {/* Left accent bar */}
              <span className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                {/* Year + Type column */}
                <div className="flex shrink-0 flex-row gap-2 md:w-28 md:flex-col md:items-start md:gap-3">
                  <span className="font-mono text-2xl font-black tracking-tighter text-primary md:text-3xl">
                    {pub.year}
                  </span>
                  <Badge
                    variant="outline"
                    className={`w-fit border font-mono text-[9px] tracking-widest uppercase ${
                      TYPE_COLOR[pub.type] ?? TYPE_COLOR.journal
                    }`}
                  >
                    {TYPE_LABEL[pub.type] ?? pub.type}
                  </Badge>
                </div>

                {/* Main content */}
                <div className="min-w-0 flex-1 space-y-3">
                  <h3 className="text-lg font-bold leading-snug tracking-tight md:text-xl">
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

                  <p className="text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {pub.abstract}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap gap-1.5">
                      {(pub.tags || "")
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="border-border/50 bg-secondary/60 font-mono text-[9px] tracking-wider uppercase"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>

                    {pub.link && pub.link !== "" && (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-widest text-primary uppercase transition-colors hover:text-primary/80"
                      >
                        Read Paper
                        <RiExternalLinkLine size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
