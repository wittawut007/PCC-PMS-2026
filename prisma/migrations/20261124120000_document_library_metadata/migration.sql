ALTER TABLE "evidence_files"
  ADD COLUMN "category" TEXT NOT NULL DEFAULT 'general',
  ADD COLUMN "folder" TEXT NOT NULL DEFAULT 'ไฟล์แนบโครงการ',
  ADD COLUMN "title" TEXT,
  ADD COLUMN "revision" TEXT,
  ADD COLUMN "reference" TEXT,
  ADD COLUMN "description" TEXT,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
