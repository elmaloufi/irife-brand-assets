CREATE TABLE "SavedExperience" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "experienceId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedExperience_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SavedExperience_userId_experienceId_key"
ON "SavedExperience"("userId", "experienceId");

CREATE INDEX "SavedExperience_userId_createdAt_idx"
ON "SavedExperience"("userId", "createdAt");

ALTER TABLE "SavedExperience"
ADD CONSTRAINT "SavedExperience_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SavedExperience"
ADD CONSTRAINT "SavedExperience_experienceId_fkey"
FOREIGN KEY ("experienceId") REFERENCES "Experience"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
