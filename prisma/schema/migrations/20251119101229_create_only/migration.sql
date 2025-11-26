/*
  Warnings:

  - The values [CANCEL] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [INACTIVE] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `madical_reports` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[scheduleId]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[appointmentId]` on the table `doctor_schedules` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdAt` on table `doctor_specialties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `doctor_specialties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comment` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdAt` on table `specialties` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `specialties` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('SCHEDULED', 'INPROGRESS', 'COMPLETED', 'CANCELED');
ALTER TABLE "public"."appointments" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "appointments" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'SCHEDULED';
COMMIT;

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('ACTIVE', 'BLOCKED', 'DELETED');
ALTER TABLE "public"."users" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "status" TYPE "UserStatus_new" USING ("status"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."madical_reports" DROP CONSTRAINT "madical_reports_patientId_fkey";

-- AlterTable
ALTER TABLE "doctor_schedules" ADD COLUMN     "appointmentId" TEXT;

-- AlterTable
ALTER TABLE "doctor_specialties" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "doctors" ALTER COLUMN "address" DROP NOT NULL;

-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "contactNumber" TEXT;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "rating" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "comment" SET NOT NULL;

-- AlterTable
ALTER TABLE "specialties" ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."madical_reports";

-- CreateTable
CREATE TABLE "medical_reports" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "reportLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_scheduleId_key" ON "appointments"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_schedules_appointmentId_key" ON "doctor_schedules"("appointmentId");

-- CreateIndex
CREATE UNIQUE INDEX "patients_id_key" ON "patients"("id");

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
