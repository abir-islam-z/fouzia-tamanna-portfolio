import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import PasswordField from "@/components/ui/password-field"
import { resetPassword, resetPasswordSchema } from "@/lib/cms"
import { RiLockPasswordLine } from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { Link, createFileRoute, useSearch } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function ResetPasswordPage() {
  const search = useSearch({ from: "/reset-password" }) as Record<string, string>
  const token = search?.token || ""
  const [success, setSuccess] = useState(false)

  const form = useForm({
    validators: {
      onChange: resetPasswordSchema,
    },
    defaultValues: {
      token,
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await resetPassword({
          data: {
            token: value.token,
            password: value.password,
            confirmPassword: value.confirmPassword,
          },
        })
        setSuccess(true)
        toast.success("Password has been reset successfully!")
      } catch (error: any) {
        toast.error(error?.message || "Failed to reset password. The link may have expired.")
      }
    },
  })

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="w-full max-w-md space-y-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Invalid Link</h1>
          <p className="text-muted-foreground">
            This password reset link is invalid or missing a token.
          </p>
          <Button asChild variant="admin" className="mt-4">
            <Link to="/forgot-password">Request New Link</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <RiLockPasswordLine size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Set New Password
          </h1>
          <p className="mt-2 text-muted-foreground">
            Enter your new password below.
          </p>
        </div>

        <Card className="border-border bg-secondary/30 p-8">
          {success ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RiLockPasswordLine size={24} />
              </div>
              <p className="text-sm text-muted-foreground">
                Your password has been reset successfully. You can now log in
                with your new password.
              </p>
              <Button asChild variant="admin" className="mt-4">
                <Link to="/login">Go to Login</Link>
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                form.handleSubmit()
              }}
              className="space-y-6"
            >
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="space-y-2">
                        <FieldLabel htmlFor={field.name}>
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
                            onChange={(e) =>
                              field.handleChange(e.target.value)
                            }
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
                        <FieldLabel htmlFor={field.name}>
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
                            onChange={(e) =>
                              field.handleChange(e.target.value)
                            }
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

              <Button type="submit" className="text-md h-12 w-full font-bold">
                Reset Password
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
    }
  },
  component: ResetPasswordPage,
})
