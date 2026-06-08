import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import PasswordField from "@/components/ui/password-field"
import { getGoogleAuthUrl, login, loginSchema } from "@/lib/cms"
import { RiLockPasswordLine, RiUser3Line } from "@remixicon/react"
import { useForm } from "@tanstack/react-form"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"

function LoginPage() {
  const navigate = useNavigate()

  const form = useForm({
    validators: {
      onChange: loginSchema,
    },
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        await login({
          data: { username: value.username, password: value.password },
        })
        toast.success("Logged in successfully")
        navigate({
          to: "/admin",
        })
      } catch (error) {
        toast.error("Login failed. Please try again.")
      }
    },
  })

  const handleGoogleLogin = async () => {
    try {
      const { url } = await getGoogleAuthUrl()
      window.location.href = url
    } catch (error) {
      toast.error("Failed to initiate Google login")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <RiLockPasswordLine size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Log in to manage your portfolio
          </p>
        </div>

        <Card className="border-border bg-secondary/30 p-8">
          {/* Google Login Button */}
          <Button
            type="button"
            variant="outline"
            className="mb-6 h-12 w-full gap-3 border-border bg-background/50 font-bold"
            onClick={handleGoogleLogin}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.166 6.656 3.58 9 3.58Z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with credentials
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            <form.Field
              name="username"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="space-y-2">
                      <FieldLabel htmlFor={field.name}>Username</FieldLabel>
                      <div className="relative">
                        <RiUser3Line
                          className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                          size={18}
                        />
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="username"
                          autoComplete="off"
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
              name="password"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                        <Link
                          to="/forgot-password"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
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
                          autoComplete="off"
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
              Login
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
})
