import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { footerQuery, getQueryClient, projectBySlugQuery } from "@/lib/queries"
import {
  RiArrowLeftLine,
  RiArrowRightUpLine,
  RiExternalLinkLine,
  RiEyeLine,
  RiGithubFill,
  RiShieldKeyholeLine,
} from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Link, createFileRoute } from "@tanstack/react-router"

interface MediaItem {
  id: string
  url: string
  originalName: string
  alt: string | null
}

interface ProjectDetail {
  id: string
  slug: string
  title: string
  summary: string
  caseStudy: string
  tags: string
  isFeatured: boolean
  link: string | null
  github: string | null
  cover?: MediaItem | null
  gallery?: Array<{
    id: string
    mediaId: string
    order: number
    media: MediaItem
  }>
}

function ProjectCaseStudyComponent() {
  const { slug } = Route.useParams()
  const { data: rawProject } = useSuspenseQuery(projectBySlugQuery(slug))
  const project = rawProject as unknown as ProjectDetail | null
  const { data: rawFooter } = useSuspenseQuery(footerQuery)
  const footer = rawFooter as {
    twitter?: string
    linkedin?: string
    github?: string
  } | null

  if (!project) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 p-6 text-center">
          <Badge variant="admin">404</Badge>
          <h1 className="text-3xl font-bold">Project not found</h1>
          <p className="text-muted-foreground">
            The case study you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link to="/">
            <Button variant="admin" className="gap-2">
              <RiArrowLeftLine size={16} />
              Back to home
            </Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <RiArrowLeftLine size={14} />
            Back to portfolio
          </Link>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            /{project.slug}
          </span>
        </div>
      </div>

      {/* Cover */}
      {project.cover ? (
        <div className="relative aspect-[21/9] w-full overflow-hidden border-b border-border bg-secondary">
          <img
            src={project.cover.url}
            alt={project.cover.alt ?? project.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
      ) : (
        <div className="flex aspect-[21/9] w-full items-center justify-center border-b border-border bg-muted/20">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <RiShieldKeyholeLine size={48} className="opacity-30" />
            <span className="font-mono text-xs tracking-widest uppercase">
              No cover image
            </span>
          </div>
        </div>
      )}

      <article className="mx-auto max-w-4xl space-y-10 px-4 py-12 md:px-6 md:py-16">
        {/* Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {project.isFeatured && (
              <span className="inline-flex items-center gap-1.5 border border-primary/60 bg-primary/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.2em] text-primary uppercase">
                <span className="status-dot h-1.5 w-1.5" />
                Featured
              </span>
            )}
            {(project.tags || "")
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((tag, i) => (
                <span
                  key={i}
                  className="border border-border bg-secondary/60 px-2 py-1 font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase md:text-[10px]"
                >
                  #{tag}
                </span>
              ))}
          </div>

          <h1 className="text-gradient-neon-bg font-display text-3xl leading-[1.1] font-black tracking-tight uppercase md:text-5xl">
            {project.title}
          </h1>

          {project.summary && (
            <p className="max-w-3xl font-mono text-base leading-relaxed text-muted-foreground md:text-lg">
              {project.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="glitch" size="sm" className="gap-2">
                  <RiGithubFill size={16} />
                  View Source
                </Button>
              </a>
            )}
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <RiExternalLinkLine size={16} />
                  Live Demo
                </Button>
              </a>
            )}
          </div>
        </header>

        {/* Case study body */}
        {project.caseStudy && project.caseStudy.trim() ? (
          <section
            className="prose prose-invert prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-wide prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-a:text-primary prose-a:underline prose-strong:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:rounded prose-blockquote:border-l-primary prose-li:my-1 prose-img:my-6 prose-img:rounded-lg prose-img:border prose-img:border-border max-w-none font-mono"
            dangerouslySetInnerHTML={{ __html: project.caseStudy }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              This project doesn&apos;t have a case study yet. Check back soon!
            </p>
          </div>
        )}

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <RiEyeLine size={14} className="text-primary" />
              <h2 className="label-mono">GALLERY</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {project.gallery
                .sort((a, b) => a.order - b.order)
                .map((g) => (
                  <div
                    key={g.id}
                    className="overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <img
                      src={g.media.url}
                      alt={g.media.alt ?? g.media.originalName}
                      className="aspect-video w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Footer of case study */}
        <footer className="flex items-center justify-between border-t border-border pt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <RiArrowLeftLine size={14} />
            All projects
          </Link>
          <div className="flex items-center gap-3">
            {footer?.github && (
              <a
                href={footer.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="GitHub"
              >
                <RiGithubFill size={18} />
              </a>
            )}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label="Open"
              >
                <RiArrowRightUpLine size={18} />
              </a>
            )}
          </div>
        </footer>
      </article>
    </main>
  )
}

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const queryClient = getQueryClient(context)
    await Promise.all([
      queryClient.ensureQueryData(projectBySlugQuery(params.slug)),
      queryClient.ensureQueryData(footerQuery),
    ])
  },
  component: ProjectCaseStudyComponent,
})
