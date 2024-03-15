/*
  Warnings:

  - You are about to drop the column `method` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `Permission` table. All the data in the column will be lost.
  - Added the required column `name` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "method",
DROP COLUMN "path",
ADD COLUMN     "name" TEXT NOT NULL;
