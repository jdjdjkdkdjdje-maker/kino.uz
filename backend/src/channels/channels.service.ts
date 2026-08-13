import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentStatus, Prisma } from '../generated/prisma/client';
import { randomUUID } from 'crypto';
import { pageMeta } from '../common/pagination.dto';
import { slugify } from '../common/slug';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ChannelQueryDto, CreateChannelDto, UpdateChannelDto } from './channels.dto';
const categoryInclude = { categories: { select: { id: true, name: true, slug: true, icon: true } } } as const;
@Injectable()
export class ChannelsService {
  constructor(private readonly prisma: PrismaService, private readonly cache: RedisService) {}
  async findAll(query: ChannelQueryDto, admin = false) {
    const where: Prisma.TVChannelWhereInput = {
      ...(admin ? (query.status ? { status: query.status } : {}) : { status: ContentStatus.ACTIVE }),
      ...(query.q ? { name: { contains: query.q, mode: 'insensitive' } } : {}),
      ...(query.category ? { categories: { some: this.isUuid(query.category) ? { id: query.category } : { slug: query.category } } } : {}),
      ...(query.country ? { country: { equals: query.country, mode: 'insensitive' } } : {}),
      ...(query.language ? { language: { equals: query.language, mode: 'insensitive' } } : {}),
      ...(query.popular !== undefined ? { isPopular: query.popular } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.tVChannel.findMany({ where, include: categoryInclude, orderBy: [{ order: 'asc' }, { viewCount: 'desc' }], skip: (query.page - 1) * query.limit, take: query.limit }),
      this.prisma.tVChannel.count({ where }),
    ]);
    const data = admin ? rows : rows.map(({ streamUrl: _stream, epgUrl: _epg, ...channel }) => channel);
    return { data, meta: pageMeta(total, query.page, query.limit) };
  }
  async findOne(id: string, activeOnly = true) {
    const channel = await this.prisma.tVChannel.findFirst({ where: { OR: [{ id: this.asUuid(id) }, { slug: id }], ...(activeOnly ? { status: ContentStatus.ACTIVE } : {}) }, include: categoryInclude });
    if (!channel) throw new NotFoundException("Telekanal topilmadi.");
    const now = new Date();
    const [currentProgram, nextProgram] = await Promise.all([
      this.prisma.tVProgram.findFirst({ where: { channelId: channel.id, startsAt: { lte: now }, endsAt: { gt: now } }, orderBy: { startsAt: 'asc' } }),
      this.prisma.tVProgram.findFirst({ where: { channelId: channel.id, startsAt: { gt: now } }, orderBy: { startsAt: 'asc' } }),
    ]);
    return { ...channel, currentProgram, nextProgram };
  }
  async create(dto: CreateChannelDto) { const channel = await this.prisma.tVChannel.create({ data: this.toData(dto), include: categoryInclude }); await this.cache.deleteByPrefix('home:'); return channel; }
  async update(id: string, dto: UpdateChannelDto) { await this.ensure(id); const channel = await this.prisma.tVChannel.update({ where: { id }, data: this.toUpdate(dto), include: categoryInclude }); await this.cache.deleteByPrefix('home:'); return channel; }
  async remove(id: string) { await this.ensure(id); await this.prisma.tVChannel.delete({ where: { id } }); await this.cache.deleteByPrefix('home:'); return { message: "Telekanal o‘chirildi." }; }
  async recordView(id: string, userId: string, watchedSeconds = 0, sessionId?: string) {
    await this.ensure(id);
    await this.prisma.$transaction([this.prisma.channelView.create({ data: { channelId: id, userId, watchedSeconds, sessionId } }), this.prisma.tVChannel.update({ where: { id }, data: { viewCount: { increment: 1 } } })]);
    return { success: true };
  }
  private async ensure(id: string) { if (!await this.prisma.tVChannel.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException("Telekanal topilmadi."); }
  private isUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
  private asUuid(value: string) { return this.isUuid(value) ? value : '00000000-0000-0000-0000-000000000000'; }
  private toData(dto: CreateChannelDto): Prisma.TVChannelCreateInput { return { name: dto.name.trim(), slug: `${slugify(dto.name)}-${randomUUID().slice(0, 8)}`, logoUrl: dto.logoUrl, bannerUrl: dto.bannerUrl, description: dto.description, country: dto.country, language: dto.language, streamUrl: dto.streamUrl, streamType: dto.streamType, epgUrl: dto.epgUrl, status: dto.status, order: dto.order, isPopular: dto.isPopular, categories: { connect: dto.categoryIds.map((id) => ({ id })) } }; }
  private toUpdate(dto: UpdateChannelDto): Prisma.TVChannelUpdateInput { const data: Prisma.TVChannelUpdateInput = {}; for (const key of ['name','logoUrl','bannerUrl','description','country','language','streamUrl','streamType','epgUrl','status','order','isPopular'] as const) if (dto[key] !== undefined) (data as any)[key] = dto[key]; if (dto.categoryIds) data.categories = { set: dto.categoryIds.map((id) => ({ id })) }; return data; }
}
