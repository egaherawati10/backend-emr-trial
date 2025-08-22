/*
  Warnings:

  - You are about to drop the column `discount` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `tax` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Payment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[prescriptionId,medicineId]` on the table `PrescriptionItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "discount",
DROP COLUMN "tax",
DROP COLUMN "totalAmount";

-- CreateIndex
CREATE UNIQUE INDEX "PrescriptionItem_prescriptionId_medicineId_key" ON "public"."PrescriptionItem"("prescriptionId", "medicineId");
