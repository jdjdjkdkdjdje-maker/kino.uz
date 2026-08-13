-- KinoTV initial PostgreSQL schema. Generated for Prisma and optimized for 10k+ movies.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE TYPE "Role" AS ENUM ('USER','ADMIN');
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT','ACTIVE','INACTIVE');
CREATE TYPE "StreamType" AS ENUM ('HLS','DASH','MP4','OTHER');
CREATE TYPE "FavoriteType" AS ENUM ('MOVIE','CHANNEL');
CREATE TYPE "ImportType" AS ENUM ('MOVIES','CHANNELS');
CREATE TYPE "ImportStatus" AS ENUM ('PROCESSING','COMPLETED','PARTIAL','FAILED');

CREATE TABLE "users" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "name" VARCHAR(120) NOT NULL,
 "email" VARCHAR(190), "phone" VARCHAR(30), "passwordHash" TEXT NOT NULL, "avatarUrl" TEXT,
 "role" "Role" NOT NULL DEFAULT 'USER', "isActive" BOOLEAN NOT NULL DEFAULT true,
 "preferredQuality" VARCHAR(20) NOT NULL DEFAULT 'auto', "darkMode" BOOLEAN NOT NULL DEFAULT true,
 "autoplay" BOOLEAN NOT NULL DEFAULT true, "notifications" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email"); CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE INDEX "users_role_isActive_idx" ON "users"("role","isActive"); CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

CREATE TABLE "admins" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"userId" UUID NOT NULL,"permissions" JSONB NOT NULL DEFAULT '[]',"lastLoginAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "admins_userId_key" ON "admins"("userId");
CREATE TABLE "refresh_tokens" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"userId" UUID NOT NULL,"tokenHash" TEXT NOT NULL,"userAgent" TEXT,"ipAddress" VARCHAR(64),"expiresAt" TIMESTAMP(3) NOT NULL,"revokedAt" TIMESTAMP(3),"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "refresh_tokens_tokenHash_key" ON "refresh_tokens"("tokenHash"); CREATE INDEX "refresh_tokens_userId_expiresAt_idx" ON "refresh_tokens"("userId","expiresAt"); CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

CREATE TABLE "categories" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"name" VARCHAR(100) NOT NULL,"slug" VARCHAR(120) NOT NULL,"icon" VARCHAR(20),"description" TEXT,"order" INTEGER NOT NULL DEFAULT 0,"isActive" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name"); CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug"); CREATE INDEX "categories_isActive_order_idx" ON "categories"("isActive","order");
CREATE TABLE "genres" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"name" VARCHAR(80) NOT NULL,"slug" VARCHAR(100) NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name"); CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");
CREATE TABLE "actors" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"name" VARCHAR(160) NOT NULL,"photoUrl" TEXT,"biography" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "actors_name_key" ON "actors"("name"); CREATE INDEX "actors_name_idx" ON "actors"("name");
CREATE TABLE "directors" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"name" VARCHAR(160) NOT NULL,"photoUrl" TEXT,"biography" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "directors_name_key" ON "directors"("name"); CREATE INDEX "directors_name_idx" ON "directors"("name");

CREATE TABLE "movies" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"title" VARCHAR(250) NOT NULL,"originalTitle" VARCHAR(250),"slug" VARCHAR(280) NOT NULL,
 "description" TEXT NOT NULL,"posterUrl" TEXT NOT NULL,"bannerUrl" TEXT NOT NULL,"releaseYear" INTEGER NOT NULL,"durationMinutes" INTEGER NOT NULL,
 "rating" DECIMAL(3,1) NOT NULL DEFAULT 0,"language" VARCHAR(80) NOT NULL,"country" VARCHAR(100) NOT NULL,
 "videoUrl" TEXT NOT NULL,"trailerUrl" TEXT,"subtitleUrl" TEXT,"status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE',
 "isFeatured" BOOLEAN NOT NULL DEFAULT false,"isPopular" BOOLEAN NOT NULL DEFAULT false,"viewCount" BIGINT NOT NULL DEFAULT 0,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "movies_year_check" CHECK ("releaseYear" BETWEEN 1888 AND 2100), CONSTRAINT "movies_rating_check" CHECK ("rating" BETWEEN 0 AND 10), CONSTRAINT "movies_duration_check" CHECK ("durationMinutes">0)
);
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug"); CREATE INDEX "movies_status_createdAt_idx" ON "movies"("status","createdAt" DESC); CREATE INDEX "movies_status_isFeatured_idx" ON "movies"("status","isFeatured"); CREATE INDEX "movies_status_isPopular_viewCount_idx" ON "movies"("status","isPopular","viewCount" DESC); CREATE INDEX "movies_releaseYear_idx" ON "movies"("releaseYear"); CREATE INDEX "movies_country_idx" ON "movies"("country"); CREATE INDEX "movies_language_idx" ON "movies"("language"); CREATE INDEX "movies_title_idx" ON "movies"("title");
CREATE INDEX "movies_title_trgm_idx" ON "movies" USING GIN ("title" gin_trgm_ops); CREATE INDEX "movies_original_title_trgm_idx" ON "movies" USING GIN ("originalTitle" gin_trgm_ops);

