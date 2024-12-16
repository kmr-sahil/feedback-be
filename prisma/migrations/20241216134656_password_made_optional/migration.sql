/*
  Warnings:

  - You are about to drop the column `email` on the `Response` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Response` table. All the data in the column will be lost.
  - Added the required column `doe` to the `Response` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Response` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Project_userId_idx";

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "adjustForm" SET DEFAULT '{"isEmailReq":true, "isNameReq":false, "allowVerifiedUserOnly":true}';

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "doe" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ip" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Response_userId_idx" ON "Response"("userId");

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
