import { cn } from "@/lib/utils"
import { RiCloseLine, RiMenuLine, RiShieldKeyholeLine } from "@remixicon/react"
import { Link, useRouterState } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "./ui/button"

/**
 * Cyberpunk Navbar.
 *
 * - Sticky, full-width, hairline neon border at the bottom.
 * - Brand mark on the left, nav links center (lg+), actions right.
 * - Mobile menu is a full-bleed terminal overlay.
 */
export function Navbar() {
  const state = useRouterState()
  const rootContext = state.matches.find((m) => m.routeId === "__root__")
  const user = rootContext?.context.user
  const hero = rootContext?.loaderData?.hero
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: "/#about", label: "About" },
    { href: "/#experience", label: "Experience" },
    { href: "/#projects", label: "Projects" },
    { href: "/#publications", label: "Publications" },
  ]

  const logoUrl = hero?.logoUrl
  const brandName = hero?.title || "Fouzia Tamanna"

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 px-4 py-4 backdrop-blur-md md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-3">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${brandName} logo`}
              className="h-8 w-auto max-w-40 object-contain"
            />
          ) : (
            <>
              <span className="group-hover:neon-glow cyber-chamfer-sm relative flex h-9 w-9 items-center justify-center border border-primary text-primary transition-all">
                <RiShieldKeyholeLine size={18} />
              </span>
              <span className="font-display text-sm font-bold tracking-[0.18em] uppercase md:text-base">
                <span className="text-glow-sm text-primary">Fouzia</span>
                <span className="text-foreground"> Tamanna</span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="group relative px-4 py-2 font-mono text-[11px] font-bold tracking-[0.18em] text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              <span className="text-primary/50 group-hover:text-primary">
                /
              </span>
              {link.label.toLowerCase()}
              <span className="absolute inset-x-4 bottom-1 h-px scale-x-0 bg-primary transition-transform group-hover:scale-x-100" />
            </a>
          ))}
          {user && (
            <Link
              to="/admin"
              className="hover:text-glow ml-2 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.18em] text-primary uppercase transition-colors"
            >
              // dashboard
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a
            href={hero?.resumeUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button size="sm" variant="glitch" className="px-5">
              Resume.exe
            </Button>
          </a>
          <Button
            variant="outline"
            size="icon"
            className="cyber-chamfer-sm md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <RiCloseLine size={20} /> : <RiMenuLine size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 top-[72px] z-40 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <div className="tech-grid absolute inset-0 opacity-50" />
        <nav className="relative flex h-full flex-col items-center justify-center gap-6 p-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center gap-3 font-display text-3xl font-bold tracking-widest text-foreground uppercase transition-colors hover:text-primary"
            >
              <span className="text-glow-sm font-mono text-sm text-primary">
                /
              </span>
              {link.label}
            </a>
          ))}
          {user && (
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center gap-3 font-display text-3xl font-bold tracking-widest text-primary uppercase"
            >
              <span className="text-glow-sm font-mono text-sm">/</span>
              Dashboard
            </Link>
          )}
          <a
            href={hero?.resumeUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs pt-4"
          >
            <Button variant="glitch" className="h-14 w-full">
              Resume.exe
            </Button>
          </a>
        </nav>
      </div>
    </nav>
  )
}
