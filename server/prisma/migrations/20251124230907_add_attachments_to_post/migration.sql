/*
  Warnings:

  - Made the column `imageUrl` on table `Post` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "attachments" TEXT,
ALTER COLUMN "imageUrl" SET NOT NULL;
