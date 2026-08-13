import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; import { Type } from 'class-transformer'; import { IsBoolean, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator'; import { PaginationDto } from '../common/pagination.dto';
export class HistoryQueryDto extends PaginationDto {}
export class SaveHistoryDto { @ApiProperty() @IsUUID() movieId!:string; @ApiProperty() @Type(()=>Number) @IsInt() @Min(0) positionSeconds!:number; @ApiProperty() @Type(()=>Number) @IsInt() @Min(0) durationSeconds!:number; @ApiPropertyOptional() @IsOptional() @IsBoolean() completed?:boolean; }
