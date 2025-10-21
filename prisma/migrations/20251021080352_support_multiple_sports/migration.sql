/*
  Warnings:

  - You are about to drop the column `preferredSport` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "preferredSport",
ADD COLUMN     "preferredSports" "public"."Sport"[];
