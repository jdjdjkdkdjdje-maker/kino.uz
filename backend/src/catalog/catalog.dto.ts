import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';
export enum CategoryKind { MOVIE = 'MOVIE', TV = 'TV' }
export class CreateCategoryDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) name!: string;
  @ApiProperty({ enum: CategoryKind }) @IsEnum(CategoryKind) type!: CategoryKind;
  @ApiPropertyOptional() @IsOptional() @IsString() icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0) order?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
export class CreateGenreDto { @ApiProperty() @IsString() @MinLength(1) @MaxLength(80) name!: string; }
export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
