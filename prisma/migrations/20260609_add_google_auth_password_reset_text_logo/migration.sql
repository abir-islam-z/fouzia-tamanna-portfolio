-- AlterTable: User model - Google OAuth and password reset fields
ALTER TABLE "User" ADD COLUMN "email" TEXT,
ADD COLUMN "provider" TEXT NOT NULL DEFAULT 'local',
ADD COLUMN "googleId" TEXT,
ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpiry" TIMESTAMP(3);

-- CreateIndex: Unique constraints for new fields
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AlterTable: SiteSettings - textLogo field
ALTER TABLE "SiteSettings" ADD COLUMN "textLogo" TEXT;
