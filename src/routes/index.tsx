import { createFileRoute } from "@tanstack/react-router"
import { Suspense, lazy } from "react"

const Hero = lazy(() => import("@/components/Hero"))
const Stats = lazy(() => import("@/components/Stats"))
const Experience = lazy(() => import("@/components/Experience"))
const Projects = lazy(() => import("@/components/Projects"))
const Testimonials = lazy(() => import("@/components/Testimonials"))
const Certifications = lazy(() => import("@/components/Certifications"))
const Publications = lazy(() => import("@/components/Publications"))
const Footer = lazy(() => import("@/components/Footer"))

function IndexComponent() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            Loading...
          </div>
        }
      >
        <Hero />
        <Stats />
        <Experience />
        <Projects />
        <Testimonials />
        <Certifications />
        <Publications />
        <Footer />
      </Suspense>
    </main>
  )
}

export const Route = createFileRoute("/")({
  component: IndexComponent,
})
