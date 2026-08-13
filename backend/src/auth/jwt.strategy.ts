import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET') });
  }
  async validate(payload: { sub: string; role: 'USER' | 'ADMIN' }) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, role: true, email: true, phone: true, isActive: true } });
    if (!user?.isActive) throw new UnauthorizedException("Hisob faol emas yoki topilmadi.");
    return { id: user.id, role: user.role, email: user.email, phone: user.phone };
  }
}
