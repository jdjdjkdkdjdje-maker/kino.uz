-- Professional admin settings and notification audit storage.
CREATE TABLE "app_settings" (
  "id" TEXT PRIMARY KEY,
  "data" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "updatedBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "app_settings_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL
);

CREATE TABLE "notification_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" VARCHAR(160) NOT NULL,
  "body" TEXT NOT NULL,
  "topic" VARCHAR(120) NOT NULL DEFAULT 'all',
  "kind" VARCHAR(40) NOT NULL DEFAULT 'GENERAL',
  "status" VARCHAR(30) NOT NULL DEFAULT 'QUEUED',
  "providerMessageId" TEXT,
  "error" TEXT,
  "createdBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notification_logs_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE INDEX "notification_logs_createdAt_idx" ON "notification_logs"("createdAt" DESC);
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

CREATE TABLE "media_assets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" TEXT NOT NULL UNIQUE,
  "contentType" VARCHAR(100) NOT NULL,
  "size" INTEGER NOT NULL,
  "data" BYTEA NOT NULL,
  "createdBy" UUID,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "media_assets_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt" DESC);

INSERT INTO "app_settings" ("id", "data") VALUES (
  'main',
  '{"appName":"KinoTV","logoUrl":"","homeBanners":[],"contactEmail":"","contactPhone":"","about":"KinoTV — kino va qonuniy jonli telekanallar platformasi.","maintenanceMode":false,"notificationsEnabled":true}'::jsonb
) ON CONFLICT ("id") DO NOTHING;
