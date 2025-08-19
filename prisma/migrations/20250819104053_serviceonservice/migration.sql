/*
  Warnings:

  - You are about to alter the column `price` on the `Medicine` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `cashierId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paymentDate` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to alter the column `totalAmount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `prescriptionId` on the `PaymentItem` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `PaymentItem` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `PaymentItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `price` on the `Prescription` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `PrescriptionItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `totalPrice` on the `Service` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `ServiceItem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the `_Service_ServiceItems` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `doctorId` on table `MedicalRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clerkId` on table `MedicalRecord` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clerkId` on table `PatientProfile` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `date` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Made the column `medicalRecordId` on table `Payment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pharmacistId` on table `Prescription` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `medicalRecordId` to the `Record` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_clerkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MedicalRecord" DROP CONSTRAINT "MedicalRecord_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PatientProfile" DROP CONSTRAINT "PatientProfile_clerkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_cashierId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_prescriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Prescription" DROP CONSTRAINT "Prescription_pharmacistId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_Service_ServiceItems" DROP CONSTRAINT "_Service_ServiceItems_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_Service_ServiceItems" DROP CONSTRAINT "_Service_ServiceItems_B_fkey";

-- DropIndex
DROP INDEX "public"."MedicalRecord_clerkId_idx";

-- DropIndex
DROP INDEX "public"."MedicalRecord_doctorId_idx";

-- DropIndex
DROP INDEX "public"."MedicalRecord_patientId_idx";

-- DropIndex
DROP INDEX "public"."PatientProfile_clerkId_idx";

-- DropIndex
DROP INDEX "public"."PatientProfile_userId_idx";

-- DropIndex
DROP INDEX "public"."Payment_cashierId_idx";

-- DropIndex
DROP INDEX "public"."Payment_doctorId_idx";

-- DropIndex
DROP INDEX "public"."Payment_medicalRecordId_idx";

-- DropIndex
DROP INDEX "public"."Payment_patientId_idx";

-- DropIndex
DROP INDEX "public"."PaymentItem_paymentId_idx";

-- DropIndex
DROP INDEX "public"."PaymentItem_prescriptionId_idx";

-- DropIndex
DROP INDEX "public"."PaymentItem_serviceId_idx";

-- DropIndex
DROP INDEX "public"."Prescription_doctorId_idx";

-- DropIndex
DROP INDEX "public"."Prescription_medicalRecordId_idx";

-- DropIndex
DROP INDEX "public"."Prescription_patientId_idx";

-- DropIndex
DROP INDEX "public"."Prescription_pharmacistId_idx";

-- DropIndex
DROP INDEX "public"."PrescriptionItem_medicineId_idx";

-- DropIndex
DROP INDEX "public"."PrescriptionItem_prescriptionId_idx";

-- DropIndex
DROP INDEX "public"."Record_doctorId_idx";

-- DropIndex
DROP INDEX "public"."Record_patientId_idx";

-- DropIndex
DROP INDEX "public"."Service_doctorId_idx";

-- DropIndex
DROP INDEX "public"."Service_medicalRecordId_idx";

-- DropIndex
DROP INDEX "public"."Service_patientId_idx";

-- AlterTable
ALTER TABLE "public"."MedicalRecord" ALTER COLUMN "doctorId" SET NOT NULL,
ALTER COLUMN "clerkId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Medicine" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."PatientProfile" ALTER COLUMN "clerkId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "cashierId",
DROP COLUMN "createdAt",
DROP COLUMN "doctorId",
DROP COLUMN "paymentDate",
DROP COLUMN "updatedAt",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "medicalRecordId" SET NOT NULL,
ALTER COLUMN "totalAmount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."PaymentItem" DROP COLUMN "prescriptionId",
DROP COLUMN "serviceId",
ADD COLUMN     "prescriptionItemId" INTEGER,
ADD COLUMN     "serviceOnServiceItemId" INTEGER,
ALTER COLUMN "amount" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Prescription" DROP COLUMN "price",
ALTER COLUMN "pharmacistId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PrescriptionItem" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "medicalRecordId" INTEGER NOT NULL,
ALTER COLUMN "subjective" DROP NOT NULL,
ALTER COLUMN "objective" DROP NOT NULL,
ALTER COLUMN "assessment" DROP NOT NULL,
ALTER COLUMN "planning" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "totalPrice";

-- AlterTable
ALTER TABLE "public"."ServiceItem" ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "public"."_Service_ServiceItems";

-- CreateTable
CREATE TABLE "public"."ServiceOnServiceItem" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "serviceItemId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ServiceOnServiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceOnServiceItem_serviceId_serviceItemId_key" ON "public"."ServiceOnServiceItem"("serviceId", "serviceItemId");

-- AddForeignKey
ALTER TABLE "public"."PatientProfile" ADD CONSTRAINT "PatientProfile_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MedicalRecord" ADD CONSTRAINT "MedicalRecord_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Record" ADD CONSTRAINT "Record_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceOnServiceItem" ADD CONSTRAINT "ServiceOnServiceItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceOnServiceItem" ADD CONSTRAINT "ServiceOnServiceItem_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "public"."ServiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_prescriptionItemId_fkey" FOREIGN KEY ("prescriptionItemId") REFERENCES "public"."PrescriptionItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_serviceOnServiceItemId_fkey" FOREIGN KEY ("serviceOnServiceItemId") REFERENCES "public"."ServiceOnServiceItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
