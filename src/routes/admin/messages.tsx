import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { contactMessagesQuery, getQueryClient } from "@/lib/queries"
import { RiMailLine } from "@remixicon/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

interface ContactMessage {
  id: string
  name: string
  email: string
  message: string
  createdAt: string | Date
}

function AdminMessagesComponent() {
  const { data: messages = [] } = useSuspenseQuery(contactMessagesQuery)

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
              {(messages as unknown as Array<ContactMessage>).map((msg) => (
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
                  <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
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
  loader: async ({ context }) => {
    const queryClient = getQueryClient(context)
    await queryClient.ensureQueryData(contactMessagesQuery)
  },
  component: AdminMessagesComponent,
})
