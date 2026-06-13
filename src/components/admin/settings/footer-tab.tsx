import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { footerQuery, useUpdateFooter } from "@/lib/queries"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface FooterData {
  id?: string
  bio: string
  email: string
  linkedin: string
  github: string
  twitter: string
  availability: string
}

export function FooterTab() {
  const { data: rawFooter } = useSuspenseQuery(footerQuery)
  const footerMutation = useUpdateFooter()
  const footer = rawFooter as unknown as FooterData

  const [footerState, setFooterState] = useState<FooterData>(footer)
  useEffect(() => {
    setFooterState(footer)
  }, [footer])

  const saveFooter = async () => {
    try {
      await footerMutation.mutateAsync(footerState)
      toast.success("Footer saved.")
    } catch (err: any) {
      toast.error(err?.message || "Failed to save footer")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Footer</h2>
        <Button
          variant="admin"
          onClick={saveFooter}
          disabled={footerMutation.isPending}
        >
          {footerMutation.isPending ? "Saving…" : "Save Footer"}
        </Button>
      </div>
      <Card variant="admin" className="space-y-6 p-6">
        <div className="space-y-1.5">
          <Label variant="admin">Bio</Label>
          <Textarea
            variant="admin"
            rows={3}
            value={footerState.bio}
            onChange={(e) =>
              setFooterState({ ...footerState, bio: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {[
            {
              key: "email",
              label: "Email",
              placeholder: "hello@example.com",
            },
            {
              key: "linkedin",
              label: "LinkedIn",
              placeholder: "https://linkedin.com/in/...",
            },
            {
              key: "github",
              label: "GitHub",
              placeholder: "https://github.com/...",
            },
            {
              key: "twitter",
              label: "Twitter/X",
              placeholder: "https://x.com/...",
            },
            {
              key: "availability",
              label: "Availability Text",
              placeholder: "Open for...",
            },
          ].map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <Label variant="admin">{label}</Label>
              <Input
                variant="admin"
                value={(footerState as any)[key] ?? ""}
                onChange={(e) =>
                  setFooterState({ ...footerState, [key]: e.target.value })
                }
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
