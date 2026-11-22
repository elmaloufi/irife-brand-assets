CREATE TYPE "IdentityActionType" AS ENUM ('PASSWORD_RESET');

CREATE TABLE "IdentityActionToken" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "tokenHash" CHAR(64) NOT NULL,
  "type" "IdentityActionType" NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "consumedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IdentityActionToken_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IdentityActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "IdentityActionToken_tokenHash_key" ON "IdentityActionToken"("tokenHash");
CREATE INDEX "IdentityActionToken_userId_type_consumedAt_idx" ON "IdentityActionToken"("userId", "type", "consumedAt");
CREATE INDEX "IdentityActionToken_expiresAt_idx" ON "IdentityActionToken"("expiresAt");
