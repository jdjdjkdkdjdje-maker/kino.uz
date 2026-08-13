import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto, CreateGenreDto, UpdateCategoryDto, UpdateGenreDto } from './catalog.dto';
@ApiTags('catalog')
@Controller()
export class CatalogController {
  constructor(private readonly service: CatalogService) {}
  @Get('categories') all() { return this.service.all(); }
  @Get('movie-categories') movieCategories() { return this.service.movieCategories(); }
  @Get('tv-categories') tvCategories() { return this.service.tvCategories(); }
  @Get('genres') genres() { return this.service.genres(); }
  @Get('home') home() { return this.service.home(); }
  @Get('home/personalized') @UseGuards(JwtAuthGuard) @ApiBearerAuth() personalized(@CurrentUser() user: AuthUser) { return this.service.personalized(user.id); }
  @Post('categories') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() create(@Body() dto: CreateCategoryDto) { return this.service.createCategory(dto); }
  @Put('categories/:id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) { return this.service.updateCategory(id, dto); }
  @Delete('categories/:id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() remove(@Param('id') id: string) { return this.service.deleteCategory(id); }
  @Post('genres') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() createGenre(@Body() dto: CreateGenreDto) { return this.service.createGenre(dto); }
  @Put('genres/:id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() updateGenre(@Param('id') id: string, @Body() dto: UpdateGenreDto) { return this.service.updateGenre(id, dto); }
  @Delete('genres/:id') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth() removeGenre(@Param('id') id: string) { return this.service.deleteGenre(id); }
}
@ApiTags('admin') @Controller('admin/catalog') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) @ApiBearerAuth()
export class AdminCatalogController { constructor(private readonly service: CatalogService) {} @Get() async all() { return { movieCategories: await this.service.movieCategories(true), tvCategories: await this.service.tvCategories(true), genres: await this.service.genres() }; } }
