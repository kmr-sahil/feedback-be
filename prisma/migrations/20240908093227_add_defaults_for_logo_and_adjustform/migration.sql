-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "adjustForm" JSONB NOT NULL DEFAULT '{"isEmailReq":true, "isNameInputReq":false, "isNameReq":false}',
ADD COLUMN     "logoUrl" TEXT DEFAULT '';
