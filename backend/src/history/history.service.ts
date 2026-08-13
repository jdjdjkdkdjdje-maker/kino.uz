import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { pageMeta } from '../common/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryQueryDto, SaveHistoryDto } from './history.dto';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}
  async all(userId: string, query: HistoryQueryDto) {
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.watchHistory.findMany({ where: { userId }, include: { movie: { include: { genres: true, categories: true } } }, orderBy: { lastWatchedAt: 'desc' }, skip: (query.page - 1) * query.limit, take: query.limit }),
      this.prisma.watchHistory.count({ where: { userId } }),
    ]);
    const data = rows.map((row) => ({ ...row, movie: this.publicCard(row.movie) }));
    return { data, meta: pageMeta(total, query.page, query.limit) };
  }
  async save(userId: string, dto: SaveHistoryDto) {
    const movie = await this.prisma.movie.findUnique({ where: { id: dto.movieId }, select: { id: true, videoUrl: true, isLicensedVideo: true } });
    if (!movie) throw new NotFoundException("Kino topilmadi.");
    if (!movie.videoUrl || !movie.isLicensedVideo) throw new BadRequestException("Ushbu film uchun qonuniy to‘liq video mavjud emas.");
    const progress = dto.durationSeconds > 0 ? Math.min(100, Number(((dto.positionSeconds / dto.durationSeconds) * 100).toFixed(2))) : 0;
    const completed = dto.completed ?? progress >= 95;
    const row = await this.prisma.watchHistory.upsert({ where: { userId_movieId: { userId, movieId: dto.movieId } }, create: { userId, movieId: dto.movieId, positionSeconds: dto.positionSeconds, durationSeconds: dto.durationSeconds, progress, completed, lastWatchedAt: new Date() }, update: { positionSeconds: dto.positionSeconds, durationSeconds: dto.durationSeconds, progress, completed, lastWatchedAt: new Date() }, include: { movie: true } });
    return { ...row, movie: this.publicCard(row.movie) };
  }
  async clear(userId: string) { await this.prisma.watchHistory.deleteMany({ where: { userId } }); return { message: "Ko‘rish tarixi tozalandi." }; }
  private publicCard(movie: any) { return { ...movie, videoUrl: null, subtitleUrl: null, hasFullVideo: Boolean(movie.isLicensedVideo && movie.videoUrl) }; }
}
