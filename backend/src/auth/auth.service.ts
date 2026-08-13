import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly config: ConfigService) {}

  async register(dto: RegisterDto, meta: { ip?: string; userAgent?: string }) {
    if (!dto.email && !dto.phone) throw new BadRequestException("Email yoki telefon raqamidan birini kiriting.");
    const email = dto.email?.trim().toLowerCase();
    const phone = dto.phone?.replace(/\s/g, '');
    const duplicate = await this.prisma.user.findFirst({ where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] } });
    if (duplicate) throw new ConflictException("Ushbu email yoki telefon bilan hisob mavjud.");
    const user = await this.prisma.user.create({ data: { name: dto.name.trim(), email, phone, passwordHash: await bcrypt.hash(dto.password, 12) } });
    return this.issueTokens(user, meta);
  }

  async login(dto: LoginDto, meta: { ip?: string; userAgent?: string }, adminOnly = false) {
    const identifier = dto.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: identifier }] } });
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException("Login yoki parol noto‘g‘ri.");
    if (adminOnly && user.role !== Role.ADMIN) throw new UnauthorizedException("Admin huquqi talab qilinadi.");
    if (user.role === Role.ADMIN) await this.prisma.admin.updateMany({ where: { userId: user.id }, data: { lastLoginAt: new Date() } });
    return this.issueTokens(user, meta);
  }

  async refresh(rawToken: string, meta: { ip?: string; userAgent?: string }) {
    let payload: { sub: string; type: string };
    try { payload = await this.jwt.verifyAsync(rawToken, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET') }); }
    catch { throw new UnauthorizedException("Refresh token yaroqsiz yoki muddati tugagan."); }
    if (payload.type !== 'refresh') throw new UnauthorizedException("Token turi noto‘g‘ri.");
    const tokenHash = this.hashToken(rawToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
    if (!stored || stored.revokedAt || stored.expiresAt <= new Date() || !stored.user.isActive) throw new UnauthorizedException("Refresh token bekor qilingan.");
    await this.prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
    return this.issueTokens(stored.user, meta);
  }

  async logout(userId: string, rawToken?: string) {
    if (rawToken) await this.prisma.refreshToken.updateMany({ where: { userId, tokenHash: this.hashToken(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
    else await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
    return { message: "Hisobdan muvaffaqiyatli chiqdingiz." };
  }

  private async issueTokens(user: { id: string; name: string; email: string | null; phone: string | null; role: Role }, meta: { ip?: string; userAgent?: string }) {
    const payload = { sub: user.id, role: user.role };
    const accessToken = await this.jwt.signAsync({ ...payload, type: 'access', jti: randomUUID() }, { secret: this.config.getOrThrow('JWT_ACCESS_SECRET'), expiresIn: this.config.get('JWT_ACCESS_EXPIRES', '15m') as any });
    const refreshToken = await this.jwt.signAsync({ ...payload, type: 'refresh', jti: randomUUID() }, { secret: this.config.getOrThrow('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES', '30d') as any });
    const decoded = this.jwt.decode(refreshToken) as { exp: number };
    await this.prisma.refreshToken.create({ data: { userId: user.id, tokenHash: this.hashToken(refreshToken), userAgent: meta.userAgent?.slice(0, 500), ipAddress: meta.ip, expiresAt: new Date(decoded.exp * 1000) } });
    return { accessToken, refreshToken, tokenType: 'Bearer', expiresIn: 900, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role } };
  }
  private hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
}
