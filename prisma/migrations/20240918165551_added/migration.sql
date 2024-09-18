/*
  Warnings:

  - A unique constraint covering the columns `[responseId]` on the table `Response` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Response_responseId_key" ON "Response"("responseId");
