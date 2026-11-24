ALTER TYPE "IdentityActionType" ADD VALUE 'EMAIL_VERIFICATION';

ALTER TABLE "User"
  ADD COLUMN "emailVerifiedAt" TIMESTAMPTZ(3);

CREATE INDEX "IdentityActionToken_userId_type_createdAt_idx"
  ON "IdentityActionToken"("userId", "type", "createdAt");
