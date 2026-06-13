import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

/**
 * Client-safe CMS module.
 *
 * Every `createServerFn()` handler dynamically imports `./cms.server`
 * inside its body. This breaks the static import chain that the
 * TanStack Start import-protection plugin would otherwise detect
 * (cms → cms.server → db.server), so the client bundle never resolves
 * the `.server` modules.
 *
 * The server code is only loaded when an RPC is actually invoked,
 * which always happens on the server.
 */

// --- SCHEMAS (shared, isomorphic) ---
export const loginSchema = z.object({
  email: z.email("Invalid email address").trim(),
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
  typedLines: z.string().optional(),
  cvButtonLabel: z.string().optional(),
  researchButtonLabel: z.string().optional(),
})

export const statSchema = z.object({
  id: z.string().optional(),
  value: z.string(),
  label: z.string(),
  order: z.number().default(0),
})

export const experienceSchema = z.object({
  id: z.string().optional(),
  role: z.string(),
  company: z.string(),
  period: z.string(),
  description: z.string(),
  skills: z.string(),
  order: z.number().default(0),
})

export const projectSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(1, "Slug is required").trim(),
  title: z.string().min(1, "Title is required").trim(),
  summary: z.string().default(""),
  caseStudy: z.string().default(""),
  tags: z.string().default(""),
  isFeatured: z.boolean().default(false),
  link: z.string().nullable().optional(),
  github: z.string().nullable().optional(),
  order: z.number().default(0),
  gallery: z
    .array(z.object({ mediaId: z.string(), order: z.number().default(0) }))
    .optional(),
})

export const testimonialSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  role: z.string(),
  content: z.string(),
  image: z.string().nullable().optional(),
  order: z.number().default(0),
})

export const certificationSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  link: z.string().nullable().optional(),
  order: z.number().default(0),
})

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  level: z.string().optional(),
  order: z.number().default(0),
})

export const publicationSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").trim(),
  authors: z.string().min(1, "Authors are required").trim(),
  venue: z.string().min(1, "Venue is required").trim(),
  year: z.string().min(1, "Year is required").trim(),
  abstract: z.string().min(1, "Abstract is required").trim(),
  link: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .nullable()
    .optional(),
  tags: z.string().default(""),
  type: z
    .enum(["journal", "conference", "preprint", "workshop", "book-chapter"])
    .default("journal"),
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

// --- LANDING SECTIONS / SITE SETTINGS ---
export const landingSectionSchema = z.object({
  id: z.string(),
  label: z.string().default(""),
  enabled: z.boolean().default(true),
  order: z.number().default(0),
  badge: z.string().nullable().optional(),
  heading: z.string().nullable().optional(),
  subtext: z.string().nullable().optional(),
  ctaLabel: z.string().nullable().optional(),
  ctaHref: z.string().nullable().optional(),
})

export const landingSectionInputSchema = landingSectionSchema

export const reorderLandingSectionsSchema = z.object({
  orderedIds: z.array(z.string()),
})

export const siteSettingsSchema = z.object({
  heroHeadline: z.string().nullable().optional(),
  heroCtaPrimary: z.string().nullable().optional(),
  heroCtaSecondary: z.string().nullable().optional(),
  contactHeading: z.string().nullable().optional(),
  contactSubtext: z.string().nullable().optional(),
  marqueeItems: z.string().nullable().optional(),
  navbarBrand: z.string().nullable().optional(),
  textLogo: z.string().nullable().optional(),
})

// --- AUTH ---
export const login = createServerFn({ method: "POST" })
  .validator(loginSchema)
  .handler(async ({ data }) => {
    const { loginServer } = await import("./cms.server")
    return loginServer(data)
  })

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  const { logoutServer } = await import("./cms.server")
  return logoutServer()
})

export const getUser = createServerFn({ method: "GET" }).handler(async () => {
  const { getUserServer } = await import("./cms.server")
  return getUserServer()
})

// --- HERO & GLOBAL ---
export const getHero = createServerFn({ method: "GET" }).handler(async () => {
  const { getHeroServer } = await import("./cms.server")
  return getHeroServer()
})

export const updateHero = createServerFn({ method: "POST" })
  .validator(heroSchema)
  .handler(async ({ data }) => {
    const { updateHeroServer } = await import("./cms.server")
    return updateHeroServer(data)
  })

export const getFooter = createServerFn({ method: "GET" }).handler(async () => {
  const { getFooterServer } = await import("./cms.server")
  return getFooterServer()
})

