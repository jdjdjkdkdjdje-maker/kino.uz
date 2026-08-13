import { Body, Controller, Delete, Get, Param, Patch, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminUpdateUserDto, ChangePasswordDto, SettingsDto, UpdateProfileDto, UserQueryDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get('me') me(@CurrentUser() user: AuthUser) { return this.service.me(user.id); }
  @Put('me') update(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) { return this.service.update(user.id, dto); }
  @Put('me/settings') settings(@CurrentUser() user: AuthUser, @Body() dto: SettingsDto) { return this.service.settings(user.id, dto); }
  @Put('me/password') password(@CurrentUser() user: AuthUser, @Body() dto: ChangePasswordDto) { return this.service.password(user.id, dto); }
}

@ApiTags('admin')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly service: UsersService) {}
  @Get() list(@Query() query: UserQueryDto) { return this.service.list(query); }
  @Get(':id') detail(@Param('id') id: string) { return this.service.detail(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto, @CurrentUser() user: AuthUser) { return this.service.adminUpdate(id, dto, user.id); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) { return this.service.remove(id, user.id); }
}
