import { AdminSidebar } from "@/components/AdminSidebar"
import { getUser } from "@/lib/cms"
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-6 md:p-12">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({
        to: "/login",
      })
    }
    return { user }
  },
  component: AdminLayout,
})
