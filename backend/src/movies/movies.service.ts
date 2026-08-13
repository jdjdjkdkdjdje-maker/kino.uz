import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '../generated/prisma/client';
import { randomUUID } from 'crypto';
import { pageMeta } from '../common/pagination.dto';
import { slugify } from '../common/slug';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMovieDto, MovieQueryDto, UpdateMovieDto } from './movies.dto';

const cardInclude = { categories: { select: { id: true, name: true, slug: true } }, genres: { select: { id: true, name: true, slug: true } } } as const;
const detailInclude = { ...cardInclude, actors: { select: { id: true, name: true, photoUrl: true } }, directors: { select: { id: true, name: true, photoUrl: true } } } as const;
@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService, private readonly cache: RedisService) {}
  async findAll(query: MovieQueryDto, admin = false) {
    const { page, limit } = query;
    const where: Prisma.MovieWhereInput = {
      ...(admin ? (query.status ? { status: query.status } : {}) : { status: ContentStatus.ACTIVE }),
      ...(query.q ? { OR: [{ title: { contains: query.q, mode: 'insensitive' } }, { originalTitle: { contains: query.q, mode: 'insensitive' } }] } : {}),
      ...(query.category ? { categories: { some: this.isUuid(query.category) ? { id: query.category } : { slug: query.category } } } : {}),
      ...(query.genre ? { genres: { some: this.isUuid(query.genre) ? { id: query.genre } : { slug: query.genre } } } : {}),
      ...(query.year ? { releaseYear: query.year } : {}),
      ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
      ...(query.language ? { language: { equals: query.language, mode: 'insensitive' } } : {}),
      ...(query.featured !== undefined ? { isFeatured: query.featured } : {}),
    };
    const orderBy: Prisma.MovieOrderByWithRelationInput = query.sort === 'popular' ? { viewCount: 'desc' } : query.sort === 'rating' ? { rating: 'desc' } : query.sort === 'year' ? { releaseYear: 'desc' } : { createdAt: 'desc' };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.movie.findMany({ where, include: cardInclude, orderBy, skip: (page - 1) * limit, take: limit }),
      this.prisma.movie.count({ where }),
    ]);
    return { data: admin ? data : data.map((movie) => this.publicMovie(movie, false)), meta: pageMeta(total, page, limit) };
  }
  async findOne(id: string, activeOnly = true) {
    const movie = await this.prisma.movie.findFirst({ where: { OR: [{ id: this.asUuid(id) }, { slug: id }], ...(activeOnly ? { status: ContentStatus.ACTIVE } : {}) }, include: detailInclude });
    if (!movie) throw new NotFoundException("Kino topilmadi.");
    const similar = await this.prisma.movie.findMany({ where: { id: { not: movie.id }, status: ContentStatus.ACTIVE, OR: [{ genres: { some: { id: { in: movie.genres.map((g) => g.id) } } } }, { categories: { some: { id: { in: movie.categories.map((c) => c.id) } } } }] }, include: cardInclude, take: 12, orderBy: { viewCount: 'desc' } });
    if (!activeOnly) return { ...movie, similar: similar.map((item) => this.publicMovie(item, false)) };
    return { ...this.publicMovie(movie, true), similar: similar.map((item) => this.publicMovie(item, false)) };
  }
  async create(dto: CreateMovieDto) {
    this.validateLicense(dto.videoUrl, dto.isLicensedVideo);
    const movie = await this.prisma.movie.create({ data: this.toData(dto, `${slugify(dto.title)}-${randomUUID().slice(0, 8)}`), include: detailInclude });
    await this.cache.deleteByPrefix('home:');
    return movie;
  }
  async update(id: string, dto: UpdateMovieDto) {
    const existing = await this.ensureExists(id);
    this.validateLicense(dto.videoUrl === undefined ? existing.videoUrl : dto.videoUrl, dto.isLicensedVideo === undefined ? existing.isLicensedVideo : dto.isLicensedVideo);
    const movie = await this.prisma.movie.update({ where: { id }, data: this.toUpdateData(dto), include: detailInclude });
    await this.cache.deleteByPrefix('home:');
    return movie;
  }
  async remove(id: string) { await this.ensureExists(id); await this.prisma.movie.delete({ where: { id } }); await this.cache.deleteByPrefix('home:'); return { message: "Kino o‘chirildi." }; }
  async recordView(id: string, userId?: string, watchedSeconds = 0, sessionId?: string) {
    const movie = await this.ensureExists(id);
    if (!movie.videoUrl || !movie.isLicensedVideo) throw new BadRequestException("Ushbu film uchun qonuniy to‘liq video mavjud emas.");
    await this.prisma.$transaction([
      this.prisma.movieView.create({ data: { movieId: id, userId, watchedSeconds, sessionId } }),
      this.prisma.movie.update({ where: { id }, data: { viewCount: { increment: 1 } } }),
    ]);
    return { success: true };
  }
  private async ensureExists(id: string) {
    const movie = await this.prisma.movie.findUnique({ where: { id }, select: { id: true, videoUrl: true, isLicensedVideo: true } });
    if (!movie) throw new NotFoundException("Kino topilmadi.");
    return movie;
  }
  private validateLicense(videoUrl?: string | null, isLicensedVideo?: boolean) {
    if (isLicensedVideo && !videoUrl) throw new BadRequestException("Litsenziya tasdiqlansa, qonuniy to‘liq video URL ham kiritilishi kerak.");
  }
  private publicMovie(movie: any, includePlayableVideo: boolean) {
    const hasFullVideo = Boolean(movie.isLicensedVideo && movie.videoUrl);
    return { ...movie, videoUrl: includePlayableVideo && hasFullVideo ? movie.videoUrl : null, subtitleUrl: includePlayableVideo && hasFullVideo ? movie.subtitleUrl : null, hasFullVideo };
  }
  private isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
  private asUuid(value: string) { return this.isUuid(value) ? value : '00000000-0000-0000-0000-000000000000'; }
  private toData(dto: CreateMovieDto, slug: string): Prisma.MovieCreateInput {
    return { title: dto.title.trim(), originalTitle: dto.originalTitle?.trim(), slug, description: dto.description, posterUrl: dto.posterUrl, bannerUrl: dto.bannerUrl, releaseYear: dto.releaseYear, durationMinutes: dto.durationMinutes, rating: dto.rating, language: dto.language, country: dto.country, videoUrl: dto.videoUrl, trailerUrl: dto.trailerUrl, subtitleUrl: dto.subtitleUrl, isLicensedVideo: dto.isLicensedVideo, metadataSource: dto.metadataSource, externalId: dto.externalId, status: dto.status, isFeatured: dto.isFeatured, isPopular: dto.isPopular, categories: { connect: dto.categoryIds.map((id) => ({ id })) }, genres: { connect: dto.genreIds.map((id) => ({ id })) }, actors: { connectOrCreate: (dto.actors || []).map((name) => ({ where: { name: name.trim() }, create: { name: name.trim() } })) }, directors: { connectOrCreate: (dto.directors || []).map((name) => ({ where: { name: name.trim() }, create: { name: name.trim() } })) } };
  }
  private toUpdateData(dto: UpdateMovieDto): Prisma.MovieUpdateInput {
    const scalar: Prisma.MovieUpdateInput = {};
    for (const key of ['title','originalTitle','description','posterUrl','bannerUrl','releaseYear','durationMinutes','rating','language','country','videoUrl','trailerUrl','subtitleUrl','isLicensedVideo','metadataSource','externalId','status','isFeatured','isPopular'] as const) if (dto[key] !== undefined) (scalar as any)[key] = dto[key];
    if (dto.categoryIds) scalar.categories = { set: dto.categoryIds.map((id) => ({ id })) };
    if (dto.genreIds) scalar.genres = { set: dto.genreIds.map((id) => ({ id })) };
    if (dto.actors) scalar.actors = { set: [], connectOrCreate: dto.actors.map((name) => ({ where: { name: name.trim() }, create: { name: name.trim() } })) };
    if (dto.directors) scalar.directors = { set: [], connectOrCreate: dto.directors.map((name) => ({ where: { name: name.trim() }, create: { name: name.trim() } })) };
    return scalar;
  }
}
