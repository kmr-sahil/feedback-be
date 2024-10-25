-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "avgRating" INTEGER,
ADD COLUMN     "category" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "totalReviews" INTEGER DEFAULT 0;
