/*
  Warnings:

  - The values [like,love,haha,wow,angry] on the enum `ReactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReactionType_new" AS ENUM ('LIKE', 'LOVE', 'HAHA', 'SAD', 'ANGRY');
ALTER TABLE "Like" ALTER COLUMN "reactionType" DROP DEFAULT;
ALTER TABLE "Like" ALTER COLUMN "reactionType" TYPE "ReactionType_new" USING ("reactionType"::text::"ReactionType_new");
ALTER TYPE "ReactionType" RENAME TO "ReactionType_old";
ALTER TYPE "ReactionType_new" RENAME TO "ReactionType";
DROP TYPE "ReactionType_old";
ALTER TABLE "Like" ALTER COLUMN "reactionType" SET DEFAULT 'LIKE';
COMMIT;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "idEdited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Like" ALTER COLUMN "reactionType" SET DEFAULT 'LIKE';

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "idEdited" BOOLEAN NOT NULL DEFAULT false;
