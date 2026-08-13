import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsIn, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class UpdateAppSettingsDto {
  @IsOptional() @IsString() @MinLength(2) @MaxLength(80) appName?: string;
  @IsOptional() @IsUrl({ require_tld: false }) logoUrl?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(10) @IsUrl({ require_tld: false }, { each: true }) homeBanners?: string[];
  @IsOptional() @IsString() @MaxLength(190) contactEmail?: string;
  @IsOptional() @IsString() @MaxLength(40) contactPhone?: string;
  @IsOptional() @IsString() @MaxLength(5000) about?: string;
  @IsOptional() @IsBoolean() maintenanceMode?: boolean;
  @IsOptional() @IsBoolean() notificationsEnabled?: boolean;
}

export class SendNotificationDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(160) title!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(1000) body!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) topic?: string = 'all';
  @ApiPropertyOptional({ enum: ['GENERAL','NEW_MOVIE','NEW_CHANNEL'] }) @IsOptional() @IsIn(['GENERAL','NEW_MOVIE','NEW_CHANNEL']) kind?: string = 'GENERAL';
}
