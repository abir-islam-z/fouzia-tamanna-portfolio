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
      introBadge: "OPEN TO WORK — SOC ANALYST",
      subtitle: "MSc Computer Networks & Systems Security",
      title: "Fouzia Tamanna",
      description:
        "Network Security & SOC Analyst specializing in threat detection, incident response, and systems security.",
      location: "London, UK",
      sponsorshipInfo: "No sponsorship needed",
      resumeUrl: "#",
      openToWork: true,
      logoUrl: null,
      logoKey: null,
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
      bio: "Network Security & SOC Analyst focused on threat detection, incident response, and systems security. Based in London, UK.",
      email: "hello@example.com",
      linkedin: "#",
      github: "#",
      twitter: "#",
      availability: "Open for SOC Analyst & Network Security Roles",
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

export async function deleteStatServer(id: string) {
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

export async function deleteExperienceServer(id: string) {
  await checkAuth()
  return await (await getDb()).experience.delete({ where: { id } })
}

// --- PROJECTS ---
export async function getProjectsServer() {
  return await (
    await getDb()
  ).project.findMany({
    orderBy: { order: "asc" },
    include: {
      gallery: {
        include: { media: true },
        orderBy: { order: "asc" },
      },
    },
  })
}

export async function getProjectBySlugServer(slug: string) {
  return await (
    await getDb()
  ).project.findUnique({
    where: { slug },
    include: {
      gallery: {
        include: { media: true },
        orderBy: { order: "asc" },
      },
    },
  })
}

export async function updateProjectServer(data: any) {
  try {
    await checkAuth()
    const { id, gallery, ...rest } = data

    if (id) {
      // Update main row
      const project = await (
        await getDb()
      ).project.update({ where: { id }, data: rest })

      // Replace gallery if provided
      if (Array.isArray(gallery)) {
        await (
          await getDb()
        ).projectGallery.deleteMany({ where: { projectId: id } })
        if (gallery.length > 0) {
          await (
            await getDb()
          ).projectGallery.createMany({
            data: gallery.map((g: any, idx: number) => ({
              projectId: id,
              mediaId: g.mediaId,
              order: g.order ?? idx,
            })),
          })
        }
      }
      return project
    }

    const { slug } = rest
    if (!slug) throw new Error("Slug is required")

    const { gallery: _, ...createRest } = data
    const project = await (await getDb()).project.create({ data: createRest })

    if (Array.isArray(gallery) && gallery.length > 0) {
      await (
        await getDb()
      ).projectGallery.createMany({
        data: gallery.map((g: any, idx: number) => ({
          projectId: project.id,
          mediaId: g.mediaId,
          order: g.order ?? idx,
        })),
      })
    }
    return project
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deleteProjectServer(id: string) {
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

export async function deleteTestimonialServer(id: string) {
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

export async function deleteCertificationServer(id: string) {
  await checkAuth()
  return await (await getDb()).certification.delete({ where: { id } })
}

// --- PUBLICATIONS ---
export async function getPublicationsServer(includeUnpublished = false) {
  return await (
    await getDb()
  ).publication.findMany({
    where: includeUnpublished ? undefined : { isPublished: true },
    orderBy: [{ order: "asc" }, { year: "desc" }],
  })
}

export async function updatePublicationServer(data: any) {
  try {
    await checkAuth()
    const { id, ...rest } = data
    // Normalize empty link to null
    if (rest.link === "") rest.link = null
    if (id) {
      return await (
        await getDb()
      ).publication.update({ where: { id }, data: rest })
    }
    return await (await getDb()).publication.create({ data: rest })
  } catch (error: any) {
    throw new Error(formatZodError(error))
  }
}

export async function deletePublicationServer(id: string) {
  await checkAuth()
  return await (await getDb()).publication.delete({ where: { id } })
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

export async function getMediaItemServer(id: string) {
  return await (await getDb()).media.findUnique({ where: { id } })
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
      uploadedById: typeof uploadedById === "string" ? uploadedById : null,
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
      uploadedById: typeof uploadedById === "string" ? uploadedById : null,
    },
    include: { uploadedBy: { select: { id: true, username: true } } },
  })
}

export async function updateMediaServer(input: {
  id: string
  alt?: string | null
  folder?: string
  originalName?: string
}) {
  await checkAuth()
  const { id, ...rest } = input
  return await (
    await getDb()
  ).media.update({
    where: { id },
    data: rest,
  })
}

export async function deleteMediaServer(id: string) {
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

// --- LANDING SECTIONS ---
const DEFAULT_LANDING_SECTIONS = [
  { id: "hero", label: "Hero", badge: "// SECURE_SESSION.0001", order: 1 },
  { id: "stats", label: "Stats / Profile", badge: "// PROFILE.SYS", order: 2 },
  { id: "experience", label: "Experience", badge: "// TIMELINE.LOG", order: 3 },
  { id: "projects", label: "Projects", badge: "// PROJECTS.MKD", order: 4 },
  {
    id: "testimonials",
    label: "Testimonials",
    badge: "// PEER_REVIEWS.LOG",
    order: 5,
  },
  {
    id: "certifications",
    label: "Certifications",
    badge: "// CREDENTIALS.CRT",
    order: 6,
  },
  {
    id: "publications",
    label: "Publications",
    badge: "// RESEARCH · PUBLICATIONS",
    order: 7,
  },
  { id: "contact", label: "Contact", badge: "// CONTACT.SH", order: 8 },
]

export async function getLandingSectionsServer() {
  const db = await getDb()
  let rows = await db.landingSection.findMany({ orderBy: { order: "asc" } })

  if (rows.length === 0) {
    // Seed defaults if empty
    for (const s of DEFAULT_LANDING_SECTIONS) {
      await db.landingSection.create({
        data: {
          id: s.id,
          label: s.label,
          badge: s.badge,
          order: s.order,
          updatedAt: new Date(),
        },
      })
    }
    rows = await db.landingSection.findMany({ orderBy: { order: "asc" } })
  }

  return rows
}

export async function updateLandingSectionServer(data: any) {
  await checkAuth()
  const db = await getDb()
  const { id, ...rest } = data
  return await db.landingSection.upsert({
    where: { id },
    update: { ...rest, updatedAt: new Date() },
    create: { ...rest, id, updatedAt: new Date() },
  })
}

export async function reorderLandingSectionsServer(orderedIds: string[]) {
  await checkAuth()
  const db = await getDb()
  await db.$transaction(
    orderedIds.map((id, idx) =>
      db.landingSection.update({
        where: { id },
        data: { order: idx + 1, updatedAt: new Date() },
      })
    )
  )
  return { ok: true }
}

// --- SITE SETTINGS ---
export async function getSiteSettingsServer() {
  const db = await getDb()
  let row = await db.siteSettings.findUnique({ where: { id: "singleton" } })
  if (!row) {
    row = await db.siteSettings.create({
      data: { id: "singleton", updatedAt: new Date() },
    })
  }
  return row
}

export async function updateSiteSettingsServer(data: any) {
  await checkAuth()
  const db = await getDb()
  return await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: { ...data, updatedAt: new Date() },
    create: { id: "singleton", ...data, updatedAt: new Date() },
  })
}
