import { Body, Controller, Get, Put, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SendNotificationDto, UpdateAppSettingsDto } from './settings.dto';
import { AppSettingsService } from './settings.service';

@ApiTags('settings')
@Controller('app-settings')
export class PublicSettingsController {
  constructor(private readonly service: AppSettingsService) {}
  @Get() get() { return this.service.get(); }
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminSettingsController {
  constructor(private readonly service: AppSettingsService) {}
  @Get('settings') settings() { return this.service.get(); }
  @Put('settings') update(@Body() dto: UpdateAppSettingsDto, @CurrentUser() user: AuthUser) { return this.service.update(dto, user.id); }
  @Get('notifications') notifications() { return this.service.notifications(); }
  @Post('notifications') send(@Body() dto: SendNotificationDto, @CurrentUser() user: AuthUser) { return this.service.sendNotification(dto, user.id); }
}
