import { Resend } from "resend"

const resendApiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"

function getClient() {
  if (!resendApiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Emails will not be sent."
    )
  }
  return new Resend(resendApiKey)
}

/** Check if Resend is configured */
export function isEmailConfigured(): boolean {
  return !!resendApiKey
}

// --- Password Reset Email ---
export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const resend = getClient()

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111;">Password Reset</h2>
        <p style="color: #333;">You requested a password reset for your portfolio admin account.</p>
        <p style="color: #333;">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; background: #22c55e; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  })

  if (error) {
    console.error("[EMAIL] Failed to send password reset email:", error)
    throw new Error(error.message || "Failed to send email")
  }

  return data
}

// --- Contact Form Notification Email ---
export async function sendContactNotification(
  to: string,
  data: { name: string; email: string; message: string }
) {
  const resend = getClient()

  const { data: result, error } = await resend.emails.send({
    from: fromEmail,
    to,
    subject: `New Contact Message from ${data.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #111;">New Contact Message</h2>
        <p style="color: #333;"><strong>From:</strong> ${data.name} &lt;${data.email}&gt;</p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #333; margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="color: #999; font-size: 13px;">Sent from your portfolio contact form.</p>
      </div>
    `,
  })

  if (error) {
    console.error("[EMAIL] Failed to send contact notification:", error)
    throw new Error(error.message || "Failed to send email")
  }

  return result
}
