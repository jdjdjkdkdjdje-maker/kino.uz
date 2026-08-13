import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus } from '../generated/prisma/client';
import { slugify } from '../common/slug';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CategoryKind, CreateCategoryDto, CreateGenreDto, UpdateCategoryDto, UpdateGenreDto } from './catalog.dto';
@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService, private readonly cache: RedisService) {}
  async all() {
    const [movieCategories, tvCategories, genres] = await Promise.all([
      this.prisma.movieCategory.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { name: 'asc' }], include: { _count: { select: { movies: { where: { status: ContentStatus.ACTIVE } } } } } }),
      this.prisma.tVCategory.findMany({ where: { isActive: true }, orderBy: [{ order: 'asc' }, { name: 'asc' }], include: { _count: { select: { channels: { where: { status: ContentStatus.ACTIVE } } } } } }),
      this.prisma.genre.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { movies: { where: { status: ContentStatus.ACTIVE } } } } } }),
    ]);
    return { movieCategories, tvCategories, genres };
  }
  movieCategories(admin = false) { return this.prisma.movieCategory.findMany({ where: admin ? {} : { isActive: true }, orderBy: [{ order: 'asc' }, { name: 'asc' }], include: { _count: { select: { movies: true } } } }); }
  tvCategories(admin = false) { return this.prisma.tVCategory.findMany({ where: admin ? {} : { isActive: true }, orderBy: [{ order: 'asc' }, { name: 'asc' }], include: { _count: { select: { channels: true } } } }); }
  genres() { return this.prisma.genre.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { movies: true } } } }); }
  async createCategory(dto: CreateCategoryDto) { const data = { name: dto.name.trim(), slug: slugify(dto.name), icon: dto.icon, description: dto.description, order: dto.order, isActive: dto.isActive }; const category = dto.type === CategoryKind.TV ? await this.prisma.tVCategory.create({ data }) : await this.prisma.movieCategory.create({ data }); await this.cache.deleteByPrefix('home:'); return category; }
  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const data = { ...(dto.name ? { name: dto.name.trim(), slug: slugify(dto.name) } : {}), ...(dto.icon !== undefined ? { icon: dto.icon } : {}), ...(dto.description !== undefined ? { description: dto.description } : {}), ...(dto.order !== undefined ? { order: dto.order } : {}), ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}) };
    let category;
    if (await this.prisma.movieCategory.findUnique({ where: { id } })) category = await this.prisma.movieCategory.update({ where: { id }, data });
    else if (await this.prisma.tVCategory.findUnique({ where: { id } })) category = await this.prisma.tVCategory.update({ where: { id }, data });
    else throw new NotFoundException("Kategoriya topilmadi.");
    await this.cache.deleteByPrefix('home:');
    return category;
  }
  async deleteCategory(id: string) { if (await this.prisma.movieCategory.findUnique({ where: { id } })) await this.prisma.movieCategory.delete({ where: { id } }); else if (await this.prisma.tVCategory.findUnique({ where: { id } })) await this.prisma.tVCategory.delete({ where: { id } }); else throw new NotFoundException("Kategoriya topilmadi."); await this.cache.deleteByPrefix('home:'); return { message: "Kategoriya o‘chirildi." }; }
  createGenre(dto: CreateGenreDto) { return this.prisma.genre.create({ data: { name: dto.name.trim(), slug: slugify(dto.name) } }); }
  async updateGenre(id: string, dto: UpdateGenreDto) { if (!await this.prisma.genre.findUnique({ where: { id } })) throw new NotFoundException("Janr topilmadi."); return this.prisma.genre.update({ where: { id }, data: dto.name ? { name: dto.name.trim(), slug: slugify(dto.name) } : {} }); }
  async deleteGenre(id: string) { if (!await this.prisma.genre.findUnique({ where: { id } })) throw new NotFoundException("Janr topilmadi."); await this.prisma.genre.delete({ where: { id } }); return { message: "Janr o‘chirildi." }; }
  async home() {
    const cached = await this.cache.getJson<Record<string, unknown>>('home:v1');
    if (cached) return cached;
    const includeMovie = { categories: { take: 2, select: { id: true, name: true, slug: true } }, genres: { take: 3, select: { id: true, name: true, slug: true } } } as const;
    const includeChannel = { categories: { take: 2, select: { id: true, name: true, slug: true } } } as const;
    const [banner, recommended, popularMovies, newMovies, liveChannels, popularChannels, movieCategories, tvCategories] = await Promise.all([
      this.prisma.movie.findFirst({ where: { status: ContentStatus.ACTIVE, isFeatured: true }, include: includeMovie, orderBy: { updatedAt: 'desc' } }),
      this.prisma.movie.findMany({ where: { status: ContentStatus.ACTIVE, isFeatured: true }, include: includeMovie, take: 12, orderBy: { rating: 'desc' } }),
      this.prisma.movie.findMany({ where: { status: ContentStatus.ACTIVE }, include: includeMovie, take: 12, orderBy: { viewCount: 'desc' } }),
      this.prisma.movie.findMany({ where: { status: ContentStatus.ACTIVE }, include: includeMovie, take: 12, orderBy: { createdAt: 'desc' } }),
      this.prisma.tVChannel.findMany({ where: { status: ContentStatus.ACTIVE }, include: includeChannel, take: 12, orderBy: { order: 'asc' } }),
      this.prisma.tVChannel.findMany({ where: { status: ContentStatus.ACTIVE, isPopular: true }, include: includeChannel, take: 12, orderBy: { viewCount: 'desc' } }),
      this.prisma.movieCategory.findMany({ where: { isActive: true }, take: 20, orderBy: { order: 'asc' } }),
      this.prisma.tVCategory.findMany({ where: { isActive: true }, take: 20, orderBy: { order: 'asc' } }),
    ]);
    const result = { banner: banner ? this.publicMovieCard(banner) : null, recommended: recommended.map((movie) => this.publicMovieCard(movie)), popularMovies: popularMovies.map((movie) => this.publicMovieCard(movie)), newMovies: newMovies.map((movie) => this.publicMovieCard(movie)), liveChannels: liveChannels.map(({ streamUrl: _s, epgUrl: _e, ...x }) => x), popularChannels: popularChannels.map(({ streamUrl: _s, epgUrl: _e, ...x }) => x), movieCategories, tvCategories };
    await this.cache.setJson('home:v1', result, 60);
    return result;
  }
  async personalized(userId: string) { const rows = await this.prisma.watchHistory.findMany({ where: { userId }, include: { movie: { include: { genres: true, categories: true } } }, orderBy: { lastWatchedAt: 'desc' }, take: 20 }); const safeRows = rows.map((row) => ({ ...row, movie: this.publicMovieCard(row.movie) })); return { continueWatching: safeRows.filter((x) => !x.completed && Number(x.progress) < 95), recentlyWatched: safeRows }; }
  private publicMovieCard(movie: any) { return { ...movie, videoUrl: null, subtitleUrl: null, hasFullVideo: Boolean(movie.isLicensedVideo && movie.videoUrl) }; }
}
