import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty({ example: 'Ali Valiyev' }) @IsString() @MinLength(2) @MaxLength(120) name!: string;
  @ApiPropertyOptional({ example: 'ali@example.uz' }) @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional({ example: '+998901234567' }) @IsOptional() @Matches(/^\+?[0-9]{9,15}$/) phone?: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(72) password!: string;
}
export class LoginDto {
  @ApiProperty({ example: 'ali@example.uz', description: 'Email yoki telefon' }) @IsString() @MinLength(3) identifier!: string;
  @ApiProperty() @IsString() @MinLength(8) @MaxLength(72) password!: string;
}
export class RefreshDto {
  @ApiProperty() @IsString() @MinLength(20) refreshToken!: string;
}
export class LogoutDto {
  @ApiPropertyOptional() @IsOptional() @IsString() refreshToken?: string;
}
