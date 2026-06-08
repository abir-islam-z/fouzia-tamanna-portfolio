import { Card } from "@/components/ui/card"
import { getContactMessages } from "@/lib/cms"
import { RiMailLine, RiTimeLine, RiUserLine } from "@remixicon/react"
import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"

interface ContactMessage {
  id: number
  name: string
  email: string
  message: string
  createdAt: string | Date
}

function AdminMessagesComponent() {
  const [messages, setMessages] = useState<Array<ContactMessage>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const data = await getContactMessages()
      setMessages(data as Array<ContactMessage>)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading messages…</p>
        </div>
      </div>
    )

  return (
    <div className="space-y-8">
      <header>
        <h1 className="mb-2 text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground">
          Inquiries from your portfolio contact form.
        </p>
      </header>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center">
            <RiMailLine
              size={48}
              className="mx-auto mb-4 text-muted-foreground opacity-20"
            />
            <p className="text-muted-foreground">No messages yet.</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <Card key={i} variant="admin" className="p-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <RiUserLine size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{msg.name}</h3>
                    <p className="text-xs text-muted-foreground">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                  <RiTimeLine size={14} />
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="rounded-lg border border-border/50 bg-muted/30 p-4 text-sm leading-relaxed text-foreground/80">
                {msg.message}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesComponent,
})
