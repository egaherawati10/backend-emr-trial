/*
  Warnings:

  - You are about to drop the column `description` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `typeId` on the `Medicine` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `name` on the `PatientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the `MedicineType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentPrescriptionItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PaymentServiceItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceItemChoice` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `visitDate` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `diagnosis` on table `MedicalRecord` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `dosage` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `manufacturer` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Made the column `address` on table `PatientProfile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `PatientProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `method` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentDate` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `cashierId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `price` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dosage` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planning` to the `Record` table without a default value. This is not possible if the table is not empty.
  - Made the column `doctorId` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subjective` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Made the column `objective` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Made the column `assessment` on table `Record` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `doctorId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `ServiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ServiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('cash', 'card', 'insurance', 'transfer');

-- DropForeignKey
ALTER TABLE "public"."Medicine" DROP CONSTRAINT "Medicine_typeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentPrescriptionItem" DROP CONSTRAINT "PaymentPrescriptionItem_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentPrescriptionItem" DROP CONSTRAINT "PaymentPrescriptionItem_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentServiceItem" DROP CONSTRAINT "PaymentServiceItem_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentServiceItem" DROP CONSTRAINT "PaymentServiceItem_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Record" DROP CONSTRAINT "Record_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceItemChoice" DROP CONSTRAINT "ServiceItemChoice_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceItemChoice" DROP CONSTRAINT "ServiceItemChoice_serviceItemId_fkey";

-- DropIndex
DROP INDEX "public"."ServiceItem_name_key";

-- AlterTable
ALTER TABLE "public"."MedicalRecord" ADD COLUMN     "clerkId" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "visitDate" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "diagnosis" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Medicine" DROP COLUMN "description",
DROP COLUMN "typeId",
ADD COLUMN     "dosage" TEXT NOT NULL,
ADD COLUMN     "manufacturer" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "public"."PatientProfile" DROP COLUMN "name",
ADD COLUMN     "clerkId" INTEGER,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "amount",
ADD COLUMN     "doctorId" INTEGER,
ADD COLUMN     "method" "public"."PaymentMethod" NOT NULL,
ADD COLUMN     "patientId" INTEGER NOT NULL,
ADD COLUMN     "paymentDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL,
ALTER COLUMN "cashierId" SET NOT NULL,
ALTER COLUMN "medicalRecordId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Prescription" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PrescriptionItem" DROP COLUMN "createdAt",
DROP COLUMN "unitPrice",
DROP COLUMN "updatedAt",
ADD COLUMN     "dosage" TEXT NOT NULL,
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Record" DROP COLUMN "plan",
ADD COLUMN     "planning" TEXT NOT NULL,
ALTER COLUMN "doctorId" SET NOT NULL,
ALTER COLUMN "subjective" SET NOT NULL,
ALTER COLUMN "objective" SET NOT NULL,
ALTER COLUMN "assessment" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "name",
DROP COLUMN "price",
ADD COLUMN     "doctorId" INTEGER NOT NULL,
ADD COLUMN     "patientId" INTEGER NOT NULL,
ADD COLUMN     "totalPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."ServiceItem" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."MedicineType";

-- DropTable
DROP TABLE "public"."PaymentPrescriptionItem";

-- DropTable
DROP TABLE "public"."PaymentServiceItem";

-- DropTable
DROP TABLE "public"."ServiceItemChoice";

-- CreateTable
CREATE TABLE "public"."PaymentItem" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "prescriptionId" INTEGER,
    "serviceId" INTEGER,

    CONSTRAINT "PaymentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_Service_ServiceItems" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_Service_ServiceItems_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "PaymentItem_paymentId_idx" ON "public"."PaymentItem"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentItem_prescriptionId_idx" ON "public"."PaymentItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PaymentItem_serviceId_idx" ON "public"."PaymentItem"("serviceId");

-- CreateIndex
CREATE INDEX "_Service_ServiceItems_B_index" ON "public"."_Service_ServiceItems"("B");

-- CreateIndex
CREATE INDEX "MedicalRecord_clerkId_idx" ON "public"."MedicalRecord"("clerkId");

-- CreateIndex
CREATE INDEX "PatientProfile_clerkId_idx" ON "public"."PatientProfile"("clerkId");

-- CreateIndex
CREATE INDEX "PatientProfile_userId_idx" ON "public"."PatientProfile"("userId");

-- CreateIndex
CREATE INDEX "Payment_patientId_idx" ON "public"."Payment"("patientId");

-- CreateIndex
CREATE INDEX "Payment_doctorId_idx" ON "public"."Payment"("doctorId");

-- CreateIndex
CREATE INDEX "Service_patientId_idx" ON "public"."Service"("patientId");

-- CreateIndex
CREATE INDEX "Service_doctorId_idx" ON "public"."Service"("doctorId");

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_Service_ServiceItems" ADD CONSTRAINT "_Service_ServiceItems_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_Service_ServiceItems" ADD CONSTRAINT "_Service_ServiceItems_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."ServiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
