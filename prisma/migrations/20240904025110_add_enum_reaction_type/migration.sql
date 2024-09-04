/*
  Warnings:

  - The `reactionType` column on the `Like` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReactionType" AS ENUM ('LIKE', 'LOVE', 'HAHA', 'SAD', 'ANGRY');

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "reactionType",
ADD COLUMN     "reactionType" "ReactionType" NOT NULL DEFAULT 'LIKE';
