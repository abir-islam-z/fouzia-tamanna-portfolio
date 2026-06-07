import {
    deleteCookie,
    getCookie,
    setCookie,
} from "@tanstack/react-start/server"
import bcrypt from "bcryptjs"
import { ZodError } from "zod"
import { decrypt, encrypt } from "./auth"
import type { LoginSchema } from "./cms"
import { getDb } from "./db.server"
import {
    buildObjectKey,
    checkR2Config,
    deleteFromR2,
    getPresignedPutUrl,
    getPublicUrl,
    uploadToR2,
} from "./r2.server"

// --- UTILS ---
const formatZodError = (err: any) => {
  if (err instanceof ZodError) {
    return err.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")
  }
  return err?.message || "An unexpected error occurred"
}

export async function checkAuth() {
  const session = getCookie("session")
  if (!session) throw new Error("Unauthorized")
  try {
    const payload = await decrypt(session)
    const db = await getDb()
    const user = await db.user.findUnique({ where: { id: payload.userId } })
    if (!user) throw new Error("Unauthorized")
    return payload
  } catch (e) {
    throw new Error("Unauthorized")
  }
}

// --- AUTH ---
export async function loginServer(data: LoginSchema) {
  try {
    const { username, password } = data
    console.log("[CMS.SERVER] loginServer calling.", { username, password })
    const db = await getDb()
    const user = await db.user.findUniqueOrThrow({ where: { username } })
    const match = await bcrypt.compare(password, user.password)

    if (!match) throw new Error("Invalid credentials")

    const session = await encrypt({ userId: user.id, username: user.username })
    setCookie("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2, // 2 hours
    })

    return { success: true }
  } catch (error) {
    throw new Error(formatZodError(error))
  }
}

export async function logoutServer() {
  await deleteCookie("session")
  return { success: true }
}

export async function getUserServer() {
  const session = getCookie("session")
  if (!session) return null
  try {
    const payload = await decrypt(session)
    const db = await getDb()
    const user = await db.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      await deleteCookie("session")
      return null
    }
    return payload
  } catch (e) {
    return null
  }
}

// --- HERO ---
export async function getHeroServer() {
  console.log("[CMS.SERVER] getHeroServer calling.")
  let hero = await (
    await getDb()
  ).hero.findUnique({
    where: { id: "singleton" },
  })
  if (!hero) {
    hero = {
      id: "singleton",
      introBadge: "INTRO",
      title: "Meet John",
      description: "60 second intro",
      videoDuration: "0:60",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      location: "London, UK",
      sponsorshipInfo: "No sponsorship needed",
      resumeUrl: "#",
      openToWork: true,
      updatedAt: new Date(),
    }
  }
  return hero
}

export async function updateHeroServer(data: any) {
  try {
    await checkAuth()
    return await (
      await getDb()
    ).hero.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

// --- FOOTER ---
export async function getFooterServer() {
  console.log("[CMS.SERVER] getFooterServer calling.")
  let footer = await (
    await getDb()
  ).footer.findUnique({
    where: { id: "singleton" },
  })
  if (!footer) {
    footer = {
      id: "singleton",
      bio: "Full Stack Developer specializing in modern web technologies. Based in Silicon Valley, CA.",
      email: "hello@johndoe.com",
      linkedin: "#",
      github: "#",
      twitter: "#",
      availability: "Open for Opportunities",
      updatedAt: new Date(),
    }
  }
  return footer
}

export async function updateFooterServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    return await (
      await getDb()
    ).footer.upsert({
      where: { id: "singleton" },
      update: rest,
      create: { id: "singleton", ...rest },
    })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

// --- STATS ---
export async function getStatsServer() {
  console.log("[CMS.SERVER] getStatsServer calling.")
  return await (
    await getDb()
  ).stat.findMany({
    orderBy: { order: "asc" },
  })
}

export async function updateStatServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    if (id) {
      return await (await getDb()).stat.update({ where: { id }, data: rest })
    }
    return await (await getDb()).stat.create({ data: rest })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deleteStatServer(id: number) {
  await checkAuth()
  return await (await getDb()).stat.delete({ where: { id } })
}

// --- EXPERIENCE ---
export async function getExperienceServer() {
  return await (
    await getDb()
  ).experience.findMany({
    orderBy: { order: "asc" },
  })
}

export async function updateExperienceServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    if (id) {
      return await (
        await getDb()
      ).experience.update({ where: { id }, data: rest })
    }
    return await (await getDb()).experience.create({ data: rest })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deleteExperienceServer(id: number) {
  await checkAuth()
  return await (await getDb()).experience.delete({ where: { id } })
}

// --- PROJECTS ---
export async function getProjectsServer() {
  return await (
    await getDb()
  ).project.findMany({
    orderBy: { order: "asc" },
  })
}

export async function updateProjectServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    if (id) {
      return await (await getDb()).project.update({ where: { id }, data: rest })
    }
    return await (await getDb()).project.create({ data: rest })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deleteProjectServer(id: number) {
  await checkAuth()
  return await (await getDb()).project.delete({ where: { id } })
}

// --- CONTACT ---
export async function submitContactServer(data: any) {
  try {
    return await (await getDb()).contactMessage.create({ data })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function getContactMessagesServer() {
  await checkAuth()
  return await (
    await getDb()
  ).contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  })
}

// --- TESTIMONIALS ---
export async function getTestimonialsServer() {
  return await (
    await getDb()
  ).testimonial.findMany({
    orderBy: { order: "asc" },
  })
}

export async function updateTestimonialServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    if (id) {
      return await (
        await getDb()
      ).testimonial.update({ where: { id }, data: rest })
    }
    return await (await getDb()).testimonial.create({ data: rest })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deleteTestimonialServer(id: number) {
  await checkAuth()
  return await (await getDb()).testimonial.delete({ where: { id } })
}

// --- CERTIFICATIONS ---
export async function getCertificationsServer() {
  return await (
    await getDb()
  ).certification.findMany({
    orderBy: { order: "asc" },
  })
}

export async function updateCertificationServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    if (id) {
      return await (
        await getDb()
      ).certification.update({ where: { id }, data: rest })
    }
    return await (await getDb()).certification.create({ data: rest })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deleteCertificationServer(id: number) {
  await checkAuth()
  return await (await getDb()).certification.delete({ where: { id } })
}

// --- MEDIA LIBRARY ---

export async function getMediaServer(folder?: string) {
  return await (
    await getDb()
  ).media.findMany({
    where: folder ? { folder } : undefined,
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { id: true, username: true } } },
  })
}

