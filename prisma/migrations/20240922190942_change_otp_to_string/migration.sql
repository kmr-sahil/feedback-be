/*
  Warnings:

  - Made the column `otp` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "otp" SET NOT NULL,
ALTER COLUMN "otp" SET DATA TYPE TEXT;
