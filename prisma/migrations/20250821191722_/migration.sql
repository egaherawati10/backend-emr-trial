/*
  Warnings:

  - You are about to alter the column `price` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `date` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `amount` on the `PaymentItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `price` on the `PrescriptionItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to alter the column `price` on the `ServiceItem` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(12,2)`.
  - You are about to drop the column `price` on the `ServiceOnServiceItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,dosage]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Prescription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Service` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `ServiceItem` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `Payment` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `subtotal` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kind` to the `PaymentItem` table without a default value. This is not possible if the table is not empty.
  - The required column `code` was added to the `Prescription` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `code` was added to the `Service` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `unitPrice` to the `ServiceOnServiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PrescriptionStatus" AS ENUM ('draft', 'issued', 'dispensed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."ServiceStatus" AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "public"."PaymentItemKind" AS ENUM ('prescription_item', 'service_item');

-- DropForeignKey
ALTER TABLE "public"."PatientProfile" DROP CONSTRAINT "PatientProfile_clerkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PrescriptionItem" DROP CONSTRAINT "PrescriptionItem_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Record" DROP CONSTRAINT "Record_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceOnServiceItem" DROP CONSTRAINT "ServiceOnServiceItem_serviceId_fkey";

-- AlterTable
ALTER TABLE "public"."MedicalRecord" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Medicine" ADD COLUMN     "batchNo" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "reorderLevel" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT NOT NULL DEFAULT 'unit',
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "manufacturer" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."PatientProfile" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "clerkId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "date",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "subtotal" DECIMAL(12,2) NOT NULL,
ADD COLUMN     "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedById" INTEGER,
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."PaymentItem" ADD COLUMN     "kind" "public"."PaymentItemKind" NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Prescription" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "dateDispensed" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."PrescriptionStatus" NOT NULL DEFAULT 'issued',
ADD COLUMN     "updatedById" INTEGER,
ALTER COLUMN "dateIssued" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."PrescriptionItem" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."Service" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "serviceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" "public"."ServiceStatus" NOT NULL DEFAULT 'planned',
ADD COLUMN     "updatedById" INTEGER;

-- AlterTable
ALTER TABLE "public"."ServiceItem" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."ServiceOnServiceItem" DROP COLUMN "price",
ADD COLUMN     "unitPrice" DECIMAL(12,2) NOT NULL;

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_visitDate_idx" ON "public"."MedicalRecord"("patientId", "visitDate");

-- CreateIndex
CREATE INDEX "MedicalRecord_doctorId_visitDate_idx" ON "public"."MedicalRecord"("doctorId", "visitDate");

-- CreateIndex
CREATE INDEX "Medicine_type_idx" ON "public"."Medicine"("type");

-- CreateIndex
CREATE INDEX "Medicine_expiryDate_idx" ON "public"."Medicine"("expiryDate");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_name_dosage_key" ON "public"."Medicine"("name", "dosage");

-- CreateIndex
CREATE INDEX "PatientProfile_gender_idx" ON "public"."PatientProfile"("gender");

-- CreateIndex
CREATE INDEX "PatientProfile_phone_idx" ON "public"."PatientProfile"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_code_key" ON "public"."Payment"("code");

-- CreateIndex
CREATE INDEX "Payment_patientId_issuedAt_idx" ON "public"."Payment"("patientId", "issuedAt");

-- CreateIndex
CREATE INDEX "Payment_status_method_idx" ON "public"."Payment"("status", "method");

-- CreateIndex
CREATE INDEX "PaymentItem_paymentId_idx" ON "public"."PaymentItem"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentItem_prescriptionItemId_idx" ON "public"."PaymentItem"("prescriptionItemId");

-- CreateIndex
CREATE INDEX "PaymentItem_serviceOnServiceItemId_idx" ON "public"."PaymentItem"("serviceOnServiceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_code_key" ON "public"."Prescription"("code");

-- CreateIndex
CREATE INDEX "Prescription_patientId_dateIssued_idx" ON "public"."Prescription"("patientId", "dateIssued");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "public"."Prescription"("status");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "public"."PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_medicineId_idx" ON "public"."PrescriptionItem"("medicineId");

-- CreateIndex
CREATE INDEX "Record_medicalRecordId_idx" ON "public"."Record"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Record_patientId_idx" ON "public"."Record"("patientId");

-- CreateIndex
CREATE INDEX "Record_doctorId_idx" ON "public"."Record"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_code_key" ON "public"."Service"("code");

-- CreateIndex
CREATE INDEX "Service_patientId_serviceDate_idx" ON "public"."Service"("patientId", "serviceDate");

-- CreateIndex
CREATE INDEX "Service_medicalRecordId_idx" ON "public"."Service"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "public"."Service"("status");

-- CreateIndex
CREATE INDEX "ServiceItem_price_idx" ON "public"."ServiceItem"("price");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceItem_name_key" ON "public"."ServiceItem"("name");

-- CreateIndex
CREATE INDEX "ServiceOnServiceItem_serviceId_idx" ON "public"."ServiceOnServiceItem"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceOnServiceItem_serviceItemId_idx" ON "public"."ServiceOnServiceItem"("serviceItemId");

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceOnServiceItem" ADD CONSTRAINT "ServiceOnServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
