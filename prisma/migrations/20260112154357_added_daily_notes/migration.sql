-- CreateTable
CREATE TABLE "daily_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "daily_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_notes_date_key" ON "daily_notes"("date");

-- CreateIndex
CREATE INDEX "daily_notes_userId_idx" ON "daily_notes"("userId");

-- CreateIndex
CREATE INDEX "daily_notes_date_idx" ON "daily_notes"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_notes_userId_date_key" ON "daily_notes"("userId", "date");
