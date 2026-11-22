CREATE TABLE "AuthRateLimitBucket" (
  "keyHash" CHAR(64) NOT NULL,
  "windowStartedAt" TIMESTAMPTZ(3) NOT NULL,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "AuthRateLimitBucket_pkey" PRIMARY KEY ("keyHash")
);

CREATE INDEX "AuthRateLimitBucket_expiresAt_idx"
ON "AuthRateLimitBucket"("expiresAt");
