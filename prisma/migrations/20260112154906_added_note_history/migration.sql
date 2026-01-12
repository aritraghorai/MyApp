-- CreateTable
CREATE TABLE "note_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noteId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "note_history_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "daily_notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "note_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "note_history_noteId_idx" ON "note_history"("noteId");

-- CreateIndex
CREATE INDEX "note_history_userId_idx" ON "note_history"("userId");
