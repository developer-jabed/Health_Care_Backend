-- AlterTable
ALTER TABLE "doctor_specialties" ALTER COLUMN "updatedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "specialties" ALTER COLUMN "updatedAt" DROP NOT NULL;
