import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { forgotPassword, forgotPasswordSchema } from "@/lib/cms"
import { RiMailLine } from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm({
    validators: {
      onChange: forgotPasswordSchema,
    },
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await forgotPassword({ data: { email: value.email } })
        setSubmitted(true)
        toast.success("If an account exists, a reset link has been sent.")
      } catch (error) {
        toast.error("Something went wrong. Please try again.")
      }
    },
  })

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <RiMailLine size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-2 text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <Card className="border-border bg-secondary/30 p-8">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <RiMailLine size={24} />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account exists with that email, you'll receive a password
                reset link shortly. Check your inbox and spam folder.
              </p>
              <Button asChild variant="admin" className="mt-4">
                <Link to="/login">Back to Login</Link>
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
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid
                  return (
                    <Field data-invalid={isInvalid}>
                      <div className="space-y-2">
                        <FieldLabel htmlFor={field.name}>
                          Email Address
                        </FieldLabel>
                        <div className="relative">
                          <RiMailLine
                            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                            size={18}
                          />
                          <Input
                            id={field.name}
                            name={field.name}
                            type="email"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) =>
                              field.handleChange(e.target.value)
                            }
                            aria-invalid={isInvalid}
                            placeholder="you@gmail.com"
                            autoComplete="email"
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
                Send Reset Link
              </Button>

              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-primary hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
})
