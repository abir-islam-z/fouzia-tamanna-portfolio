-- 1. Add new columns to Project
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "summary" TEXT;
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "caseStudy" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "coverMediaId" INTEGER;

-- 2. Backfill slug from title for existing rows (before adding NOT NULL/UNIQUE)
UPDATE "Project" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(COALESCE(title, 'project'), '[^a-zA-Z0-9]+', '-', 'g'), '^-+|-+$', '', 'g')) WHERE "slug" IS NULL OR "slug" = '';
UPDATE "Project" SET "summary" = COALESCE(description, '') WHERE "summary" IS NULL;

-- 3. Now make slug required and unique
ALTER TABLE "Project" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");

-- 4. Drop old image column
ALTER TABLE "Project" DROP COLUMN IF EXISTS "image";

-- 5. Create ProjectGallery table
CREATE TABLE IF NOT EXISTS "ProjectGallery" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ProjectGallery_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ProjectGallery_projectId_idx" ON "ProjectGallery"("projectId");
CREATE UNIQUE INDEX IF NOT EXISTS "ProjectGallery_projectId_mediaId_key" ON "ProjectGallery"("projectId", "mediaId");

-- 6. Add FK constraints
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Project_coverMediaId_fkey') THEN
    ALTER TABLE "Project" ADD CONSTRAINT "Project_coverMediaId_fkey" FOREIGN KEY ("coverMediaId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectGallery_projectId_fkey') THEN
    ALTER TABLE "ProjectGallery" ADD CONSTRAINT "ProjectGallery_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProjectGallery_mediaId_fkey') THEN
    ALTER TABLE "ProjectGallery" ADD CONSTRAINT "ProjectGallery_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 7. Create LandingSection table
CREATE TABLE IF NOT EXISTS "LandingSection" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "badge" TEXT,
    "heading" TEXT,
    "subtext" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LandingSection_pkey" PRIMARY KEY ("id")
);

-- 8. Create SiteSettings table
CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "heroHeadline" TEXT,
    "heroCtaPrimary" TEXT,
    "heroCtaSecondary" TEXT,
    "contactHeading" TEXT,
    "contactSubtext" TEXT,
    "marqueeItems" TEXT,
    "navbarBrand" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- 9. Seed LandingSection default rows
INSERT INTO "LandingSection" ("id", "label", "enabled", "order", "badge", "heading", "subtext", "updatedAt")
VALUES
  ('hero', 'Hero', true, 1, '// SECURE_SESSION.0001', NULL, NULL, NOW()),
  ('stats', 'Stats / Profile', true, 2, '// PROFILE.SYS', NULL, NULL, NOW()),
  ('experience', 'Experience', true, 3, '// TIMELINE.LOG', NULL, NULL, NOW()),
  ('projects', 'Projects', true, 4, '// PROJECTS.MKD', NULL, NULL, NOW()),
  ('testimonials', 'Testimonials', true, 5, '// PEER_REVIEWS.LOG', NULL, NULL, NOW()),
  ('certifications', 'Certifications', true, 6, '// CREDENTIALS.CRT', NULL, NULL, NOW()),
  ('publications', 'Publications', true, 7, '// RESEARCH · PUBLICATIONS', NULL, NULL, NOW()),
  ('contact', 'Contact', true, 8, '// CONTACT.SH', NULL, NULL, NOW())
ON CONFLICT ("id") DO NOTHING;

-- 10. Seed SiteSettings row
INSERT INTO "SiteSettings" ("id", "updatedAt")
VALUES ('singleton', NOW())
ON CONFLICT ("id") DO NOTHING;