export const updateFooter = createServerFn({ method: "POST" })
  .validator(footerSchema)
  .handler(async ({ data }) => {
    const { updateFooterServer } = await import("./cms.server")
    return updateFooterServer(data)
  })

// --- STATS ---
export const getStats = createServerFn({ method: "GET" }).handler(async () => {
  const { getStatsServer } = await import("./cms.server")
  return getStatsServer()
})

export const updateStat = createServerFn({ method: "POST" })
  .validator(statSchema)
  .handler(async ({ data }) => {
    const { updateStatServer } = await import("./cms.server")
    return updateStatServer(data)
  })

export const deleteStat = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteStatServer } = await import("./cms.server")
    return deleteStatServer(id)
  })

// --- EXPERIENCE ---
export const getExperience = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getExperienceServer } = await import("./cms.server")
    return getExperienceServer()
  }
)

export const updateExperience = createServerFn({ method: "POST" })
  .validator(experienceSchema)
  .handler(async ({ data }) => {
    const { updateExperienceServer } = await import("./cms.server")
    return updateExperienceServer(data)
  })

export const deleteExperience = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteExperienceServer } = await import("./cms.server")
    return deleteExperienceServer(id)
  })

// --- PROJECTS ---
export const getProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getProjectsServer } = await import("./cms.server")
    return getProjectsServer()
  }
)

export const updateProject = createServerFn({ method: "POST" })
  .validator(projectSchema)
  .handler(async ({ data }) => {
    const { updateProjectServer } = await import("./cms.server")
    return updateProjectServer(data)
  })

export const deleteProject = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteProjectServer } = await import("./cms.server")
    return deleteProjectServer(id)
  })

// --- CONTACT MESSAGES ---
export const submitContact = createServerFn({ method: "POST" })
  .validator(contactSchema)
  .handler(async ({ data }) => {
    const { submitContactServer } = await import("./cms.server")
    return submitContactServer(data)
  })

export const getContactMessages = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getContactMessagesServer } = await import("./cms.server")
    return getContactMessagesServer()
  }
)

// --- TESTIMONIALS ---
export const getTestimonials = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getTestimonialsServer } = await import("./cms.server")
    return getTestimonialsServer()
  }
)

export const updateTestimonial = createServerFn({ method: "POST" })
  .validator(testimonialSchema)
  .handler(async ({ data }) => {
    const { updateTestimonialServer } = await import("./cms.server")
    return updateTestimonialServer(data)
  })

export const deleteTestimonial = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteTestimonialServer } = await import("./cms.server")
    return deleteTestimonialServer(id)
  })

// --- CERTIFICATIONS ---
export const getCertifications = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getCertificationsServer } = await import("./cms.server")
    return getCertificationsServer()
  }
)

export const updateCertification = createServerFn({ method: "POST" })
  .validator(certificationSchema)
  .handler(async ({ data }) => {
    const { updateCertificationServer } = await import("./cms.server")
    return updateCertificationServer(data)
  })

export const deleteCertification = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteCertificationServer } = await import("./cms.server")
    return deleteCertificationServer(id)
  })

// --- SKILLS ---
export const getSkills = createServerFn({ method: "GET" }).handler(async () => {
  const { getSkillsServer } = await import("./cms.server")
  return getSkillsServer()
})

export const updateSkill = createServerFn({ method: "POST" })
  .validator(skillSchema)
  .handler(async ({ data }) => {
    const { updateSkillServer } = await import("./cms.server")
    return updateSkillServer(data)
  })

export const deleteSkill = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteSkillServer } = await import("./cms.server")
    return deleteSkillServer(id)
  })

// --- PUBLICATIONS ---
export const getPublications = createServerFn({ method: "GET" })
  .validator(
    z.object({ includeUnpublished: z.boolean().optional() }).optional()
  )
  .handler(async ({ data }) => {
    const { getPublicationsServer } = await import("./cms.server")
    return getPublicationsServer(data?.includeUnpublished ?? false)
  })

export const updatePublication = createServerFn({ method: "POST" })
  .validator(publicationSchema)
  .handler(async ({ data }) => {
    const { updatePublicationServer } = await import("./cms.server")
    return updatePublicationServer(data)
  })

export const deletePublication = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deletePublicationServer } = await import("./cms.server")
    return deletePublicationServer(id)
  })

