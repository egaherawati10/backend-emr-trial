/*
  Warnings:

  - A unique constraint covering the columns `[prescriptionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "prescriptionId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_prescriptionId_key" ON "public"."Payment"("prescriptionId");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "public"."Prescription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
