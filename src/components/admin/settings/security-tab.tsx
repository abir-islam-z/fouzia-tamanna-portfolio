import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import PasswordField from "@/components/ui/password-field"
import { changePassword, sendPasswordSetupEmail } from "@/lib/cms"
import { userProfileQuery } from "@/lib/queries"
import { RiLockPasswordLine, RiMailSendLine } from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export function SecurityTab() {
  const { data: profile } = useSuspenseQuery(userProfileQuery)
  const needsPassword = profile.isGoogleUser && !profile.hasPassword

  const handleSendResetEmail = async () => {
    try {
      await sendPasswordSetupEmail()
      toast.success("Password setup link sent! Check your inbox.")
    } catch (error: any) {
      toast.error(error?.message || "Failed to send email")
    }
  }

  // Google-only users: email is the only option
  if (needsPassword) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Account Security</h2>
        <Card variant="admin" className="space-y-4 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md bg-amber-500/10 p-2">
              <RiMailSendLine size={18} className="text-amber-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">No password set</p>
              <p className="text-xs text-muted-foreground">
                Your account was created with Google sign-in. We'll send you an
                email with a link to set your password.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleSendResetEmail}>
            <RiMailSendLine size={14} className="mr-2" />
            Send Password Setup Email
          </Button>
        </Card>
      </div>
    )
  }

  // Existing password: change password form
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        if (value.newPassword.length < 6) {
          toast.error("Password must be at least 6 characters")
          return
        }
        if (value.newPassword !== value.confirmPassword) {
          toast.error("Passwords do not match")
          return
        }
        await changePassword({ data: value })
        toast.success("Password changed successfully!")
        form.reset()
      } catch (error: any) {
        toast.error(error?.message || "Failed to change password")
      }
    },
  })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Account Security</h2>
      <Card variant="admin" className="space-y-6 p-6">
        <p className="text-xs text-muted-foreground">
          Change your admin account password.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          <form.Field
            name="currentPassword"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <div className="space-y-2">
                    <FieldLabel variant="admin" htmlFor={field.name}>
                      Current Password
                    </FieldLabel>
                    <div className="relative max-w-sm">
                      <RiLockPasswordLine
                        className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                        size={18}
                      />
                      <PasswordField
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="bg-background/50 pl-10"
                      />
                    </div>
                  </div>
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <form.Field
              name="newPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="space-y-2">
                      <FieldLabel variant="admin" htmlFor={field.name}>
                        New Password
                      </FieldLabel>
                      <div className="relative">
                        <RiLockPasswordLine
                          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                          size={18}
                        />
                        <PasswordField
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="bg-background/50 pl-10"
                        />
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.Field
              name="confirmPassword"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="space-y-2">
                      <FieldLabel variant="admin" htmlFor={field.name}>
                        Confirm Password
                      </FieldLabel>
                      <div className="relative">
                        <RiLockPasswordLine
                          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                          size={18}
                        />
                        <PasswordField
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          className="bg-background/50 pl-10"
                        />
                      </div>
                    </div>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              variant="admin"
              type="submit"
              disabled={form.state.isSubmitting}
            >
              {form.state.isSubmitting ? "Saving…" : "Change Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
