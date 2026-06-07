import bcrypt from "bcryptjs"
import "dotenv/config"
import { getDb } from "../src/lib/db.server"

async function main() {
  const prisma = await getDb()
  console.log("Seeding database...")

  // --- Clear existing data ---
  await prisma.media.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.hero.deleteMany({})
  await prisma.stat.deleteMany({})
  await prisma.experience.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.testimonial.deleteMany({})
  await prisma.certification.deleteMany({})
  await prisma.footer.deleteMany({})

  // --- User ---
  const hashedPassword = await bcrypt.hash("password123", 10)
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword
    }
  })
  console.log("User 'admin' with password 'password123' created.")

  // --- Hero ---
  await prisma.hero.create({
    data: {
      id: "singleton",
      introBadge: "FULL STACK DEVELOPER & DESIGNER",
      title: "I build exceptional digital experiences for the web.",
      description: "Specializing in React, Node.js, and modern cloud architecture. I focus on creating scalable, performant, and user-centric applications.",
      videoDuration: "0:45",
      location: "Silicon Valley, CA",
      sponsorshipInfo: "Available for remote & on-site opportunities",
      resumeUrl: "#",
      openToWork: true
    }
  })

  // --- Stats ---
  const stats = [
    { label: "Years Experience", value: "5+", order: 1 },
    { label: "Projects Completed", value: "30+", order: 2 },
    { label: "Happy Clients", value: "20+", order: 3 },
    { label: "Commits This Year", value: "1K+", order: 4 }
  ]
  for (const stat of stats) {
    await prisma.stat.create({ data: stat })
  }

  // --- Experience ---
  const experiences = [
    {
      company: "Tech Giant",
      role: "Senior Software Engineer",
      period: "2022 - Present",
      description: "Leading frontend development for a high-traffic SaaS platform. Implementing micro-frontends and improving CI/CD pipelines.",
      skills: "React, TypeScript, AWS, Next.js",
      order: 1
    },
    {
      company: "Startup Co",
      role: "Full Stack Developer",
      period: "2019 - 2022",
      description: "Architected and built a real-time collaboration tool from scratch. Scaled the backend to handle 50k concurrent users.",
      skills: "Node.js, PostgreSQL, Redis, Docker",
      order: 2
    },
    {
      company: "Digital Agency",
      role: "Junior Web Developer",
      period: "2018 - 2019",
      description: "Developed custom WordPress themes and interactive web components for various client projects.",
      skills: "JavaScript, PHP, CSS, HTML",
      order: 3
    }
  ]
  for (const exp of experiences) {
    await prisma.experience.create({ data: exp })
  }

  // --- Projects ---
  const projects = [
    {
      title: "Task Management Pro",
      description: "A collaborative task management application with real-time updates and team analytics.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      tags: "React, Firebase, Tailwind",
      isFeatured: true,
      link: "https://github.com/johndoe/task-pro",
      github: "https://github.com/johndoe/task-pro",
      order: 1
    },
    {
      title: "E-commerce Engine",
      description: "A headless e-commerce solution with integrated payment gateways and inventory management.",
      image: "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&q=80&w=800",
      tags: "Next.js, Stripe, Shopify",
      isFeatured: true,
      link: "https://github.com/johndoe/shop-engine",
      github: "https://github.com/johndoe/shop-engine",
      order: 2
    },
    {
      title: "Weather Pulse",
      description: "A weather tracking dashboard providing hyper-local forecasts and historical data visualization.",
      image: "https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&q=80&w=800",
      tags: "React, D3.js, API",
      isFeatured: false,
      link: "https://github.com/johndoe/weather-pulse",
      github: "https://github.com/johndoe/weather-pulse",
      order: 3
    }
  ]
  for (const project of projects) {
    await prisma.project.create({ data: project })
  }

  // --- Testimonials ---
  const testimonials = [
    {
      name: "Jane Smith",
      role: "Product Manager at Innovate Inc",
      content: "John's technical expertise and attention to detail transformed our product. He's a rare talent who understands both code and design.",
      order: 1
    },
    {
      name: "Michael Brown",
      role: "Founder at Future Tech",
      content: "The best developer we've worked with. John delivered a complex feature set ahead of schedule and with zero bugs.",
      order: 2
    }
  ]
  for (const testimonial of testimonials) {
    await prisma.testimonial.create({ data: testimonial })
  }

  // --- Certifications ---
  const certifications = [
    {
      title: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      link: "https://aws.amazon.com/certification/",
      order: 1
    },
    {
      title: "Full Stack Web Development",
      issuer: "Code Academy",
      date: "2021",
      link: "#",
      order: 2
    }
  ]
  for (const cert of certifications) {
    await prisma.certification.create({ data: cert })
  }

  // --- Footer ---
  await prisma.footer.create({
    data: {
      id: "singleton",
      bio: "Full Stack Developer specializing in modern web technologies. Based in Silicon Valley, CA.",
      email: "hello@johndoe.com",
      linkedin: "https://linkedin.com/in/johndoe",
      github: "https://github.com/johndoe",
      twitter: "https://twitter.com/johndoe",
      availability: "Open for Opportunities"
    }
  })
  console.log("Footer seeded.")

  console.log("Seeding complete!")
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e)
    process.exit(1)
  })
