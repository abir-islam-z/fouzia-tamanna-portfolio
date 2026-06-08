import { Button } from "@/components/ui/button"
import { logout } from "@/lib/cms"
import { cn } from "@/lib/utils"
import {
  RiAwardLine,
  RiBookOpenLine,
  RiBriefcaseLine,
  RiCloseLine,
  RiCodeBoxLine,
  RiDashboardLine,
  RiExternalLinkLine,
  RiImageLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiShieldKeyholeLine,
  RiSidebarFoldLine,
  RiSidebarUnfoldLine,
  RiStarLine,
} from "@remixicon/react"
import { Link, useNavigate } from "@tanstack/react-router"
import { useState } from "react"

const navItems = [
  { to: "/admin", label: "Overview", icon: RiDashboardLine },
  { to: "/admin/experience", label: "Experience", icon: RiBriefcaseLine },
  { to: "/admin/projects", label: "Projects", icon: RiCodeBoxLine },
  { to: "/admin/publications", label: "Publications", icon: RiBookOpenLine },
  { to: "/admin/certifications", label: "Certifications", icon: RiAwardLine },
  { to: "/admin/testimonials", label: "Testimonials", icon: RiStarLine },
  { to: "/admin/media", label: "Media Library", icon: RiImageLine },
]

export function AdminSidebar() {
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate({ to: "/login" })
  }

  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-full shadow-lg"
        >
          {isMobileOpen ? <RiCloseLine size={24} /> : <RiMenuLine size={24} />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 transition-all duration-300 md:sticky md:top-0 md:h-screen",
          isCollapsed ? "w-20" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "flex flex-col border-r border-border bg-card p-4"
        )}
      >
        {/* Brand */}
        <div className="mb-10 flex items-center justify-between px-2">
          {!isCollapsed ? (
            <div className="flex animate-in items-center gap-3 duration-300 fade-in">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <RiShieldKeyholeLine size={18} />
              </div>
              <span className="text-sm font-semibold">Fouzia · Admin</span>
            </div>
          ) : (
            <div className="mx-auto flex h-8 w-8 animate-in items-center justify-center rounded-lg bg-primary text-primary-foreground duration-300 fade-in">
              <RiShieldKeyholeLine size={18} />
            </div>
          )}
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="hidden h-8 w-8 rounded-full md:flex"
            >
              <RiSidebarFoldLine size={18} />
            </Button>
          )}
        </div>

        {isCollapsed && (
          <div className="mb-6 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="h-8 w-8 rounded-full"
            >
              <RiSidebarUnfoldLine size={18} />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              onClick={() => setIsMobileOpen(false)}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-all hover:bg-muted",
                isCollapsed && "mx-auto w-12 justify-center px-0"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                size={20}
                className={cn(
                  "shrink-0",
                  isCollapsed && "transition-transform group-hover:scale-110"
                )}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="mt-auto space-y-2 pt-6">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary hover:text-foreground",
              isCollapsed ? "mx-auto w-12 justify-center px-0" : "justify-start"
            )}
            title={isCollapsed ? "Exit to Site" : undefined}
          >
            <RiExternalLinkLine size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Exit to Site</span>}
          </Link>

          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 hover:text-destructive",
              isCollapsed ? "mx-auto w-12 justify-center px-0" : "justify-start"
            )}
            title={isCollapsed ? "Logout" : undefined}
          >
            <RiLogoutBoxLine size={20} className="shrink-0" />
            {!isCollapsed && <span className="truncate">Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}
