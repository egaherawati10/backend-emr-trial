/*
  Warnings:

  - Added the required column `updatedAt` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `gender` on the `PatientProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `method` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ServiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'card', 'insurance', 'transfer');

-- AlterEnum
ALTER TYPE "public"."UserRole" ADD VALUE 'registration_clerk';

-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_doctorId_fkey";

-- AlterTable
ALTER TABLE "public"."MedicalRecord" ADD COLUMN     "clerkId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "doctorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Medicine" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PatientProfile" ADD COLUMN     "clerkId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "public"."Gender" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "method",
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ServiceItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "public"."MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_doctorId_idx" ON "public"."MedicalRecord"("doctorId");

-- CreateIndex
CREATE INDEX "MedicalRecord_clerkId_idx" ON "public"."MedicalRecord"("clerkId");

-- CreateIndex
CREATE INDEX "PatientProfile_clerkId_idx" ON "public"."PatientProfile"("clerkId");

-- CreateIndex
CREATE INDEX "PatientProfile_userId_idx" ON "public"."PatientProfile"("userId");

-- CreateIndex
CREATE INDEX "Payment_patientId_idx" ON "public"."Payment"("patientId");

-- CreateIndex
CREATE INDEX "Payment_cashierId_idx" ON "public"."Payment"("cashierId");

-- CreateIndex
CREATE INDEX "Payment_doctorId_idx" ON "public"."Payment"("doctorId");

-- CreateIndex
CREATE INDEX "Payment_medicalRecordId_idx" ON "public"."Payment"("medicalRecordId");

-- CreateIndex
CREATE INDEX "PaymentItem_paymentId_idx" ON "public"."PaymentItem"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentItem_prescriptionId_idx" ON "public"."PaymentItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PaymentItem_serviceId_idx" ON "public"."PaymentItem"("serviceId");

-- CreateIndex
CREATE INDEX "Prescription_medicalRecordId_idx" ON "public"."Prescription"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "public"."Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_pharmacistId_idx" ON "public"."Prescription"("pharmacistId");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "public"."Prescription"("patientId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "public"."PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_medicineId_idx" ON "public"."PrescriptionItem"("medicineId");

-- CreateIndex
CREATE INDEX "Record_patientId_idx" ON "public"."Record"("patientId");

-- CreateIndex
CREATE INDEX "Record_doctorId_idx" ON "public"."Record"("doctorId");

-- CreateIndex
CREATE INDEX "Service_serviceItemId_idx" ON "public"."Service"("serviceItemId");

-- CreateIndex
CREATE INDEX "Service_patientId_idx" ON "public"."Service"("patientId");

-- CreateIndex
CREATE INDEX "Service_doctorId_idx" ON "public"."Service"("doctorId");

-- CreateIndex
CREATE INDEX "Service_medicalRecordId_idx" ON "public"."Service"("medicalRecordId");

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
