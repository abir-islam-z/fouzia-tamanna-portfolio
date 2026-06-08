-- AlterTable: Update Hero — remove video fields, add logo + subtitle
ALTER TABLE "Hero"
  DROP COLUMN "videoDuration",
  DROP COLUMN "videoUrl",
  ADD COLUMN "subtitle" TEXT NOT NULL DEFAULT 'MSc Computer Networks & Systems Security',
  ADD COLUMN "logoUrl" TEXT,
  ADD COLUMN "logoKey" TEXT,
  ALTER COLUMN "introBadge" SET DEFAULT 'OPEN TO WORK — SOC ANALYST',
  ALTER COLUMN "title" SET DEFAULT 'Fouzia Tamanna',
  ALTER COLUMN "description" SET DEFAULT 'Network Security & SOC Analyst specializing in threat detection, incident response, and systems security.';

-- AlterTable: Update Footer defaults to cybersecurity focus
ALTER TABLE "Footer"
  ALTER COLUMN "bio" SET DEFAULT 'Network Security & SOC Analyst focused on threat detection, incident response, and systems security. Based in London, UK.',
  ALTER COLUMN "email" SET DEFAULT 'hello@example.com',
  ALTER COLUMN "availability" SET DEFAULT 'Open for SOC Analyst & Network Security Roles';

-- CreateTable: Publication
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "link" TEXT,
    "tags" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'journal',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);