// --- MEDIA LIBRARY ---

export const getMedia = createServerFn({ method: "GET" })
  .validator(z.object({ folder: z.string().optional() }).optional())
  .handler(async ({ data }) => {
    const { getMediaServer } = await import("./cms.server")
    return getMediaServer(data?.folder)
  })

export const getMediaItem = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { getMediaItemServer } = await import("./cms.server")
    return getMediaItemServer(id)
  })

export const getR2Status = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getR2StatusServer } = await import("./cms.server")
    return getR2StatusServer()
  }
)

export const getPresignedUpload = createServerFn({ method: "POST" })
  .validator(
    z.object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      folder: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { getPresignedUploadServer } = await import("./cms.server")
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
    const { finalizeMediaUpload } = await import("./cms.server")
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
    const { uploadMediaServer } = await import("./cms.server")
    return uploadMediaServer(data)
  })

export const updateMedia = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string(),
      alt: z.string().nullable().optional(),
      folder: z.string().optional(),
      originalName: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    const { updateMediaServer } = await import("./cms.server")
    return updateMediaServer(data)
  })

export const deleteMedia = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: id }) => {
    const { deleteMediaServer } = await import("./cms.server")
    return deleteMediaServer(id)
  })

// --- LANDING SECTIONS ---
export const getLandingSections = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getLandingSectionsServer } = await import("./cms.server")
    return getLandingSectionsServer()
  }
)

export const updateLandingSection = createServerFn({ method: "POST" })
  .validator(landingSectionInputSchema)
  .handler(async ({ data }) => {
    const { updateLandingSectionServer } = await import("./cms.server")
    return updateLandingSectionServer(data)
  })

export const reorderLandingSections = createServerFn({ method: "POST" })
  .validator(reorderLandingSectionsSchema)
  .handler(async ({ data }) => {
    const { reorderLandingSectionsServer } = await import("./cms.server")
    return reorderLandingSectionsServer(data.orderedIds)
  })

// --- SITE SETTINGS ---
export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getSiteSettingsServer } = await import("./cms.server")
    return getSiteSettingsServer()
  }
)

export const updateSiteSettings = createServerFn({ method: "POST" })
  .validator(siteSettingsSchema)
  .handler(async ({ data }) => {
    const { updateSiteSettingsServer } = await import("./cms.server")
    return updateSiteSettingsServer(data)
  })

// --- PROJECT BY SLUG (public) ---
export const getProjectBySlug = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: slug }) => {
    const { getProjectBySlugServer } = await import("./cms.server")
    return getProjectBySlugServer(slug)
  })

// --- GOOGLE OAUTH ---
export const getGoogleAuthUrl = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getGoogleAuthUrlServer } = await import("./cms.server")
    return getGoogleAuthUrlServer()
  }
)

export const googleLoginCallback = createServerFn({ method: "POST" })
  .validator(z.string())
  .handler(async ({ data: code }) => {
    const { googleLoginCallbackServer } = await import("./cms.server")
    return googleLoginCallbackServer(code)
  })

// --- USER PROFILE ---
export const getUserProfile = createServerFn({ method: "GET" }).handler(
  async () => {
    const { getUserProfileServer } = await import("./cms.server")
    return getUserProfileServer()
  }
)

// --- SEND PASSWORD SETUP EMAIL ---
export const sendPasswordSetupEmail = createServerFn({
  method: "POST",
}).handler(async () => {
  const { sendPasswordSetupEmailServer } = await import("./cms.server")
  return sendPasswordSetupEmailServer()
})

// --- CHANGE PASSWORD ---
export const changePasswordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
})
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

export const changePassword = createServerFn({ method: "POST" })
  .validator(changePasswordSchema)
  .handler(async ({ data }) => {
    const { changePasswordServer } = await import("./cms.server")
    return changePasswordServer(data)
  })

// --- FORGOT PASSWORD ---
export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
})
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const forgotPassword = createServerFn({ method: "POST" })
  .validator(forgotPasswordSchema)
  .handler(async ({ data }) => {
    const { forgotPasswordServer } = await import("./cms.server")
    return forgotPasswordServer(data)
  })

// --- RESET PASSWORD ---
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
})
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export const resetPassword = createServerFn({ method: "POST" })
  .validator(resetPasswordSchema)
  .handler(async ({ data }) => {
    const { resetPasswordServer } = await import("./cms.server")
    return resetPasswordServer(data)
  })
