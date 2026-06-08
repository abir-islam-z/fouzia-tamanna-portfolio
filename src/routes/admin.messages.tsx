import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getContactMessages } from "@/lib/cms"
import { RiMailLine } from "@remixicon/react"
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

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <RiMailLine
            size={48}
            className="mx-auto mb-4 text-muted-foreground opacity-20"
          />
          <p className="text-muted-foreground">No messages yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-[50%]">Message</TableHead>
                <TableHead className="w-44">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell className="font-medium">{msg.name}</TableCell>
                  <TableCell>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      {msg.email}
                    </a>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm text-foreground/80">
                      {msg.message}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Date(msg.createdAt).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export const Route = createFileRoute("/admin/messages")({
  component: AdminMessagesComponent,
})
