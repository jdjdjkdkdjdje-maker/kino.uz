import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../generated/prisma/client';
import { IsBoolean, IsEmail, IsEnum, IsIn, IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../common/pagination.dto';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(120) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @Matches(/^\+?[0-9]{9,15}$/) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl({ require_tld: false }) avatarUrl?: string;
}
export class SettingsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() preferredQuality?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() darkMode?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() autoplay?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() notifications?: boolean;
}
export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(8) currentPassword!: string;
  @ApiProperty() @IsString() @MinLength(8) @MaxLength(72) newPassword!: string;
}
export class UserQueryDto extends PaginationDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
export class AdminUpdateUserDto {
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsEnum(Role) role?: Role;
  @ApiPropertyOptional({ enum: ['SUPER_ADMIN', 'ADMIN', 'MODERATOR'] })
  @IsOptional() @IsIn(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']) adminRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';
}
