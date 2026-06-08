/*
  Warnings:

  - You are about to drop the column `coverMediaId` on the `Project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_coverMediaId_fkey";

-- AlterTable
ALTER TABLE "Hero" ADD COLUMN     "cvButtonLabel" TEXT NOT NULL DEFAULT 'Download CV',
ADD COLUMN     "researchButtonLabel" TEXT NOT NULL DEFAULT 'View Research',
ADD COLUMN     "typedLines" TEXT NOT NULL DEFAULT '$ whoami
fouzia_tamanna
$ role --current
SOC Analyst (Tier 2) @ SecureNet Operations
$ focus --primary
Threat Detection · Incident Response · SIEM
$ certs --list
Security+ · CSA · CCNA · BTL1
$ status
[+] All systems nominal. Listening for anomalies...';

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "coverMediaId";
