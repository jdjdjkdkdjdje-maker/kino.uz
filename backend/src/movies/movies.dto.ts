import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus } from '../generated/prisma/client';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';
export class MovieQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() genre?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1888) @Max(2100) year?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional({ enum: ['newest','popular','rating','year'] }) @IsOptional() @IsString() sort?: string = 'newest';
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() featured?: boolean;
}
export class CreateMovieDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(250) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(250) originalTitle?: string;
  @ApiProperty() @IsString() @MinLength(10) description!: string;
  @ApiProperty() @IsUrl({ require_tld: false }) posterUrl!: string;
  @ApiProperty() @IsUrl({ require_tld: false }) bannerUrl!: string;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1888) @Max(2100) releaseYear!: number;
  @ApiProperty() @Type(() => Number) @IsInt() @Min(1) @Max(10000) durationMinutes!: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) @Max(10) rating!: number;
  @ApiProperty() @IsString() @MaxLength(80) language!: string;
  @ApiProperty() @IsString() @MaxLength(100) country!: string;
  @ApiPropertyOptional({ description: "Faqat tarqatish huquqi mavjud bo‘lgan to‘liq video URL" }) @IsOptional() @IsUrl({ require_tld: false }) videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_tld: false }) trailerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_tld: false }) subtitleUrl?: string;
  @ApiPropertyOptional({ description: "Admin video litsenziyasini tekshirganini tasdiqlaydi" }) @IsOptional() @IsBoolean() isLicensedVideo?: boolean;
  @ApiPropertyOptional({ example: 'IMDb' }) @IsOptional() @IsString() @MaxLength(40) metadataSource?: string;
  @ApiPropertyOptional({ example: 'tt0111161' }) @IsOptional() @IsString() @MaxLength(100) externalId?: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) categoryIds!: string[];
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) genreIds!: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(100) @IsString({ each: true }) actors?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @ArrayMaxSize(20) @IsString({ each: true }) directors?: string[];
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPopular?: boolean;
}
export class UpdateMovieDto extends PartialType(CreateMovieDto) {}
export class ViewDto { @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) watchedSeconds?: number; @ApiPropertyOptional() @IsOptional() @IsString() sessionId?: string; }
