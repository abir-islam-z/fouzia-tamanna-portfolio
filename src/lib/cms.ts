import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
    applyR2CorsServer,
    deleteCertificationServer,
    deleteExperienceServer,
    deleteMediaServer,
    deleteProjectServer,
    deletePublicationServer,
    deleteStatServer,
    deleteTestimonialServer,
    finalizeMediaUpload,
    getCertificationsServer,
    getContactMessagesServer,
    getExperienceServer,
    getFooterServer,
    getHeroServer,
    getMediaItemServer,
    getMediaServer,
    getPresignedUploadServer,
    getProjectsServer,
    getPublicationsServer,
    getR2CorsStatusServer,
    getR2StatusServer,
    getStatsServer,
    getTestimonialsServer,
    getUserServer,
    loginServer,
    logoutServer,
    submitContactServer,
    updateCertificationServer,
    updateExperienceServer,
    updateFooterServer,
    updateHeroServer,
    updateMediaServer,
    updateProjectServer,
    updatePublicationServer,
    updateStatServer,
    updateTestimonialServer,
    uploadMediaServer,
} from "./cms.server"

// --- SCHEMAS (Shared) ---
export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})
export type LoginSchema = z.infer<typeof loginSchema>

export const heroSchema = z.object({
  introBadge: z.string().optional(),
  subtitle: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  sponsorshipInfo: z.string().optional(),
  resumeUrl: z.string().optional(),
  openToWork: z.boolean().optional(),
  logoUrl: z.string().nullable().optional(),
  logoKey: z.string().nullable().optional(),
})

export const statSchema = z.object({
  id: z.number().optional(),
  value: z.string(),
  label: z.string(),
  order: z.number().default(0),
})

export const experienceSchema = z.object({
  id: z.number().optional(),
  role: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string(),
  skills: z.string(),
  order: z.number().default(0),
})

export const projectSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  tags: z.string(),
  isFeatured: z.boolean().default(false),
  link: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  order: z.number().default(0),
})

export const testimonialSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  role: z.string(),
  content: z.string(),
  image: z.string().nullable().optional(),
  order: z.number().default(0),
})

export const certificationSchema = z.object({
  id: z.number().optional(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  link: z.string().nullable().optional(),
  order: z.number().default(0),
})

export const publicationSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "Title is required").trim(),
  authors: z.string().min(1, "Authors are required").trim(),
  venue: z.string().min(1, "Venue is required").trim(),
  year: z.string().min(1, "Year is required").trim(),
  abstract: z.string().min(1, "Abstract is required").trim(),
  link: z.string().url("Must be a valid URL").or(z.literal("")).nullable().optional(),
  tags: z.string().default(""),
  type: z.enum(["journal", "conference", "preprint", "workshop", "book-chapter"]).default("journal"),
  isPublished: z.boolean().default(true),
  order: z.number().default(0),
})
export type PublicationSchema = z.infer<typeof publicationSchema>

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address").trim(),
  message: z.string().min(1, "Message cannot be empty").trim(),
})

export const footerSchema = z.object({
  id: z.string().optional(),
  bio: z.string().default(""),
  email: z
    .string()
    .email("Invalid email address")
    .or(z.literal(""))
    .default(""),
  linkedin: z.string().default(""),
  github: z.string().default(""),
  twitter: z.string().default(""),
  availability: z.string().default(""),
})

// --- AUTH ---
export const login = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    return loginServer(data)
  })

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  return logoutServer()
})

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  return getUserServer()
})

// --- HERO & GLOBAL ---
export const getHero = createServerFn({ method: "GET" }).handler(async () => {
  return getHeroServer()
})

export const updateHero = createServerFn({ method: "POST" })
  .validator(heroSchema)
  .handler(async ({ data }) => {
    return updateHeroServer(data)
  })

export const getFooter = createServerFn({ method: "GET" }).handler(async () => {
  return getFooterServer()
})

export const updateFooter = createServerFn({ method: "POST" })
  .validator(footerSchema)
  .handler(async ({ data }) => {
    return updateFooterServer(data)
  })

// --- STATS ---
export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  return getStatsServer()
})

export const updateStat = createServerFn({ method: "POST" })
  .validator(statSchema)
  .handler(async ({ data }) => {
    return updateStatServer(data)
  })

