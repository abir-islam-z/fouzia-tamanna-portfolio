import bcrypt from "bcryptjs"
import "dotenv/config"
import { getDb } from "../src/lib/db.server"

async function main() {
  const prisma = await getDb()
  console.log("Seeding database...")

  // --- Clear existing data ---
  await prisma.publication.deleteMany({})
  await prisma.projectGallery.deleteMany({})
  await prisma.media.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.hero.deleteMany({})
  await prisma.stat.deleteMany({})
  await prisma.experience.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.testimonial.deleteMany({})
  await prisma.certification.deleteMany({})
  await prisma.footer.deleteMany({})
  await prisma.landingSection.deleteMany({})
  await prisma.siteSettings.deleteMany({})

  // --- User ---
  const hashedPassword = await bcrypt.hash("password123", 10)
  await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
    },
  })
  console.log("User 'admin' with password 'password123' created.")

  // --- Hero ---
  await prisma.hero.create({
    data: {
      id: "singleton",
      introBadge: "OPEN TO WORK — SOC ANALYST",
      subtitle: "MSc Computer Networks & Systems Security",
      title: "Fouzia Tamanna",
      description:
        "Network Security & SOC Analyst specializing in threat detection, incident response, and systems security.",
      location: "London, UK",
      sponsorshipInfo: "No sponsorship needed",
      resumeUrl: "#",
      openToWork: true,
      typedLines: [
        "$ whoami",
        "fouzia_tamanna",
        "$ role --current",
        "SOC Analyst (Tier 2) @ SecureNet Operations",
        "$ focus --primary",
        "Threat Detection · Incident Response · SIEM",
        "$ certs --list",
        "Security+ · CSA · CCNA · BTL1",
        "$ status",
        "[+] All systems nominal. Listening for anomalies...",
      ].join("\n"),
      cvButtonLabel: "Download CV",
      researchButtonLabel: "View Research",
    },
  })

  // --- Stats ---
  const stats = [
    { label: "Threats Triaged", value: "2K+", order: 1 },
    { label: "Incidents Resolved", value: "150+", order: 2 },
    { label: "Network Uptime", value: "99.9%", order: 3 },
    { label: "Years in IT Security", value: "4+", order: 4 },
  ]
  for (const stat of stats) {
    await prisma.stat.create({ data: stat })
  }

  // --- Experience ---
  const experiences = [
    {
      company: "SecureNet Operations",
      role: "SOC Analyst (Tier 2)",
      period: "2023 - Present",
      description:
        "Monitor SIEM dashboards, investigate security alerts, and coordinate incident response for enterprise clients. Developed automated playbooks reducing MTTR by 35%.",
      skills: "SIEM, Splunk, Splunk SOAR, Wireshark, MITRE ATT&CK",
      order: 1,
    },
    {
      company: "CyberDefence Group",
      role: "Network Security Engineer",
      period: "2021 - 2023",
      description:
        "Deployed and tuned firewalls, IDS/IPS, and VPN solutions. Led network segmentation project for a financial services client (PCI-DSS compliance).",
      skills: "Palo Alto, Cisco ASA, Suricata, Snort, VPN/IPSec, Nessus",
      order: 2,
    },
    {
      company: "IT Infrastructure Team",
      role: "Junior Network Administrator",
      period: "2019 - 2021",
      description:
        "Managed Active Directory, DNS, DHCP, and group policies across a 500-user environment. Assisted with vulnerability scans and patch cycles.",
      skills: "Active Directory, Windows Server, PowerShell, PRTG, pfSense",
      order: 3,
    },
  ]
  for (const exp of experiences) {
    await prisma.experience.create({ data: exp })
  }

  // --- Projects ---
  const projects = [
    {
      slug: "threat-hunting-lab",
      title: "Threat-Hunting Lab (ELK + Caldera)",
      summary:
        "Home SOC lab using Elastic Stack and MITRE Caldera to emulate APT techniques, detect them, and build detection rules.",
      caseStudy:
        "<h2>Overview</h2><p>Built a personal SOC lab that emulates adversary techniques end-to-end.</p><h3>Stack</h3><ul><li>Elastic Stack (Elasticsearch, Kibana, Beats)</li><li>MITRE Caldera for automated adversary emulation</li><li>Custom detection rules mapped to ATT&amp;CK</li></ul><h3>Results</h3><p>Achieved 100% ATT&amp;CK tactic coverage with validated detections and a 0.4% false-positive rate.</p>",
      tags: "ELK, MITRE Caldera, Detection Engineering",
      isFeatured: true,
      link: "#",
      github: "#",
      order: 1,
    },
    {
      slug: "network-forensics-toolkit",
      title: "Network Forensics Toolkit",
      summary:
        "Python-based toolkit that parses PCAP files, extracts IOCs, and exports to STIX 2.1 for threat-intel platforms.",
      caseStudy:
        "<h2>Overview</h2><p>A Python CLI for fast triage of packet captures and IOC extraction.</p><h3>Features</h3><ul><li>PCAP parsing with Scapy</li><li>IOC extraction (IPs, domains, hashes)</li><li>STIX 2.1 export for sharing with threat-intel platforms</li></ul><h3>Results</h3><p>Processed a 10 GB capture in under 90 seconds on commodity hardware.</p>",
      tags: "Python, Scapy, STIX 2.1, PCAP Analysis",
      isFeatured: true,
      link: "#",
      github: "#",
      order: 2,
    },
    {
      slug: "zero-trust-vpn",
      title: "Zero-Trust VPN Deployment",
      summary:
        "WireGuard-based zero-trust mesh VPN with mutual TLS, device posture checks, and per-app access policies.",
      caseStudy:
        "<h2>Overview</h2><p>Replaced a legacy site-to-site VPN with a zero-trust mesh.</p><h3>Design</h3><ul><li>WireGuard tunnels between every node</li><li>Mutual TLS for service identity</li><li>Device-posture checks before granting access</li><li>Per-app policies enforced at the gateway</li></ul>",
      tags: "WireGuard, mTLS, Zero Trust, OpenWRT",
      isFeatured: false,
      link: "#",
      github: "#",
      order: 3,
    },
  ]
  for (const project of projects) {
    await prisma.project.create({ data: project })
  }

  // --- Publications ---
  const publications = [
    {
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
      title:
        "Hardening Consumer IoT Devices Against Mirai-Style Botnet Recruitment",
      authors: "F. Tamanna",
      venue:
        "Workshop on Security and Privacy of Cyber-Physical Systems (SPCPS)",
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
  for (const pub of publications) {
    await prisma.publication.create({ data: pub })
  }

  // --- Testimonials ---
  const testimonials = [
    {
      name: "Daniel Okafor",
      role: "SOC Lead at SecureNet Operations",
      content:
        "Fouzia is one of the sharpest analysts I've worked with. Her detection-engineering work cut our false-positive rate in half and her runbooks are now team-standard.",
      order: 1,
    },
    {
      name: "Priya Mehta",
      role: "CISO at FinSecure Ltd",
      content:
        "During our PCI-DSS audit, Fouzia's network segmentation design and documentation passed on the first review. Rare to see that level of rigour from someone so early in their career.",
      order: 2,
    },
  ]
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial })
  }

  // --- Certifications ---
  const certifications = [
    {
      title: "CompTIA Security+",
      issuer: "CompTIA",
      date: "2024",
      link: "https://www.comptia.org/certifications/security",
      order: 1,
    },
    {
      title: "Certified SOC Analyst (CSA)",
      issuer: "EC-Council",
      date: "2023",
      link: "https://www.eccouncil.org/programs/certified-soc-analyst-csa/",
      order: 2,
    },
    {
      title: "Cisco Certified Network Associate (CCNA)",
      issuer: "Cisco",
      date: "2022",
      link: "https://www.cisco.com/site/us/en/learn/training-certification/certifications/associate/ccna/index.html",
      order: 3,
    },
    {
      title: "BTL1 (Blue Team Level 1)",
      issuer: "Security Blue Team",
      date: "2023",
      link: "https://securityblue.team/certifications/btl1-blue-team-level-1/",
      order: 4,
    },
  ]
  for (const cert of certifications) {
    await prisma.certification.create({ data: cert })
  }

  // --- Footer ---
  await prisma.footer.create({
    data: {
      id: "singleton",
      bio: "Network Security & SOC Analyst focused on threat detection, incident response, and systems security. Based in London, UK.",
      email: "hello@example.com",
      linkedin: "https://linkedin.com/in/fouzia-tamanna",
      github: "https://github.com/fouzia-tamanna",
      twitter: "#",
      availability: "Open for SOC Analyst & Network Security Roles",
    },
  })
  console.log("Footer seeded.")

  // --- Landing Sections ---
  const sections = [
    {
      id: "hero",
      label: "Hero",
      badge: "// SECURE_SESSION.0001",
      order: 1,
      enabled: true,
    },
    {
      id: "stats",
      label: "Stats / Profile",
      badge: "// PROFILE.SYS",
      order: 2,
      enabled: true,
    },
    {
      id: "experience",
      label: "Experience",
      badge: "// TIMELINE.LOG",
      order: 3,
      enabled: true,
    },
    {
      id: "projects",
      label: "Projects",
      badge: "// PROJECTS.MKD",
      order: 4,
      enabled: true,
    },
    {
      id: "testimonials",
      label: "Testimonials",
      badge: "// PEER_REVIEWS.LOG",
      order: 5,
      enabled: true,
    },
    {
      id: "certifications",
      label: "Certifications",
      badge: "// CREDENTIALS.CRT",
      order: 6,
      enabled: true,
    },
    {
      id: "publications",
      label: "Publications",
      badge: "// RESEARCH · PUBLICATIONS",
      order: 7,
      enabled: true,
    },
    {
      id: "contact",
      label: "Contact",
      badge: "// CONTACT.SH",
      order: 8,
      enabled: true,
    },
  ]
  for (const s of sections) {
    await prisma.landingSection.create({
      data: { ...s, updatedAt: new Date() },
    })
  }
  console.log("Landing sections seeded.")

  // --- Site Settings ---
  await prisma.siteSettings.create({
    data: {
      id: "singleton",
      heroHeadline: "SOC Analyst",
      heroCtaPrimary: "Download CV",
      heroCtaSecondary: "View Research",
      contactHeading: null,
      contactSubtext: null,
      marqueeItems:
        "// SYS://fouzia_tamanna, SOC ANALYST, // LONDON UK, // THREAT_HUNT, // INCIDENT_RESPONSE, // OPEN_TO_WORK, // ZERO_TRUST",
      navbarBrand: "Fouzia Tamanna",
      updatedAt: new Date(),
    },
  })
  console.log("Site settings seeded.")

  console.log("Seeding complete!")
}

main().catch((e) => {
  console.error("Seeding failed:", e)
  process.exit(1)
})
