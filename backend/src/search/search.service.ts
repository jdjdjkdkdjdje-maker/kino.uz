import { Injectable } from '@nestjs/common';
import { ContentStatus, Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SearchDto } from './search.dto';
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}
  async search(dto: SearchDto) {
    const q = dto.q.trim();
    const movieWhere: Prisma.MovieWhereInput = { status: ContentStatus.ACTIVE, AND: [
      { OR: [{ title: { contains: q, mode: 'insensitive' } }, { originalTitle: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }, { actors: { some: { name: { contains: q, mode: 'insensitive' } } } }, { directors: { some: { name: { contains: q, mode: 'insensitive' } } } }, { genres: { some: { name: { contains: q, mode: 'insensitive' } } } }] },
      ...(dto.actor ? [{ actors: { some: { name: { contains: dto.actor, mode: 'insensitive' as const } } } }] : []),
      ...(dto.director ? [{ directors: { some: { name: { contains: dto.director, mode: 'insensitive' as const } } } }] : []),
      ...(dto.genre ? [{ genres: { some: this.relation(dto.genre) } }] : []),
      ...(dto.category ? [{ categories: { some: this.relation(dto.category) } }] : []),
      ...(dto.country ? [{ country: { equals: dto.country, mode: 'insensitive' as const } }] : []),
      ...(dto.year ? [{ releaseYear: dto.year }] : []),
    ] };
    const channelWhere: Prisma.TVChannelWhereInput = { status: ContentStatus.ACTIVE, AND: [
      { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
      ...(dto.category ? [{ categories: { some: this.relation(dto.category) } }] : []),
      ...(dto.country ? [{ country: { equals: dto.country, mode: 'insensitive' as const } }] : []),
    ] };
    const [movies, channels, movieTotal, channelTotal] = await this.prisma.$transaction([
      this.prisma.movie.findMany({ where: movieWhere, include: { genres: true, categories: true }, orderBy: { viewCount: 'desc' }, take: dto.limit }),
      this.prisma.tVChannel.findMany({ where: channelWhere, include: { categories: true }, orderBy: { viewCount: 'desc' }, take: dto.limit }),
      this.prisma.movie.count({ where: movieWhere }), this.prisma.tVChannel.count({ where: channelWhere }),
    ]);
    return { query: q, movies: movies.map((movie) => ({ ...movie, videoUrl: null, subtitleUrl: null, hasFullVideo: Boolean(movie.isLicensedVideo && movie.videoUrl) })), channels: channels.map(({ streamUrl: _s, epgUrl: _e, ...x }) => x), totals: { movies: movieTotal, channels: channelTotal } };
  }
  private relation(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? { id: value } : { slug: value };
  }
}
