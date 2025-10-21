-- CreateEnum
CREATE TYPE "public"."Sport" AS ENUM ('TENNIS', 'PADEL');

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "sport" "public"."Sport" NOT NULL DEFAULT 'TENNIS';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "preferredSport" "public"."Sport";

-- CreateIndex
CREATE INDEX "Event_sport_idx" ON "public"."Event"("sport");