CREATE TABLE "tv_categories" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"name" VARCHAR(100) NOT NULL,"slug" VARCHAR(120) NOT NULL,"icon" VARCHAR(20),"description" TEXT,"order" INTEGER NOT NULL DEFAULT 0,"isActive" BOOLEAN NOT NULL DEFAULT true,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "tv_categories_name_key" ON "tv_categories"("name"); CREATE UNIQUE INDEX "tv_categories_slug_key" ON "tv_categories"("slug"); CREATE INDEX "tv_categories_isActive_order_idx" ON "tv_categories"("isActive","order");
CREATE TABLE "tv_channels" (
 "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"name" VARCHAR(180) NOT NULL,"slug" VARCHAR(200) NOT NULL,"logoUrl" TEXT NOT NULL,"bannerUrl" TEXT,"description" TEXT,"country" VARCHAR(100) NOT NULL,"language" VARCHAR(80) NOT NULL,"streamUrl" TEXT NOT NULL,"streamType" "StreamType" NOT NULL DEFAULT 'HLS',"epgUrl" TEXT,"status" "ContentStatus" NOT NULL DEFAULT 'ACTIVE',"order" INTEGER NOT NULL DEFAULT 0,"isPopular" BOOLEAN NOT NULL DEFAULT false,"viewCount" BIGINT NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE UNIQUE INDEX "tv_channels_slug_key" ON "tv_channels"("slug"); CREATE INDEX "tv_channels_status_order_idx" ON "tv_channels"("status","order"); CREATE INDEX "tv_channels_status_isPopular_viewCount_idx" ON "tv_channels"("status","isPopular","viewCount" DESC); CREATE INDEX "tv_channels_country_idx" ON "tv_channels"("country"); CREATE INDEX "tv_channels_language_idx" ON "tv_channels"("language"); CREATE INDEX "tv_channels_name_idx" ON "tv_channels"("name"); CREATE INDEX "tv_channels_name_trgm_idx" ON "tv_channels" USING GIN ("name" gin_trgm_ops);
CREATE TABLE "tv_programs" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"channelId" UUID NOT NULL,"title" VARCHAR(250) NOT NULL,"description" TEXT,"startsAt" TIMESTAMP(3) NOT NULL,"endsAt" TIMESTAMP(3) NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL,CONSTRAINT "tv_programs_time_check" CHECK ("endsAt">"startsAt"));
CREATE INDEX "tv_programs_channelId_startsAt_endsAt_idx" ON "tv_programs"("channelId","startsAt","endsAt"); CREATE INDEX "tv_programs_startsAt_endsAt_idx" ON "tv_programs"("startsAt","endsAt");

