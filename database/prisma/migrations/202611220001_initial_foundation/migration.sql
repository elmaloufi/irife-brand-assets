CREATE TYPE "UserRole" AS ENUM ('TRAVELER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE "ProviderRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF');
CREATE TYPE "MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'REVOKED');
CREATE TYPE "CredentialType" AS ENUM ('ACCESS', 'REFRESH');
CREATE TYPE "ExperienceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "EnquiryStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'COMPLETED');

CREATE TABLE "User" (
  "id" UUID NOT NULL, "email" VARCHAR(320) NOT NULL, "passwordHash" VARCHAR(255) NOT NULL,
  "displayName" VARCHAR(120) NOT NULL, "role" "UserRole" NOT NULL DEFAULT 'TRAVELER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Session" (
  "id" UUID NOT NULL, "userId" UUID NOT NULL, "familyId" UUID NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "lastUsedAt" TIMESTAMPTZ(3),
  "revokedAt" TIMESTAMPTZ(3), CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SessionCredential" (
  "id" UUID NOT NULL, "sessionId" UUID NOT NULL, "tokenHash" CHAR(64) NOT NULL,
  "type" "CredentialType" NOT NULL, "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "consumedAt" TIMESTAMPTZ(3), "revokedAt" TIMESTAMPTZ(3),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SessionCredential_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Provider" (
  "id" UUID NOT NULL, "name" VARCHAR(160) NOT NULL, "slug" VARCHAR(120) NOT NULL,
  "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProviderMembership" (
  "id" UUID NOT NULL, "providerId" UUID NOT NULL, "userId" UUID NOT NULL,
  "role" "ProviderRole" NOT NULL, "status" "MembershipStatus" NOT NULL DEFAULT 'INVITED',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "ProviderMembership_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Destination" (
  "id" UUID NOT NULL, "slug" VARCHAR(120) NOT NULL, "name" VARCHAR(160) NOT NULL,
  "countryCode" CHAR(2) NOT NULL DEFAULT 'MA', "region" VARCHAR(120), "summary" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Destination_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Experience" (
  "id" UUID NOT NULL, "providerId" UUID NOT NULL, "destinationId" UUID NOT NULL,
  "slug" VARCHAR(120) NOT NULL, "title" VARCHAR(180) NOT NULL, "summary" VARCHAR(500),
  "description" TEXT NOT NULL, "currency" CHAR(3) NOT NULL DEFAULT 'MAD',
  "priceFrom" DECIMAL(10,2), "durationMinutes" INTEGER, "maxGroupSize" INTEGER,
  "status" "ExperienceStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ExperienceMedia" (
  "id" UUID NOT NULL, "experienceId" UUID NOT NULL, "url" VARCHAR(2048) NOT NULL,
  "altText" VARCHAR(300), "position" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ExperienceMedia_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Enquiry" (
  "id" UUID NOT NULL, "travelerId" UUID NOT NULL, "providerId" UUID NOT NULL, "experienceId" UUID NOT NULL,
  "requestedStartAt" TIMESTAMPTZ(3), "guestCount" INTEGER NOT NULL DEFAULT 1,
  "message" VARCHAR(2000) NOT NULL, "status" "EnquiryStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EnquiryStatusHistory" (
  "id" UUID NOT NULL, "enquiryId" UUID NOT NULL, "actorUserId" UUID,
  "fromStatus" "EnquiryStatus", "toStatus" "EnquiryStatus" NOT NULL,
  "note" VARCHAR(500), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EnquiryStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditEvent" (
  "id" UUID NOT NULL, "actorUserId" UUID, "action" VARCHAR(120) NOT NULL,
  "resourceType" VARCHAR(120) NOT NULL, "resourceId" VARCHAR(120), "requestId" VARCHAR(120),
  "metadata" JSONB, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_status_createdAt_idx" ON "User"("status", "createdAt");
CREATE INDEX "Session_userId_revokedAt_idx" ON "Session"("userId", "revokedAt");
CREATE INDEX "Session_familyId_idx" ON "Session"("familyId");
CREATE UNIQUE INDEX "SessionCredential_tokenHash_key" ON "SessionCredential"("tokenHash");
CREATE INDEX "SessionCredential_sessionId_type_expiresAt_idx" ON "SessionCredential"("sessionId", "type", "expiresAt");
CREATE INDEX "SessionCredential_expiresAt_idx" ON "SessionCredential"("expiresAt");
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");
CREATE INDEX "Provider_status_createdAt_idx" ON "Provider"("status", "createdAt");
CREATE UNIQUE INDEX "ProviderMembership_providerId_userId_key" ON "ProviderMembership"("providerId", "userId");
CREATE INDEX "ProviderMembership_userId_status_idx" ON "ProviderMembership"("userId", "status");
CREATE INDEX "ProviderMembership_providerId_status_idx" ON "ProviderMembership"("providerId", "status");
CREATE UNIQUE INDEX "Destination_slug_key" ON "Destination"("slug");
CREATE INDEX "Destination_countryCode_isPublished_name_idx" ON "Destination"("countryCode", "isPublished", "name");
CREATE UNIQUE INDEX "Experience_providerId_slug_key" ON "Experience"("providerId", "slug");
CREATE INDEX "Experience_destinationId_status_createdAt_idx" ON "Experience"("destinationId", "status", "createdAt");
CREATE INDEX "Experience_providerId_status_createdAt_idx" ON "Experience"("providerId", "status", "createdAt");
CREATE INDEX "ExperienceMedia_experienceId_position_idx" ON "ExperienceMedia"("experienceId", "position");
CREATE INDEX "Enquiry_travelerId_createdAt_idx" ON "Enquiry"("travelerId", "createdAt");
CREATE INDEX "Enquiry_providerId_status_createdAt_idx" ON "Enquiry"("providerId", "status", "createdAt");
CREATE INDEX "Enquiry_experienceId_status_idx" ON "Enquiry"("experienceId", "status");
CREATE INDEX "EnquiryStatusHistory_enquiryId_createdAt_idx" ON "EnquiryStatusHistory"("enquiryId", "createdAt");
CREATE INDEX "EnquiryStatusHistory_actorUserId_createdAt_idx" ON "EnquiryStatusHistory"("actorUserId", "createdAt");
CREATE INDEX "AuditEvent_actorUserId_createdAt_idx" ON "AuditEvent"("actorUserId", "createdAt");
CREATE INDEX "AuditEvent_resourceType_resourceId_createdAt_idx" ON "AuditEvent"("resourceType", "resourceId", "createdAt");
CREATE INDEX "AuditEvent_requestId_idx" ON "AuditEvent"("requestId");

ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SessionCredential" ADD CONSTRAINT "SessionCredential_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderMembership" ADD CONSTRAINT "ProviderMembership_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProviderMembership" ADD CONSTRAINT "ProviderMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Experience" ADD CONSTRAINT "Experience_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExperienceMedia" ADD CONSTRAINT "ExperienceMedia_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_travelerId_fkey" FOREIGN KEY ("travelerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Enquiry" ADD CONSTRAINT "Enquiry_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EnquiryStatusHistory" ADD CONSTRAINT "EnquiryStatusHistory_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EnquiryStatusHistory" ADD CONSTRAINT "EnquiryStatusHistory_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
