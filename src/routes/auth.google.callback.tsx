import { googleLoginCallback } from "@/lib/cms"
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function GoogleCallbackPage() {
  const search = useSearch({ from: "/auth/google/callback" }) as Record<
    string,
    string
  >
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = search?.code
    const errorParam = search?.error

    if (errorParam) {
      setError("Google login was cancelled or denied.")
      toast.error("Google login was cancelled or denied.")
      setTimeout(() => navigate({ to: "/login" }), 3000)
      return
    }

    if (!code) {
      setError("No authorization code received from Google.")
      toast.error("No authorization code received.")
      setTimeout(() => navigate({ to: "/login" }), 3000)
      return
    }

    googleLoginCallback({ data: code })
      .then(() => {
        toast.success("Logged in with Google successfully")
        navigate({ to: "/admin" })
      })
      .catch((err: any) => {
        const msg = err?.message || "Google login failed"
        setError(msg)
        toast.error(msg)
        setTimeout(() => navigate({ to: "/login" }), 3000)
      })
  }, [search, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-muted-foreground">
          {error ? (
            <span className="text-destructive">{error}</span>
          ) : (
            "Completing Google login..."
          )}
        </p>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/auth/google/callback")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      code: (search.code as string) || undefined,
      error: (search.error as string) || undefined,
      state: (search.state as string) || undefined,
    }
  },
  component: GoogleCallbackPage,
})
