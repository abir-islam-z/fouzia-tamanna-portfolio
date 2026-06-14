import { Navbar } from "@/components/Navbar"
import { getUser } from "@/lib/cms"
import { getQueryClient, heroQuery, siteSettingsQuery } from "@/lib/queries"
import { TanStackDevtools } from "@tanstack/react-devtools"
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLocation,
} from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { Toaster } from "sonner"
import appCss from "../styles.css?url"

export const Route = createRootRoute({
  beforeLoad: async () => {
    const user = await getUser()
    return {
      user,
    }
  },
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    const hero = await queryClient.ensureQueryData(heroQuery)
    const siteSettings = await queryClient.ensureQueryData(siteSettingsQuery)
    return {
      hero,
      siteSettings,
    }
  },
  head: ({ loaderData }) => {
    const hero = loaderData?.hero
    return {
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          title: hero?.title
            ? `${hero.title} | Network Security & SOC Analyst`
            : "Fouzia Tamanna | Network Security & SOC Analyst",
        },
        {
          name: "description",
          content:
            hero?.description ||
            "Fouzia Tamanna — MSc Computer Networks & Systems Security. SOC Analyst in London specialising in threat detection, incident response, and systems security.",
        },
        {
          name: "theme-color",
          content: "#0a0f0d",
        },
      ],
      links: [
        {
          rel: "icon",
          href: "/favicon.ico",
          type: "image/x-icon",
        },
        {
          rel: "stylesheet",
          href: appCss,
        },
      ],
    }
  },
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16 text-center">
      <h1 className="mb-4 text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">
        The requested page could not be found.
      </p>
    </main>
  ),
  component: RootDocument,
})

function RootDocument() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith("/admin")

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          {!isAdmin && <Navbar />}
          <main className={isAdmin ? "flex-1" : "flex-1"}>
            <Outlet />
          </main>
          <Toaster position="top-center" richColors />
        </div>
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
