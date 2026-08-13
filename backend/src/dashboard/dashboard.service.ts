import { Injectable } from '@nestjs/common';
import { ContentStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const [movies, channels, users, movieViews, channelViews, movieFavorites, channelFavorites, activeChannels, inactiveChannels, todayMovies, topMovies, topChannels, newMovies, newChannels] = await Promise.all([
      this.prisma.movie.count(),
      this.prisma.tVChannel.count(),
      this.prisma.user.count(),
      this.prisma.movieView.count(),
      this.prisma.channelView.count(),
      this.prisma.movieFavorite.count(),
      this.prisma.channelFavorite.count(),
      this.prisma.tVChannel.count({ where: { status: ContentStatus.ACTIVE } }),
      this.prisma.tVChannel.count({ where: { status: { not: ContentStatus.ACTIVE } } }),
      this.prisma.movie.count({ where: { createdAt: { gte: today } } }),
      this.prisma.movie.findMany({ take: 5, orderBy: { viewCount: 'desc' }, select: { id: true, title: true, posterUrl: true, viewCount: true, rating: true } }),
      this.prisma.tVChannel.findMany({ take: 5, orderBy: { viewCount: 'desc' }, select: { id: true, name: true, logoUrl: true, viewCount: true, status: true } }),
      this.prisma.movie.findMany({ take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, posterUrl: true, status: true, createdAt: true } }),
      this.prisma.tVChannel.findMany({ take: 6, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, logoUrl: true, status: true, createdAt: true } }),
    ]);
    return {
      totals: { movies, channels, users, views: movieViews + channelViews, movieViews, channelViews, favorites: movieFavorites + channelFavorites, activeChannels, inactiveChannels, todayMovies },
      topMovie: topMovies[0] || null,
      topChannel: topChannels[0] || null,
      topMovies,
      topChannels,
      newMovies,
      newChannels,
    };
  }

  async statistics() {
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const dayAgo = new Date(Date.now() - 86400000);
    const [monthlyMovieViews, monthlyChannelViews, weeklyMovieViews, weeklyChannelViews, dailyMovieViews, dailyChannelViews, newUsers, topMovies, topChannels, topCategories, dailyRows, userRows] = await Promise.all([
      this.prisma.movieView.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.channelView.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.movieView.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.channelView.count({ where: { createdAt: { gte: weekAgo } } }),
      this.prisma.movieView.count({ where: { createdAt: { gte: dayAgo } } }),
      this.prisma.channelView.count({ where: { createdAt: { gte: dayAgo } } }),
      this.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      this.prisma.movie.findMany({ take: 10, orderBy: { viewCount: 'desc' }, select: { id: true, title: true, viewCount: true, rating: true } }),
      this.prisma.tVChannel.findMany({ take: 10, orderBy: { viewCount: 'desc' }, select: { id: true, name: true, viewCount: true } }),
      this.prisma.movieCategory.findMany({ take: 10, orderBy: { movies: { _count: 'desc' } }, select: { id: true, name: true, _count: { select: { movies: true } } } }),
      this.prisma.$queryRaw<Array<{ day: Date; views: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS views
        FROM (
          SELECT "createdAt" FROM movie_views WHERE "createdAt" >= ${monthAgo}
          UNION ALL
          SELECT "createdAt" FROM channel_views WHERE "createdAt" >= ${monthAgo}
        ) events GROUP BY day ORDER BY day ASC`,
      this.prisma.$queryRaw<Array<{ day: Date; users: bigint }>>`
        SELECT DATE_TRUNC('day', "createdAt") AS day, COUNT(*)::bigint AS users
        FROM users WHERE "createdAt" >= ${monthAgo} GROUP BY day ORDER BY day ASC`,
    ]);
    return {
      period: '30 kun',
      newUsers,
      views: { daily: dailyMovieViews + dailyChannelViews, weekly: weeklyMovieViews + weeklyChannelViews, monthly: monthlyMovieViews + monthlyChannelViews },
      movieViewEvents: monthlyMovieViews,
      channelViewEvents: monthlyChannelViews,
      topMovies,
      topChannels,
      topCategories: topCategories.map((x) => ({ id: x.id, name: x.name, count: x._count.movies })),
      dailyViews: dailyRows.map((x) => ({ date: x.day, views: Number(x.views) })),
      userGrowth: userRows.map((x) => ({ date: x.day, users: Number(x.users) })),
    };
  }
}
