/*
  Warnings:

  - You are about to drop the column `serviceItemId` on the `PaymentItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `doctorId` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `medicalRecordId` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `patientId` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceItem` table. All the data in the column will be lost.
  - Added the required column `price` to the `Prescription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `PrescriptionItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `doctorId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `medicalRecordId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `patientId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceItemId` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ServiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PaymentItem" DROP CONSTRAINT "PaymentItem_serviceItemId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceItem" DROP CONSTRAINT "ServiceItem_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceItem" DROP CONSTRAINT "ServiceItem_medicalRecordId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceItem" DROP CONSTRAINT "ServiceItem_patientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceItem" DROP CONSTRAINT "ServiceItem_serviceId_fkey";

-- AlterTable
ALTER TABLE "public"."PaymentItem" DROP COLUMN "serviceItemId",
ADD COLUMN     "serviceId" INTEGER;

-- AlterTable
ALTER TABLE "public"."Prescription" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."PrescriptionItem" ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Service" DROP COLUMN "name",
ADD COLUMN     "doctorId" INTEGER NOT NULL,
ADD COLUMN     "medicalRecordId" INTEGER NOT NULL,
ADD COLUMN     "patientId" INTEGER NOT NULL,
ADD COLUMN     "serviceItemId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."ServiceItem" DROP COLUMN "doctorId",
DROP COLUMN "medicalRecordId",
DROP COLUMN "patientId",
DROP COLUMN "serviceId",
ADD COLUMN     "name" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PaymentItem" ADD CONSTRAINT "PaymentItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_serviceItemId_fkey" FOREIGN KEY ("serviceItemId") REFERENCES "public"."ServiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."PatientProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Service" ADD CONSTRAINT "Service_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "public"."MedicalRecord"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
