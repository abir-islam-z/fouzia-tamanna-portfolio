import type { QueryClient } from "@tanstack/react-query"
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  deleteCertification,
  deleteExperience,
  deleteMedia,
  deleteProject,
  deletePublication,
  deleteStat,
  deleteTestimonial,
  finalizeMediaUploadFn,
  getCertifications,
  getContactMessages,
  getExperience,
  getFooter,
  getHero,
  getLandingSections,
  getMedia,
  getMediaItem,
  getPresignedUpload,
  getProjectBySlug,
  getProjects,
  getPublications,
  getR2Status,
  getSiteSettings,
  getStats,
  getTestimonials,
  reorderLandingSections,
  submitContact,
  updateCertification,
  updateExperience,
  updateFooter,
  updateHero,
  updateLandingSection,
  updateMedia,
  updateProject,
  updatePublication,
  updateSiteSettings,
  updateStat,
  updateTestimonial,
} from "./cms"

// ─── Router Context Helper ───────────────────────────────────────────
// TanStack Router's beforeLoad return values must be serializable, so we
// cannot pass QueryClient through beforeLoad. Instead, it lives on the
// router context and this helper extracts it with a single type assertion.
export function getQueryClient(context: Record<string, unknown>): QueryClient {
  return (context as { queryClient: QueryClient }).queryClient
}

// ─── Query Key Factories ─────────────────────────────────────────────
export const queryKeys = {
  hero: ["hero"] as const,
  footer: ["footer"] as const,
  stats: ["stats"] as const,
  experience: ["experience"] as const,
  projects: ["projects"] as const,
  projectBySlug: (slug: string) => ["project", slug] as const,
  testimonials: ["testimonials"] as const,
  certifications: ["certifications"] as const,
  publications: (includeUnpublished?: boolean) =>
    ["publications", { includeUnpublished }] as const,
  contactMessages: ["contactMessages"] as const,
  media: (folder?: string) => ["media", { folder }] as const,
  mediaItem: (id: number) => ["media", id] as const,
  r2Status: ["r2Status"] as const,
  landingSections: ["landingSections"] as const,
  siteSettings: ["siteSettings"] as const,
} as const

// ─── Query Options ───────────────────────────────────────────────────

export const heroQuery = queryOptions({
  queryKey: queryKeys.hero,
  queryFn: () => getHero(),
})

export const footerQuery = queryOptions({
  queryKey: queryKeys.footer,
  queryFn: () => getFooter(),
})

export const statsQuery = queryOptions({
  queryKey: queryKeys.stats,
  queryFn: () => getStats(),
})

export const experienceQuery = queryOptions({
  queryKey: queryKeys.experience,
  queryFn: () => getExperience(),
})

export const projectsQuery = queryOptions({
  queryKey: queryKeys.projects,
  queryFn: () => getProjects(),
})

export const testimonialsQuery = queryOptions({
  queryKey: queryKeys.testimonials,
  queryFn: () => getTestimonials(),
})

export const certificationsQuery = queryOptions({
  queryKey: queryKeys.certifications,
  queryFn: () => getCertifications(),
})

export const publicationsQuery = (includeUnpublished?: boolean) =>
  queryOptions({
    queryKey: queryKeys.publications(includeUnpublished),
    queryFn: () => getPublications({ data: { includeUnpublished } }),
  })

export const contactMessagesQuery = queryOptions({
  queryKey: queryKeys.contactMessages,
  queryFn: () => getContactMessages(),
})

export const mediaQuery = (folder?: string) =>
  queryOptions({
    queryKey: queryKeys.media(folder),
    queryFn: () => getMedia({ data: folder ? { folder } : undefined }),
  })

export const mediaItemQuery = (id: number) =>
  queryOptions({
    queryKey: queryKeys.mediaItem(id),
    queryFn: () => getMediaItem({ data: id }),
  })

export const r2StatusQuery = queryOptions({
  queryKey: queryKeys.r2Status,
  queryFn: () => getR2Status(),
})

export const landingSectionsQuery = queryOptions({
  queryKey: queryKeys.landingSections,
  queryFn: () => getLandingSections(),
})

export const siteSettingsQuery = queryOptions({
  queryKey: queryKeys.siteSettings,
  queryFn: () => getSiteSettings(),
})

export const projectBySlugQuery = (slug: string) =>
  queryOptions({
    queryKey: queryKeys.projectBySlug(slug),
    queryFn: () => getProjectBySlug({ data: slug }),
  })

// ─── Mutation Hooks ──────────────────────────────────────────────────

export function useUpdateHero() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateHero>[0]["data"]) =>
      updateHero({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.hero })
    },
  })
}

export function useUpdateFooter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateFooter>[0]["data"]) =>
      updateFooter({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.footer })
    },
  })
}

export function useUpdateStat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateStat>[0]["data"]) =>
      updateStat({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stats })
    },
  })
}

export function useDeleteStat() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteStat({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.stats })
    },
  })
}

export function useUpdateExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateExperience>[0]["data"]) =>
      updateExperience({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.experience })
    },
  })
}

export function useDeleteExperience() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteExperience({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.experience })
    },
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateProject>[0]["data"]) =>
      updateProject({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.projects })
    },
  })
}

export function useSubmitContact() {
  return useMutation({
    mutationFn: (data: Parameters<typeof submitContact>[0]["data"]) =>
      submitContact({ data }),
  })
}

export function useUpdateTestimonial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateTestimonial>[0]["data"]) =>
      updateTestimonial({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.testimonials })
    },
  })
}

export function useDeleteTestimonial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTestimonial({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.testimonials })
    },
  })
}

export function useUpdateCertification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateCertification>[0]["data"]) =>
      updateCertification({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.certifications })
    },
  })
}

export function useDeleteCertification() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCertification({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.certifications })
    },
  })
}

export function useUpdatePublication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updatePublication>[0]["data"]) =>
      updatePublication({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.publications(true) })
      qc.invalidateQueries({ queryKey: queryKeys.publications(false) })
    },
  })
}

export function useDeletePublication() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deletePublication({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.publications(true) })
      qc.invalidateQueries({ queryKey: queryKeys.publications(false) })
    },
  })
}

export function useUpdateMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateMedia>[0]["data"]) =>
      updateMedia({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.media() })
    },
  })
}

export function useDeleteMedia() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteMedia({ data: id }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.media() })
    },
  })
}

export function useGetPresignedUpload() {
  return useMutation({
    mutationFn: (data: Parameters<typeof getPresignedUpload>[0]["data"]) =>
      getPresignedUpload({ data }),
  })
}

export function useFinalizeMediaUpload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof finalizeMediaUploadFn>[0]["data"]) =>
      finalizeMediaUploadFn({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.media() })
    },
  })
}

export function useUpdateLandingSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateLandingSection>[0]["data"]) =>
      updateLandingSection({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.landingSections })
    },
  })
}

export function useReorderLandingSections() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      reorderLandingSections({ data: { orderedIds } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.landingSections })
    },
  })
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updateSiteSettings>[0]["data"]) =>
      updateSiteSettings({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.siteSettings })
    },
  })
}
