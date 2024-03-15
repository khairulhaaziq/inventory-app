/*
  Warnings:

  - You are about to drop the column `name` on the `RolePermission` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Role` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `isPermitted` to the `RolePermission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RolePermission" DROP COLUMN "name",
ADD COLUMN     "isPermitted" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
