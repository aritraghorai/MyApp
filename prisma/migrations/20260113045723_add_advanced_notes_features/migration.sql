-- CreateTable
CREATE TABLE "note_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "note_tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_note_tags" (
    "noteId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("noteId", "tagId"),
    CONSTRAINT "daily_note_tags_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "daily_notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "daily_note_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "note_tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "note_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Custom',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "note_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "habits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#8b5cf6',
    "frequency" TEXT NOT NULL DEFAULT 'DAILY',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "habits_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "habit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "habitId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "habit_logs_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "habit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "todo_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noteId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "position" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "todo_items_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "daily_notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "todo_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_daily_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "mood" INTEGER,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "hasTemplate" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "daily_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_daily_notes" ("content", "createdAt", "date", "id", "updatedAt", "userId") SELECT "content", "createdAt", "date", "id", "updatedAt", "userId" FROM "daily_notes";
DROP TABLE "daily_notes";
ALTER TABLE "new_daily_notes" RENAME TO "daily_notes";
CREATE UNIQUE INDEX "daily_notes_date_key" ON "daily_notes"("date");
CREATE INDEX "daily_notes_userId_idx" ON "daily_notes"("userId");
CREATE INDEX "daily_notes_date_idx" ON "daily_notes"("date");
CREATE UNIQUE INDEX "daily_notes_userId_date_key" ON "daily_notes"("userId", "date");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "note_tags_userId_idx" ON "note_tags"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "note_tags_userId_name_key" ON "note_tags"("userId", "name");

-- CreateIndex
CREATE INDEX "daily_note_tags_noteId_idx" ON "daily_note_tags"("noteId");

-- CreateIndex
CREATE INDEX "daily_note_tags_tagId_idx" ON "daily_note_tags"("tagId");

-- CreateIndex
CREATE INDEX "note_templates_userId_idx" ON "note_templates"("userId");

-- CreateIndex
CREATE INDEX "note_templates_category_idx" ON "note_templates"("category");

-- CreateIndex
CREATE UNIQUE INDEX "note_templates_userId_name_key" ON "note_templates"("userId", "name");

-- CreateIndex
CREATE INDEX "habits_userId_idx" ON "habits"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "habits_userId_name_key" ON "habits"("userId", "name");

-- CreateIndex
CREATE INDEX "habit_logs_habitId_idx" ON "habit_logs"("habitId");

-- CreateIndex
CREATE INDEX "habit_logs_userId_idx" ON "habit_logs"("userId");

-- CreateIndex
CREATE INDEX "habit_logs_date_idx" ON "habit_logs"("date");

-- CreateIndex
CREATE UNIQUE INDEX "habit_logs_habitId_date_key" ON "habit_logs"("habitId", "date");

-- CreateIndex
CREATE INDEX "todo_items_noteId_idx" ON "todo_items"("noteId");

-- CreateIndex
CREATE INDEX "todo_items_userId_idx" ON "todo_items"("userId");

-- CreateIndex
CREATE INDEX "todo_items_completed_idx" ON "todo_items"("completed");