export async function getMediaItemServer(id: number) {
  return await (
    await getDb()
  ).media.findUnique({ where: { id } })
}

/**
 * Upload a file to R2 and persist a Media record.
 * Accepts a FormData payload so it works with both
 * server functions and direct fetch calls.
 */
export async function uploadMediaServer(input: {
  fileName: string
  mimeType: string
  size: number
  // base64-encoded file body (preferred — works with JSON server functions)
  dataBase64?: string
  // raw Uint8Array (when called directly with binary data)
  data?: Uint8Array
  folder?: string
  alt?: string
}) {
  await checkAuth()

  if (!input.fileName) throw new Error("fileName is required")
  if (!input.mimeType) throw new Error("mimeType is required")
  if (input.size <= 0) throw new Error("File is empty")

  // 25 MB hard cap — adjust per your R2/bucket limits.
  const MAX_BYTES = 25 * 1024 * 1024
  if (input.size > MAX_BYTES) {
    throw new Error(
      `File too large (${(input.size / 1024 / 1024).toFixed(2)} MB). Max is 25 MB.`
    )
  }

  // Decode body
  let body: Uint8Array
  if (input.data) {
    body = input.data
  } else if (input.dataBase64) {
    body = Uint8Array.from(Buffer.from(input.dataBase64, "base64"))
  } else {
    throw new Error("No file data provided")
  }

  const key = buildObjectKey(input.fileName, input.folder ?? "general")
  const { url } = await uploadToR2({
    key,
    body,
    contentType: input.mimeType,
  })

  const session = await getUserServer().catch(() => null)
  const uploadedById = session?.userId ?? null

  const created = await (
    await getDb()
  ).media.create({
    data: {
      key,
      url,
      originalName: input.fileName,
      mimeType: input.mimeType,
      size: input.size,
      folder: input.folder ?? "general",
      alt: input.alt ?? null,
      uploadedById: typeof uploadedById === "number" ? uploadedById : null,
    },
    include: { uploadedBy: { select: { id: true, username: true } } },
  })

  return created
}

/**
 * Issue a presigned URL the browser can use to upload directly to R2.
 * The client then calls `finalizeMediaUpload` to persist the DB record.
 */
export async function getPresignedUploadServer(input: {
  fileName: string
  mimeType: string
  folder?: string
}) {
  await checkAuth()
  if (!input.fileName) throw new Error("fileName is required")
  if (!input.mimeType) throw new Error("mimeType is required")

  const key = buildObjectKey(input.fileName, input.folder ?? "general")
  const uploadUrl = await getPresignedPutUrl({
    key,
    contentType: input.mimeType,
    expiresIn: 60 * 5,
  })
  const publicUrl = getPublicUrl(key)

  return { key, uploadUrl, publicUrl }
}

/**
 * Persist a Media record after the client has uploaded directly to R2
 * via a presigned URL.
 */
export async function finalizeMediaUpload(input: {
  key: string
  originalName: string
  mimeType: string
  size: number
  folder?: string
  alt?: string
}) {
  await checkAuth()
  const session = await getUserServer().catch(() => null)
  const uploadedById = session?.userId ?? null

  return await (
    await getDb()
  ).media.create({
    data: {
      key: input.key,
      url: getPublicUrl(input.key),
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      folder: input.folder ?? "general",
      alt: input.alt ?? null,
      uploadedById: typeof uploadedById === "number" ? uploadedById : null,
    },
    include: { uploadedBy: { select: { id: true, username: true } } },
  })
}

export async function updateMediaServer(input: {
  id: number
  alt?: string | null
  folder?: string
  originalName?: string
}) {
  await checkAuth()
  const { id, ...rest } = input
  return await (await getDb()).media.update({
    where: { id },
    data: rest,
  })
}

export async function deleteMediaServer(id: number) {
  await checkAuth()
  const item = await (await getDb()).media.findUnique({ where: { id } })
  if (!item) return { ok: true }
  await deleteFromR2(item.key)
  return await (await getDb()).media.delete({ where: { id } })
}

export async function getR2StatusServer() {
  await checkAuth()
  return checkR2Config()
}
