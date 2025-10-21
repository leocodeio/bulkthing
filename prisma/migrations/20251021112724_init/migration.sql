-- CreateEnum
CREATE TYPE "YtCreatorStatus" AS ENUM ('active', 'inactive', 'suspended', 'deleted');

-- CreateTable
CREATE TABLE "yt_creator" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "status" "YtCreatorStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yt_creator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "yt_creator_creatorId_key" ON "yt_creator"("creatorId");

-- CreateIndex
CREATE UNIQUE INDEX "yt_creator_email_key" ON "yt_creator"("email");

-- CreateIndex
CREATE UNIQUE INDEX "yt_creator_accessToken_key" ON "yt_creator"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "yt_creator_refreshToken_key" ON "yt_creator"("refreshToken");
