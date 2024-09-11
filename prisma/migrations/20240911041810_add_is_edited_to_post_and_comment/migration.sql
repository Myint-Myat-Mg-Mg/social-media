/*
  Warnings:

  - You are about to drop the column `idEdited` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `idEdited` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "idEdited",
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "idEdited",
ADD COLUMN     "isEdited" BOOLEAN NOT NULL DEFAULT false;
