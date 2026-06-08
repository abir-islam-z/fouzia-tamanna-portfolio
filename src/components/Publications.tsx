import { getPublications } from "@/lib/cms"
import {
    RiBookOpenLine,
    RiExternalLinkLine,
    RiFileTextLine,
    RiUserLine,
} from "@remixicon/react"
import { useEffect, useState } from "react"

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

const TYPE_VARIANT: Record<string, string> = {
    journal: "border-primary/60 bg-primary/10 text-primary",
    conference: "border-cyan-500/60 bg-cyan-500/10 text-cyan-400",
    preprint: "border-amber-500/60 bg-amber-500/10 text-amber-400",
    workshop: "border-violet-500/60 bg-violet-500/10 text-violet-400",
    "book-chapter": "border-rose-500/60 bg-rose-500/10 text-rose-400",
}

/**
 * Cyberpunk Publications.
 *
 * - Each paper is a chamfered card with a "year" left rail.
 * - Type badge uses the new cyberpunk badge system.
 * - Hover reveals a left-edge neon bar (like a terminal cursor).
 */
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
            className="tech-grid relative border-t border-border/50 px-4 py-16 md:px-6 md:py-24"
        >
            <div className="mx-auto max-w-5xl">
                <div className="mb-10 text-center md:mb-14">
                    <div className="label-mono mb-3 flex items-center justify-center gap-2">
                        <RiBookOpenLine size={12} />
                        RESEARCH · PUBLICATIONS
                    </div>
                    <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-wide md:text-5xl">
                        Selected{" "}
                        <span className="text-gradient-neon-bg">Publications</span>
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
                            className="group relative overflow-hidden border border-border bg-card/60 p-5 transition-all hover:border-primary hover:neon-glow-sm md:p-7 cyber-chamfer"
                        >
                            {/* Left neon rail on hover */}
                            <span className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 bg-gradient-to-b from-primary via-accent-secondary to-primary transition-transform duration-300 group-hover:scale-y-100" />

                            {/* Corner index */}
                            <div className="absolute right-4 top-4 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40">
                                PUB_0{i + 1}
                            </div>

                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                                {/* Year + Type column */}
                                <div className="flex shrink-0 flex-row items-center gap-3 md:w-32 md:flex-col md:items-start md:gap-3">
                                    <span className="font-display text-3xl font-black leading-none text-primary text-glow-md md:text-4xl">
                                        {pub.year}
                                    </span>
                                    <span
                                        className={`border px-2.5 py-1 font-label text-[9px] uppercase tracking-[0.2em] cyber-chamfer-sm ${
                                            TYPE_VARIANT[pub.type] ?? TYPE_VARIANT.journal
                                        }`}
                                    >
                                        {TYPE_LABEL[pub.type] ?? pub.type}
                                    </span>
                                </div>

                                {/* Main content */}
                                <div className="min-w-0 flex-1 space-y-3">
                                    <h3 className="font-display text-lg font-bold uppercase leading-tight tracking-wide md:text-xl">
                                        {pub.title}
                                    </h3>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground md:text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <RiUserLine size={12} className="text-primary/70" />
                                            {pub.authors}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <RiFileTextLine
                                                size={12}
                                                className="text-primary/70"
                                            />
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
                                                        className="border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground cyber-chamfer-sm"
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
                                                className="group/link inline-flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-primary transition-colors hover:text-glow"
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
