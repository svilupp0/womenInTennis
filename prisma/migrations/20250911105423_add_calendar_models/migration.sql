-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('AVAILABLE', 'PROPOSED', 'CONFIRMED', 'DENIED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'AVAILABLE',
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MatchProposal" (
    "id" SERIAL NOT NULL,
    "proposerId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "message" TEXT,
    "status" "public"."ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchProposal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "public"."Event"("userId");

-- CreateIndex
CREATE INDEX "Event_start_idx" ON "public"."Event"("start");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "public"."Event"("status");

-- CreateIndex
CREATE INDEX "MatchProposal_targetId_idx" ON "public"."MatchProposal"("targetId");

-- CreateIndex
CREATE INDEX "MatchProposal_proposerId_idx" ON "public"."MatchProposal"("proposerId");

-- CreateIndex
CREATE INDEX "MatchProposal_status_idx" ON "public"."MatchProposal"("status");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchProposal" ADD CONSTRAINT "MatchProposal_proposerId_fkey" FOREIGN KEY ("proposerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchProposal" ADD CONSTRAINT "MatchProposal_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MatchProposal" ADD CONSTRAINT "MatchProposal_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
