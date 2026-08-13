import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { ContentStatus, StreamType } from '../generated/prisma/client';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUrl, Max, MaxLength, Min, MinLength } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';
export class ChannelQueryDto extends PaginationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) q?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() country?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Boolean) @IsBoolean() popular?: boolean;
}
export class CreateChannelDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(180) name!: string;
  @ApiProperty() @IsUrl({ require_tld: false }) logoUrl!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_tld: false }) bannerUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() @MaxLength(100) country!: string;
  @ApiProperty() @IsString() @MaxLength(80) language!: string;
  @ApiProperty() @IsUrl({ require_tld: false }) streamUrl!: string;
  @ApiPropertyOptional({ enum: StreamType }) @IsOptional() @IsEnum(StreamType) streamType?: StreamType;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_tld: false }) epgUrl?: string;
  @ApiProperty({ type: [String] }) @IsArray() @ArrayMaxSize(30) @IsString({ each: true }) categoryIds!: string[];
  @ApiPropertyOptional({ enum: ContentStatus }) @IsOptional() @IsEnum(ContentStatus) status?: ContentStatus;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(1000000) order?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPopular?: boolean;
}
export class UpdateChannelDto extends PartialType(CreateChannelDto) {}
export class ChannelViewDto { @IsOptional() @Type(() => Number) @IsInt() @Min(0) watchedSeconds?: number; @IsOptional() @IsString() sessionId?: string; }
