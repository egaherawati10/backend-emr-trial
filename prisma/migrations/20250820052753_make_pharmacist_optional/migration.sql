-- DropForeignKey
ALTER TABLE "public"."Prescription" DROP CONSTRAINT "Prescription_pharmacistId_fkey";

-- AlterTable
ALTER TABLE "public"."Prescription" ALTER COLUMN "pharmacistId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_pharmacistId_fkey" FOREIGN KEY ("pharmacistId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
