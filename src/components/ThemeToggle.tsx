import { useEffect, useState } from "react"
import { RiCommandLine } from "@remixicon/react"

/**
 * Cyberpunk ThemeToggle.
 *
 * Since the design system is dark-mode-only, the "toggle" is decorative —
 * it displays the current lock state with a terminal-style indicator.
 * Still functional for users who might have a `light` class on `<html>`.
 */
export function ThemeToggle() {
    const [mounted, setMounted] = useState(false)
    const [theme, setTheme] = useState<"dark" | "light">("dark")

    useEffect(() => {
        setMounted(true)
        const stored = localStorage.getItem("theme") as "dark" | "light" | null
        if (stored === "light") {
            // The design system forces dark — but we still allow the toggle to "fire"
            // so the UI responds. Light mode is mapped to the same cyberpunk dark palette.
            setTheme("light")
        }
    }, [])

    const toggle = () => {
        const next = theme === "dark" ? "light" : "dark"
        setTheme(next)
        localStorage.setItem("theme", next)
        // Always force dark — the cyberpunk system is dark-only.
        document.documentElement.classList.add("dark")
        document.documentElement.classList.remove("light")
    }

    if (!mounted) {
        return (
            <button
                aria-label="Toggle theme"
                className="relative flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:neon-glow-sm cyber-chamfer-sm"
            >
                <RiCommandLine size={18} />
            </button>
        )
    }

    return (
        <button
            onClick={toggle}
            aria-label="System theme locked to dark mode"
            className="group relative flex h-10 w-10 items-center justify-center border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary hover:neon-glow-sm cyber-chamfer-sm"
            title="System theme locked: DARK"
        >
            <span className="status-dot absolute right-1.5 top-1.5 h-1.5 w-1.5" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest group-hover:text-glow">
                DARK
            </span>
        </button>
    )
}