export const deleteStat = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deleteStatServer(id)
  })

// --- EXPERIENCE ---
export const getExperience = createServerFn({ method: "GET" }).handler(
  async () => {
    return getExperienceServer()
  }
)

export const updateExperience = createServerFn({ method: "POST" })
  .validator(experienceSchema)
  .handler(async ({ data }) => {
    return updateExperienceServer(data)
  })

export const deleteExperience = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deleteExperienceServer(id)
  })

// --- PROJECTS ---
export const getProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    return getProjectsServer()
  }
)

export const updateProject = createServerFn({ method: "POST" })
  .validator(projectSchema)
  .handler(async ({ data }) => {
    return updateProjectServer(data)
  })

export const deleteProject = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deleteProjectServer(id)
  })

// --- CONTACT MESSAGES ---
export const submitContact = createServerFn({ method: "POST" })
  .validator(contactSchema)
  .handler(async ({ data }) => {
    return submitContactServer(data)
  })

export const getContactMessages = createServerFn({ method: "GET" }).handler(
  async () => {
    return getContactMessagesServer()
  }
)

// --- TESTIMONIALS ---
export const getTestimonials = createServerFn({ method: "GET" }).handler(
  async () => {
    return getTestimonialsServer()
  }
)

export const updateTestimonial = createServerFn({ method: "POST" })
  .validator(testimonialSchema)
  .handler(async ({ data }) => {
    return updateTestimonialServer(data)
  })

export const deleteTestimonial = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deleteTestimonialServer(id)
  })

// --- CERTIFICATIONS ---
export const getCertifications = createServerFn({ method: "GET" }).handler(
  async () => {
    return getCertificationsServer()
  }
)

export const updateCertification = createServerFn({ method: "POST" })
  .validator(certificationSchema)
  .handler(async ({ data }) => {
    return updateCertificationServer(data)
  })

export const deleteCertification = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deleteCertificationServer(id)
  })

// --- PUBLICATIONS ---
export const getPublications = createServerFn({ method: "GET" })
  .validator(
    z
      .object({ includeUnpublished: z.boolean().optional() })
      .optional()
  )
  .handler(async ({ data }) => {
    return getPublicationsServer(data?.includeUnpublished ?? false)
  })

export const updatePublication = createServerFn({ method: "POST" })
  .validator(publicationSchema)
  .handler(async ({ data }) => {
    return updatePublicationServer(data)
  })

export const deletePublication = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deletePublicationServer(id)
  })

// --- MEDIA LIBRARY ---

export const getMedia = createServerFn({ method: "GET" })
  .validator(
    z
      .object({ folder: z.string().optional() })
      .optional()
  )
  .handler(async ({ data }) => {
    return getMediaServer(data?.folder)
  })

export const getMediaItem = createServerFn({ method: "GET" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return getMediaItemServer(id)
  })

export const getR2Status = createServerFn({ method: "GET" }).handler(async () => {
  return getR2StatusServer()
})

export const getPresignedUpload = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      folder: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    return getPresignedUploadServer(data)
  })

export const finalizeMediaUploadFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      key: z.string().min(1),
      originalName: z.string().min(1),
      mimeType: z.string().min(1),
      size: z.number().int().positive(),
      folder: z.string().optional(),
      alt: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    return finalizeMediaUpload(data)
  })

export const uploadMedia = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      size: z.number().int().positive(),
      dataBase64: z.string().min(1),
      folder: z.string().optional(),
      alt: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    return uploadMediaServer(data)
  })

export const updateMedia = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number(),
      alt: z.string().nullable().optional(),
      folder: z.string().optional(),
      originalName: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    return updateMediaServer(data)
  })

export const deleteMedia = createServerFn({ method: "POST" })
  .validator(z.number())
  .handler(async ({ data: id }) => {
    return deleteMediaServer(id)
  })

// --- CORS management ---

export const getR2CorsStatus = createServerFn({ method: "GET" }).handler(async () => {
  return getR2CorsStatusServer()
})

export const applyR2Cors = createServerFn({ method: "POST" })
  .validator(z.object({ origins: z.array(z.string()).default([]) }))
  .handler(async ({ data }) => {
    return applyR2CorsServer(data)
  })
