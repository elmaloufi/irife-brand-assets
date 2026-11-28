ALTER TABLE "SessionCredential"
  ADD COLUMN "rotationRequestId" VARCHAR(128),
  ADD COLUMN "rotationResponseCiphertext" TEXT,
  ADD COLUMN "rotationResponseExpiresAt" TIMESTAMPTZ(3);

ALTER TABLE "SessionCredential"
  ADD CONSTRAINT "SessionCredential_rotation_response_consistency_check"
  CHECK (
    ("rotationRequestId" IS NULL AND "rotationResponseCiphertext" IS NULL AND "rotationResponseExpiresAt" IS NULL)
    OR
    ("type" = 'REFRESH' AND "consumedAt" IS NOT NULL
      AND "rotationRequestId" IS NOT NULL
      AND "rotationResponseCiphertext" IS NOT NULL
      AND "rotationResponseExpiresAt" IS NOT NULL)
  );
