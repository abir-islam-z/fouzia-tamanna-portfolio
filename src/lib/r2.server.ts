import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { randomUUID } from "node:crypto"

/**
 * Cloudflare R2 client (S3-compatible).
 *
 * Accepted env vars (any of the following aliases work):
 *  - R2_ACCOUNT_ID                  → Cloudflare account ID
 *  - R2_ENDPOINT_URL                → S3-compatible endpoint, e.g. https://<account>.r2.cloudflarestorage.com
 *                                     (account ID is auto-extracted from the host)
 *  - R2_ACCESS_KEY_ID               → S3 access key
 *  - R2_SECRET_ACCESS_KEY           → S3 secret key
 *  - R2_BUCKET  |  R2_BUCKET_NAME   → Bucket name
 *  - R2_PUBLIC_URL                  → Public CDN URL (custom domain or https://pub-…r2.dev) — no trailing slash
 *
 * R2_TOKEN_VALUE is the Cloudflare API token (for the Cloudflare management API),
 * which is NOT used for S3 operations and is therefore optional here.
 */

let r2Client: S3Client | null = null

function deriveAccountIdFromEndpoint(endpoint: string): string | null {
  try {
    const host = new URL(endpoint).hostname
    // Default R2 endpoint pattern: <accountId>.r2.cloudflarestorage.com
    const match = host.match(/^([a-f0-9]+)\.r2\.cloudflarestorage\.com$/i)
    if (match) return match[1]
    return null
  } catch {
    return null
  }
}

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID
  const endpointUrl = process.env.R2_ENDPOINT_URL
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET ?? process.env.R2_BUCKET_NAME
  const publicUrl = process.env.R2_PUBLIC_URL

  const missing: string[] = []
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID")
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY")
  if (!bucket) missing.push("R2_BUCKET (or R2_BUCKET_NAME)")
  if (!publicUrl) missing.push("R2_PUBLIC_URL")

  // Resolve account ID + endpoint
  let resolvedAccountId = accountId
  let resolvedEndpoint = endpointUrl
  if (!resolvedEndpoint) {
    if (resolvedAccountId) {
      resolvedEndpoint = `https://${resolvedAccountId}.r2.cloudflarestorage.com`
    } else {
      missing.push("R2_ACCOUNT_ID or R2_ENDPOINT_URL")
    }
  } else if (!resolvedAccountId) {
    const derived = deriveAccountIdFromEndpoint(resolvedEndpoint)
    if (derived) {
      resolvedAccountId = derived
    } else {
      // Endpoint provided but not the default R2 hostname — try to continue without accountId
      resolvedAccountId = ""
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required R2 environment variables: ${missing.join(", ")}`
    )
  }

  return {
    accountId: resolvedAccountId!,
    endpoint: resolvedEndpoint!,
    accessKeyId: accessKeyId!,
    secretAccessKey: secretAccessKey!,
    bucket: bucket!,
    publicUrl: publicUrl!.replace(/\/+$/, ""),
  }
}

export function getR2(): S3Client {
  if (r2Client) return r2Client

  const { endpoint, accessKeyId, secretAccessKey } = getR2Config()

  r2Client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return r2Client
}

export function getR2Bucket(): string {
  return getR2Config().bucket
}

export function getR2PublicUrlBase(): string {
  return getR2Config().publicUrl
}

/**
 * Build a safe object key for R2.
 * Example: `uploads/2026/06/08/abc123-photo.png`
 */
export function buildObjectKey(originalName: string, folder = "general"): string {
  const ext = originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf("."))
    : ""
  const safeFolder = folder
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_\-/]/g, "-")
    .toLowerCase()
  const id = randomUUID()
  const date = new Date()
  const yyyy = date.getUTCFullYear()
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(date.getUTCDate()).padStart(2, "0")
  return `${safeFolder}/${yyyy}/${mm}/${dd}/${id}${ext}`
}

export function getPublicUrl(key: string): string {
  return `${getR2PublicUrlBase()}/${key}`
}

/**
 * Upload a buffer to R2 and return the public URL + key.
 */
export async function uploadToR2(params: {
  key: string
  body: Buffer | Uint8Array
  contentType: string
  cacheControl?: string
}): Promise<{ key: string; url: string }> {
  const { key, body, contentType } = params
  const r2 = getR2()
  const bucket = getR2Bucket()

  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: params.cacheControl ?? "public, max-age=31536000, immutable",
    })
  )

  return { key, url: getPublicUrl(key) }
}

/**
 * Delete an object from R2 by key. No-op if the key is missing.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return
  const r2 = getR2()
  const bucket = getR2Bucket()

  try {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    )
  } catch (err) {
    // Log but don't throw — DB delete should still proceed.
    console.error(`[R2] Failed to delete object "${key}":`, err)
  }
}

/**
 * Generate a presigned PUT URL so the browser can upload directly to R2.
 * Use for large files to avoid streaming through the server.
 */
export async function getPresignedPutUrl(params: {
  key: string
  contentType: string
  expiresIn?: number
}): Promise<string> {
  const { key, contentType, expiresIn = 60 * 5 } = params
  const r2 = getR2()
  const bucket = getR2Bucket()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(r2, command, { expiresIn })
}

/**
 * Generate a presigned GET URL for a private object.
 */
export async function getPresignedGetUrl(
  key: string,
  expiresIn = 60 * 5
): Promise<string> {
  const r2 = getR2()
  const bucket = getR2Bucket()
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return getSignedUrl(r2, command, { expiresIn })
}

/**
 * Validate the R2 configuration without performing any operations.
 * Useful for surfacing setup errors early in the admin UI.
 */
export function checkR2Config(): { ok: true } | { ok: false; error: string } {
  try {
    getR2Config()
    return { ok: true }
  } catch (err: any) {
    return { ok: false, error: err?.message || "R2 misconfigured" }
  }
}
