-- Real catalog metadata and explicit legal-playback control.
ALTER TABLE "movies" ALTER COLUMN "videoUrl" DROP NOT NULL;
ALTER TABLE "movies" ADD COLUMN "isLicensedVideo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "movies" ADD COLUMN "metadataSource" VARCHAR(40);
ALTER TABLE "movies" ADD COLUMN "externalId" VARCHAR(100);
CREATE INDEX "movies_isLicensedVideo_status_idx" ON "movies"("isLicensedVideo", "status");
CREATE UNIQUE INDEX "movies_metadataSource_externalId_key" ON "movies"("metadataSource", "externalId");