CREATE TABLE "movie_favorites" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"userId" UUID NOT NULL,"movieId" UUID NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "movie_favorites_userId_movieId_key" ON "movie_favorites"("userId","movieId"); CREATE INDEX "movie_favorites_userId_createdAt_idx" ON "movie_favorites"("userId","createdAt" DESC);
CREATE TABLE "channel_favorites" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"userId" UUID NOT NULL,"channelId" UUID NOT NULL,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "channel_favorites_userId_channelId_key" ON "channel_favorites"("userId","channelId"); CREATE INDEX "channel_favorites_userId_createdAt_idx" ON "channel_favorites"("userId","createdAt" DESC);
CREATE TABLE "watch_history" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"userId" UUID NOT NULL,"movieId" UUID NOT NULL,"positionSeconds" INTEGER NOT NULL DEFAULT 0,"durationSeconds" INTEGER NOT NULL DEFAULT 0,"progress" DECIMAL(5,2) NOT NULL DEFAULT 0,"completed" BOOLEAN NOT NULL DEFAULT false,"lastWatchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL);
CREATE UNIQUE INDEX "watch_history_userId_movieId_key" ON "watch_history"("userId","movieId"); CREATE INDEX "watch_history_userId_lastWatchedAt_idx" ON "watch_history"("userId","lastWatchedAt" DESC); CREATE INDEX "watch_history_userId_completed_lastWatchedAt_idx" ON "watch_history"("userId","completed","lastWatchedAt" DESC);
CREATE TABLE "movie_views" ("id" BIGSERIAL PRIMARY KEY,"userId" UUID,"movieId" UUID NOT NULL,"sessionId" VARCHAR(100),"watchedSeconds" INTEGER NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "movie_views_movieId_createdAt_idx" ON "movie_views"("movieId","createdAt"); CREATE INDEX "movie_views_userId_createdAt_idx" ON "movie_views"("userId","createdAt");
CREATE TABLE "channel_views" ("id" BIGSERIAL PRIMARY KEY,"userId" UUID,"channelId" UUID NOT NULL,"sessionId" VARCHAR(100),"watchedSeconds" INTEGER NOT NULL DEFAULT 0,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "channel_views_channelId_createdAt_idx" ON "channel_views"("channelId","createdAt"); CREATE INDEX "channel_views_userId_createdAt_idx" ON "channel_views"("userId","createdAt");
CREATE TABLE "import_jobs" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"userId" UUID NOT NULL,"type" "ImportType" NOT NULL,"status" "ImportStatus" NOT NULL DEFAULT 'PROCESSING',"totalRows" INTEGER NOT NULL DEFAULT 0,"successRows" INTEGER NOT NULL DEFAULT 0,"failedRows" INTEGER NOT NULL DEFAULT 0,"errors" JSONB NOT NULL DEFAULT '[]',"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"completedAt" TIMESTAMP(3));
CREATE INDEX "import_jobs_userId_createdAt_idx" ON "import_jobs"("userId","createdAt" DESC);

-- Prisma implicit many-to-many join tables
CREATE TABLE "_MovieToMovieCategory" ("A" UUID NOT NULL,"B" UUID NOT NULL); CREATE UNIQUE INDEX "_MovieToMovieCategory_AB_unique" ON "_MovieToMovieCategory"("A","B"); CREATE INDEX "_MovieToMovieCategory_B_index" ON "_MovieToMovieCategory"("B");
CREATE TABLE "_GenreToMovie" ("A" UUID NOT NULL,"B" UUID NOT NULL); CREATE UNIQUE INDEX "_GenreToMovie_AB_unique" ON "_GenreToMovie"("A","B"); CREATE INDEX "_GenreToMovie_B_index" ON "_GenreToMovie"("B");
CREATE TABLE "_ActorToMovie" ("A" UUID NOT NULL,"B" UUID NOT NULL); CREATE UNIQUE INDEX "_ActorToMovie_AB_unique" ON "_ActorToMovie"("A","B"); CREATE INDEX "_ActorToMovie_B_index" ON "_ActorToMovie"("B");
CREATE TABLE "_DirectorToMovie" ("A" UUID NOT NULL,"B" UUID NOT NULL); CREATE UNIQUE INDEX "_DirectorToMovie_AB_unique" ON "_DirectorToMovie"("A","B"); CREATE INDEX "_DirectorToMovie_B_index" ON "_DirectorToMovie"("B");
CREATE TABLE "_TVCategoryToTVChannel" ("A" UUID NOT NULL,"B" UUID NOT NULL); CREATE UNIQUE INDEX "_TVCategoryToTVChannel_AB_unique" ON "_TVCategoryToTVChannel"("A","B"); CREATE INDEX "_TVCategoryToTVChannel_B_index" ON "_TVCategoryToTVChannel"("B");

ALTER TABLE "admins" ADD CONSTRAINT "admins_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "tv_programs" ADD CONSTRAINT "tv_programs_channelId_fkey" FOREIGN KEY("channelId") REFERENCES "tv_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movie_favorites" ADD CONSTRAINT "movie_favorites_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "movie_favorites" ADD CONSTRAINT "movie_favorites_movieId_fkey" FOREIGN KEY("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "channel_favorites" ADD CONSTRAINT "channel_favorites_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "channel_favorites" ADD CONSTRAINT "channel_favorites_channelId_fkey" FOREIGN KEY("channelId") REFERENCES "tv_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "watch_history" ADD CONSTRAINT "watch_history_movieId_fkey" FOREIGN KEY("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movie_views" ADD CONSTRAINT "movie_views_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; ALTER TABLE "movie_views" ADD CONSTRAINT "movie_views_movieId_fkey" FOREIGN KEY("movieId") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "channel_views" ADD CONSTRAINT "channel_views_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE; ALTER TABLE "channel_views" ADD CONSTRAINT "channel_views_channelId_fkey" FOREIGN KEY("channelId") REFERENCES "tv_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_userId_fkey" FOREIGN KEY("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_MovieToMovieCategory" ADD CONSTRAINT "_MovieToMovieCategory_A_fkey" FOREIGN KEY("A") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "_MovieToMovieCategory" ADD CONSTRAINT "_MovieToMovieCategory_B_fkey" FOREIGN KEY("B") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_A_fkey" FOREIGN KEY("A") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "_GenreToMovie" ADD CONSTRAINT "_GenreToMovie_B_fkey" FOREIGN KEY("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ActorToMovie" ADD CONSTRAINT "_ActorToMovie_A_fkey" FOREIGN KEY("A") REFERENCES "actors"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "_ActorToMovie" ADD CONSTRAINT "_ActorToMovie_B_fkey" FOREIGN KEY("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_DirectorToMovie" ADD CONSTRAINT "_DirectorToMovie_A_fkey" FOREIGN KEY("A") REFERENCES "directors"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "_DirectorToMovie" ADD CONSTRAINT "_DirectorToMovie_B_fkey" FOREIGN KEY("B") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_TVCategoryToTVChannel" ADD CONSTRAINT "_TVCategoryToTVChannel_A_fkey" FOREIGN KEY("A") REFERENCES "tv_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE; ALTER TABLE "_TVCategoryToTVChannel" ADD CONSTRAINT "_TVCategoryToTVChannel_B_fkey" FOREIGN KEY("B") REFERENCES "tv_channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migration 20260813000200_real_movie_catalog
ALTER TABLE "movies" ALTER COLUMN "videoUrl" DROP NOT NULL;
ALTER TABLE "movies" ADD COLUMN "isLicensedVideo" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "movies" ADD COLUMN "metadataSource" VARCHAR(40);
ALTER TABLE "movies" ADD COLUMN "externalId" VARCHAR(100);
CREATE INDEX "movies_isLicensedVideo_status_idx" ON "movies"("isLicensedVideo", "status");
CREATE UNIQUE INDEX "movies_metadataSource_externalId_key" ON "movies"("metadataSource", "externalId");

-- Migration 20260813000300_admin_platform
CREATE TABLE "app_settings" ("id" TEXT PRIMARY KEY,"data" JSONB NOT NULL DEFAULT '{}',"updatedBy" UUID,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "notification_logs" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"title" VARCHAR(160) NOT NULL,"body" TEXT NOT NULL,"topic" VARCHAR(120) NOT NULL DEFAULT 'all',"kind" VARCHAR(40) NOT NULL DEFAULT 'GENERAL',"status" VARCHAR(30) NOT NULL DEFAULT 'QUEUED',"providerMessageId" TEXT,"error" TEXT,"createdBy" UUID,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE "media_assets" ("id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),"key" TEXT NOT NULL UNIQUE,"contentType" VARCHAR(100) NOT NULL,"size" INTEGER NOT NULL,"data" BYTEA NOT NULL,"createdBy" UUID,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "notification_logs_createdAt_idx" ON "notification_logs"("createdAt" DESC);
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");
CREATE INDEX "media_assets_createdAt_idx" ON "media_assets"("createdAt" DESC);
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updatedBy_fkey" FOREIGN KEY("updatedBy") REFERENCES "users"("id") ON DELETE SET NULL;
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_createdBy_fkey" FOREIGN KEY("createdBy") REFERENCES "users"("id") ON DELETE SET NULL;
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_createdBy_fkey" FOREIGN KEY("createdBy") REFERENCES "users"("id") ON DELETE SET NULL;
