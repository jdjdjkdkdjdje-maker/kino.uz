import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChannelQueryDto, ChannelViewDto, CreateChannelDto, UpdateChannelDto } from './channels.dto';
import { ChannelsService } from './channels.service';
@ApiTags('channels') @Controller('channels')
export class ChannelsController {
  constructor(private readonly service: ChannelsService) {}
  @Get() all(@Query() query: ChannelQueryDto) { return this.service.findAll(query); }
  @Get(':id') one(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() create(@Body() dto: CreateChannelDto) { return this.service.create(dto); }
  @Put(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() update(@Param('id') id: string, @Body() dto: UpdateChannelDto) { return this.service.update(id, dto); }
  @Delete(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/view') @UseGuards(JwtAuthGuard) @ApiBearerAuth() view(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ChannelViewDto) { return this.service.recordView(id, user.id, dto.watchedSeconds, dto.sessionId); }
}
@ApiTags('admin') @Controller('admin/channels') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth()
export class AdminChannelsController {
  constructor(private readonly service: ChannelsService) {}
  @Get() all(@Query() query: ChannelQueryDto) { return this.service.findAll(query, true); }
  @Post() create(@Body() dto: CreateChannelDto) { return this.service.create(dto); }
  @Get(':id') one(@Param('id') id: string) { return this.service.findOne(id, false); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: UpdateChannelDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }
}
