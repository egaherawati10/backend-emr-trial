/*
  Warnings:

  - You are about to drop the column `subtotal` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[paymentId,prescriptionItemId]` on the table `PaymentItem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paymentId,serviceOnServiceItemId]` on the table `PaymentItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "subtotal",
ADD COLUMN     "totalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "PatientProfile_clerkId_idx" ON "public"."PatientProfile"("clerkId");

-- CreateIndex
CREATE INDEX "Payment_medicalRecordId_idx" ON "public"."Payment"("medicalRecordId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentItem_paymentId_prescriptionItemId_key" ON "public"."PaymentItem"("paymentId", "prescriptionItemId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentItem_paymentId_serviceOnServiceItemId_key" ON "public"."PaymentItem"("paymentId", "serviceOnServiceItemId");

-- CreateIndex
CREATE INDEX "Prescription_medicalRecordId_idx" ON "public"."Prescription"("medicalRecordId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "public"."Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_pharmacistId_idx" ON "public"."Prescription"("pharmacistId");

-- CreateIndex
CREATE INDEX "Prescription_status_dateDispensed_idx" ON "public"."Prescription"("status", "dateDispensed");

-- CreateIndex
CREATE INDEX "Service_doctorId_status_idx" ON "public"."Service"("doctorId", "status");

-- CreateIndex
CREATE INDEX "User_role_status_idx" ON "public"."User"("role", "status");
