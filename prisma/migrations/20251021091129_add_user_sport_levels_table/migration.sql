/*
  Warnings:

  - You are about to drop the column `sport` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `livello` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `preferredSports` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Event_sport_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "sport";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "livello",
DROP COLUMN "preferredSports";

-- CreateTable
CREATE TABLE "UserSportLevel" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "sport" "Sport" NOT NULL,
    "livello" TEXT NOT NULL,

    CONSTRAINT "UserSportLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSportLevel_userId_idx" ON "UserSportLevel"("userId");

-- CreateIndex
CREATE INDEX "UserSportLevel_sport_idx" ON "UserSportLevel"("sport");

-- CreateIndex
CREATE UNIQUE INDEX "UserSportLevel_userId_sport_key" ON "UserSportLevel"("userId", "sport");

-- AddForeignKey
ALTER TABLE "UserSportLevel" ADD CONSTRAINT "UserSportLevel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
