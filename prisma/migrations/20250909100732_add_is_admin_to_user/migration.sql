-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Imposta francescascarpellini327@gmail.com come admin
UPDATE "public"."User" SET "isAdmin" = true WHERE "email" = 'francescascarpellini327@gmail.com';
