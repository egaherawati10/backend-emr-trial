-- DropForeignKey
ALTER TABLE "public"."Payment" DROP CONSTRAINT "Payment_doctorId_fkey";

-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "doctorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
