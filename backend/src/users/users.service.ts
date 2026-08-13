import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, Role } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import { pageMeta } from '../common/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUpdateUserDto, ChangePasswordDto, SettingsDto, UpdateProfileDto, UserQueryDto } from './users.dto';

const safeSelect = { id: true, name: true, email: true, phone: true, avatarUrl: true, role: true, isActive: true, preferredQuality: true, darkMode: true, autoplay: true, notifications: true, createdAt: true, updatedAt: true } as const;
const profiles = {
  SUPER_ADMIN: ['*'],
  ADMIN: ['movies:write','movies:delete','channels:write','channels:delete','categories:write','categories:delete','programs:write','programs:delete','users:read','users:write','imports:write','uploads:write','statistics:read','settings:write','notifications:write'],
  MODERATOR: ['movies:write','channels:write','categories:read','programs:write','statistics:read'],
} as const;
type AdminRole = keyof typeof profiles;

const adminRoleOf = (permissions: unknown): AdminRole | null => {
  if (!Array.isArray(permissions)) return null;
  if (permissions.includes('*')) return 'SUPER_ADMIN';
  if (permissions.includes('movies:delete') || permissions.includes('channels:delete')) return 'ADMIN';
  return 'MODERATOR';
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async me(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { ...safeSelect, admin: { select: { permissions: true, lastLoginAt: true } }, _count: { select: { movieFavorites: true, channelFavorites: true, watchHistory: true } } } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi.");
    return { ...user, adminRole: adminRoleOf(user.admin?.permissions) };
  }
  update(id: string, dto: UpdateProfileDto) { return this.prisma.user.update({ where: { id }, data: { ...dto, email: dto.email?.toLowerCase(), phone: dto.phone?.replace(/\s/g, '') }, select: safeSelect }); }
  settings(id: string, dto: SettingsDto) { return this.prisma.user.update({ where: { id }, data: dto, select: safeSelect }); }
  async password(id: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user || !await bcrypt.compare(dto.currentPassword, user.passwordHash)) throw new UnauthorizedException("Amaldagi parol noto‘g‘ri.");
    await this.prisma.user.update({ where: { id }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } });
    await this.prisma.refreshToken.updateMany({ where: { userId: id, revokedAt: null }, data: { revokedAt: new Date() } });
    return { message: "Parol yangilandi. Qayta kiring." };
  }

  async list(query: UserQueryDto) {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
      ...(query.q ? { OR: [{ name: { contains: query.q, mode: 'insensitive' } }, { email: { contains: query.q, mode: 'insensitive' } }, { phone: { contains: query.q } }] } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({ where, select: { ...safeSelect, admin: { select: { permissions: true, lastLoginAt: true } }, _count: { select: { movieViews: true, channelViews: true, movieFavorites: true, channelFavorites: true } } }, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count({ where }),
    ]);
    return { data: rows.map((user) => ({ ...user, adminRole: adminRoleOf(user.admin?.permissions) })), meta: pageMeta(total, query.page, query.limit) };
  }

  async detail(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { ...safeSelect, admin: { select: { permissions: true, lastLoginAt: true } }, _count: { select: { movieViews: true, channelViews: true, movieFavorites: true, channelFavorites: true, watchHistory: true } } } });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi.");
    return { ...user, adminRole: adminRoleOf(user.admin?.permissions) };
  }

  async adminUpdate(id: string, dto: AdminUpdateUserDto, currentId: string) {
    if (id === currentId && dto.isActive === false) throw new UnauthorizedException("O‘z hisobingizni bloklay olmaysiz.");
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException("Foydalanuvchi topilmadi.");

    if (dto.role !== undefined || dto.adminRole !== undefined) {
      await this.requireSuperAdmin(currentId);
      if (id === currentId && dto.role === Role.USER) throw new ForbiddenException("O‘zingizdan admin rolini olib tashlay olmaysiz.");
    }
    const role = dto.adminRole ? Role.ADMIN : dto.role;
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id }, data: { ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}), ...(role !== undefined ? { role } : {}) } });
      if (role === Role.USER) await tx.admin.deleteMany({ where: { userId: id } });
      if (role === Role.ADMIN || dto.adminRole) {
        const profile = dto.adminRole || 'ADMIN';
        await tx.admin.upsert({ where: { userId: id }, update: { permissions: [...profiles[profile]] }, create: { userId: id, permissions: [...profiles[profile]] } });
      }
    });
    return this.detail(id);
  }

  async remove(id: string, currentId: string) {
    if (id === currentId) throw new ForbiddenException("O‘z hisobingizni o‘chira olmaysiz.");
    await this.requireSuperAdmin(currentId);
    if (!await this.prisma.user.findUnique({ where: { id } })) throw new NotFoundException("Foydalanuvchi topilmadi.");
    await this.prisma.user.delete({ where: { id } });
    return { message: "Foydalanuvchi o‘chirildi." };
  }

  private async requireSuperAdmin(id: string) {
    const admin = await this.prisma.admin.findUnique({ where: { userId: id }, select: { permissions: true } });
    if (!Array.isArray(admin?.permissions) || !admin.permissions.includes('*')) throw new ForbiddenException("Faqat SUPER ADMIN ushbu amalni bajara oladi.");
  }
}
