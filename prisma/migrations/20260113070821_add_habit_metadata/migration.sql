-- AlterTable
ALTER TABLE "habit_logs" ADD COLUMN "metadata" JSONB;
ALTER TABLE "habit_logs" ADD COLUMN "notes" TEXT;

-- AlterTable
ALTER TABLE "habits" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "habits" ADD COLUMN "metadataSchema" JSONB;
