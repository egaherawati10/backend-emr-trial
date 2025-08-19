/*
  Warnings:

  - You are about to drop the column `clerkId` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `visitDate` on the `MedicalRecord` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturer` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Medicine` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `clerkId` on the `PatientProfile` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `method` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Prescription` table. All the data in the column will be lost.
  - You are about to drop the column `dosage` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `instructions` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `PrescriptionItem` table. All the data in the column will be lost.
  - You are about to drop the column `planning` on the `Record` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `serviceItemId` on the `Service` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Service` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `createdAt` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PaymentItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `ServiceItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `typeId` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PatientProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `medicalRecordId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `unitPrice` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_clerkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientProfile" DROP CONSTRAINT "PatientProfile_clerkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Record" DROP CONSTRAINT "Record_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Service" DROP CONSTRAINT "Service_serviceItemId_fkey";

-- DropIndex
DROP INDEX "public"."MedicalRecord_clerkId_idx";

-- DropIndex
DROP INDEX "public"."PatientProfile_clerkId_idx";

-- DropIndex
DROP INDEX "public"."PatientProfile_userId_idx";

-- DropIndex
DROP INDEX "public"."Payment_doctorId_idx";

-- DropIndex
DROP INDEX "public"."Payment_patientId_idx";

-- DropIndex
DROP INDEX "public"."Service_doctorId_idx";

-- DropIndex
DROP INDEX "public"."Service_patientId_idx";

-- DropIndex
DROP INDEX "public"."Service_serviceItemId_idx";

-- DropIndex
DROP INDEX "public"."User_username_key";

-- AlterTable
ALTER TABLE "public"."MedicalRecord" DROP COLUMN "clerkId",
DROP COLUMN "notes",
DROP COLUMN "visitDate",
ALTER COLUMN "diagnosis" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Medicine" DROP COLUMN "dosage",
DROP COLUMN "manufacturer",
DROP COLUMN "type",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "typeId" INTEGER NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."PatientProfile" DROP COLUMN "clerkId",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "doctorId",
DROP COLUMN "method",
DROP COLUMN "patientId",
DROP COLUMN "paymentDate",
DROP COLUMN "totalAmount",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "cashierId" DROP NOT NULL,
ALTER COLUMN "medicalRecordId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Prescription" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "public"."PrescriptionItem" DROP COLUMN "dosage",
DROP COLUMN "instructions",
DROP COLUMN "price",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Record" DROP COLUMN "planning",
ADD COLUMN     "plan" TEXT,
ALTER COLUMN "doctorId" DROP NOT NULL,
ALTER COLUMN "subjective" DROP NOT NULL,
ALTER COLUMN "objective" DROP NOT NULL,
ALTER COLUMN "assessment" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "doctorId",
DROP COLUMN "patientId",
DROP COLUMN "serviceItemId",
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."ServiceItem" DROP COLUMN "createdAt",
DROP COLUMN "price",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "name",
DROP COLUMN "username";

-- DropTable
DROP TABLE "public"."PaymentItem";

-- DropEnum
DROP TYPE "public"."PaymentMethod";

-- CreateTable
CREATE TABLE "public"."MedicineType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MedicineType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentPrescriptionItem" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "prescriptionId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentPrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PaymentServiceItem" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServiceItemChoice" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "serviceItemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceItemChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicineType_name_key" ON "public"."MedicineType"("name");

-- CreateIndex
CREATE INDEX "PaymentPrescriptionItem_paymentId_idx" ON "public"."PaymentPrescriptionItem"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentPrescriptionItem_prescriptionId_idx" ON "public"."PaymentPrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PaymentServiceItem_paymentId_idx" ON "public"."PaymentServiceItem"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentServiceItem_serviceId_idx" ON "public"."PaymentServiceItem"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceItemChoice_serviceId_idx" ON "public"."ServiceItemChoice"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceItemChoice_serviceItemId_idx" ON "public"."ServiceItemChoice"("serviceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceItemChoice_serviceId_serviceItemId_key" ON "public"."ServiceItemChoice"("serviceId", "serviceItemId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceItem_name_key" ON "public"."ServiceItem"("name");

-- AddForeignKey
ALTER TABLE "public"."Medicine" ADD CONSTRAINT "Medicine_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."MedicineType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentPrescriptionItem" ADD CONSTRAINT "PaymentPrescriptionItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentPrescriptionItem" ADD CONSTRAINT "PaymentPrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."Prescription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentServiceItem" ADD CONSTRAINT "PaymentServiceItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "public"."Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentServiceItem" ADD CONSTRAINT "PaymentServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceItemChoice" ADD CONSTRAINT "ServiceItemChoice_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceItemChoice" ADD CONSTRAINT "ServiceItemChoice_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "public"."ServiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
