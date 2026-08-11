-- CreateTable
CREATE TABLE "Subscriber" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "maskedEmail" TEXT NOT NULL,
    "preferenceTokenHash" TEXT NOT NULL,
    "tokenExpiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "categories" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConsentEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriberId" TEXT NOT NULL,
    "categories" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL,
    "consentTextHash" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ConsentEvent_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "Subscriber" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_preferenceTokenHash_key" ON "Subscriber"("preferenceTokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "ConsentEvent_requestId_key" ON "ConsentEvent"("requestId");

-- CreateIndex
CREATE INDEX "ConsentEvent_subscriberId_createdAt_idx" ON "ConsentEvent"("subscriberId", "createdAt");
