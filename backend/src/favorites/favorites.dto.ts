import { ApiProperty } from '@nestjs/swagger'; import { IsUUID } from 'class-validator';
export class MovieFavoriteDto { @ApiProperty() @IsUUID() movieId!: string; }
export class ChannelFavoriteDto { @ApiProperty() @IsUUID() channelId!: string; }
