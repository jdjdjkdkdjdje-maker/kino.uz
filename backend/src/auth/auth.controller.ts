import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto, LogoutDto, RefreshDto, RegisterDto } from './auth.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('register') @Throttle({ default: { limit: 5, ttl: 60_000 } })
  register(@Body() dto: RegisterDto, @Req() req: Request) { return this.service.register(dto, this.meta(req)); }
  @Post('login') @Throttle({ default: { limit: 10, ttl: 60_000 } })
  login(@Body() dto: LoginDto, @Req() req: Request) { return this.service.login(dto, this.meta(req)); }
  @Post('admin/login') @Throttle({ default: { limit: 5, ttl: 60_000 } })
  adminLogin(@Body() dto: LoginDto, @Req() req: Request) { return this.service.login(dto, this.meta(req), true); }
  @Post('refresh') @Throttle({ default: { limit: 20, ttl: 60_000 } })
  refresh(@Body() dto: RefreshDto, @Req() req: Request) { return this.service.refresh(dto.refreshToken, this.meta(req)); }
  @Post('logout') @UseGuards(JwtAuthGuard) @ApiBearerAuth()
  logout(@CurrentUser() user: AuthUser, @Body() dto: LogoutDto) { return this.service.logout(user.id, dto.refreshToken); }
  private meta(req: Request) { return { ip: req.ip, userAgent: req.headers['user-agent'] }; }
}
