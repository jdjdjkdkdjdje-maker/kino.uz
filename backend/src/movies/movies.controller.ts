import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateMovieDto, MovieQueryDto, UpdateMovieDto, ViewDto } from './movies.dto';
import { MoviesService } from './movies.service';
@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(private readonly service: MoviesService) {}
  @Get() findAll(@Query() query: MovieQueryDto) { return this.service.findAll(query); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() create(@Body() dto: CreateMovieDto) { return this.service.create(dto); }
  @Put(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() update(@Param('id') id: string, @Body() dto: UpdateMovieDto) { return this.service.update(id, dto); }
  @Delete(':id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() remove(@Param('id') id: string) { return this.service.remove(id); }
  @Post(':id/view') @UseGuards(JwtAuthGuard) @ApiBearerAuth() view(@Param('id') id: string, @CurrentUser() user: AuthUser, @Body() dto: ViewDto) { return this.service.recordView(id, user.id, dto.watchedSeconds, dto.sessionId); }
}
@ApiTags('admin')
@Controller('admin/movies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminMoviesController {
  constructor(private readonly service: MoviesService) {}
  @Get() findAll(@Query() query: MovieQueryDto) { return this.service.findAll(query, true); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id, false); }
}
