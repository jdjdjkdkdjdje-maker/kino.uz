import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'; import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
export class ProgramQueryDto { @ApiPropertyOptional() @IsOptional() @IsDateString() from?:string; @ApiPropertyOptional() @IsOptional() @IsDateString() to?:string; }
export class CreateProgramDto { @ApiProperty() @IsUUID() channelId!:string; @ApiProperty() @IsString() @MinLength(1) @MaxLength(250) title!:string; @ApiPropertyOptional() @IsOptional() @IsString() description?:string; @ApiProperty() @IsDateString() startsAt!:string; @ApiProperty() @IsDateString() endsAt!:string; }
export class UpdateProgramDto extends PartialType(CreateProgramDto) {}
