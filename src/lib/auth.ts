import { createHash, randomBytes } from "crypto"
import { SignJWT, jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "super-secret-key-change-this"
)

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(SECRET)
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, SECRET, {
    algorithms: ["HS256"],
  })
  return payload
}

// --- GOOGLE OAuth ---

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  "http://localhost:3000/auth/google/callback"
const GOOGLE_ALLOWED_EMAIL = process.env.GOOGLE_ALLOWED_EMAIL || ""

export function getGoogleOAuthUrl() {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeGoogleCode(code: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  })

  if (!res.ok) {
    throw new Error("Failed to exchange Google authorization code")
  }

  return res.json() as Promise<{ id_token: string; access_token: string }>
}

export async function getGoogleUserInfo(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch Google user info")
  }

  return res.json() as Promise<{
    id: string
    email: string
    name: string
    picture: string
  }>
}

export function isGoogleLoginAllowed(email: string): boolean {
  if (!GOOGLE_ALLOWED_EMAIL) return false
  return email.toLowerCase() === GOOGLE_ALLOWED_EMAIL.toLowerCase()
}

// --- Password Reset Tokens ---

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex")
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}
