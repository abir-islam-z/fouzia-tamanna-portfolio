import { cn } from "@/lib/utils"
import { RiCloseLine, RiMenuLine, RiShieldKeyholeLine } from "@remixicon/react"
import { Link, useRouterState } from "@tanstack/react-router"
import { useState } from "react"
import { ThemeToggle } from "./ThemeToggle"
import { Button } from "./ui/button"

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
    <nav className="glass sticky top-0 z-50 border-b border-border/40 px-4 py-4 md:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={`${brandName} logo`}
              className="h-8 w-auto max-w-40 rounded-md object-contain"
            />
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
                <RiShieldKeyholeLine size={18} />
              </span>
              <span className="text-base md:text-lg">
                <span className="text-primary">{brandName.split(" ")[0]}</span>
                {brandName.includes(" ") && (
                  <span className="text-foreground">
                    {" "}
                    {brandName.split(" ").slice(1).join(" ")}
                  </span>
                )}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          {user && (
            <Link
              to="/admin"
              className="font-bold text-primary transition-colors hover:text-primary/80"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <a
            href={hero?.resumeUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button size="sm" className="rounded-full px-6 font-bold">
              Resume
            </Button>
          </a>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 top-18.25 z-40 bg-background/95 backdrop-blur-xl transition-all duration-300 md:hidden",
          isMenuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <nav className="flex h-full flex-col items-center justify-center gap-8 p-6">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-bold text-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
          {user && (
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl font-bold text-primary"
            >
              Dashboard
            </Link>
          )}
          <a
            href={hero?.resumeUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-xs"
          >
            <Button className="h-14 w-full rounded-full text-lg font-bold">
              Resume
            </Button>
          </a>
        </nav>
      </div>
    </nav>
  )
}
