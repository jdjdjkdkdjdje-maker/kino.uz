import { Module } from '@nestjs/common'; import { AdminChannelsController, ChannelsController } from './channels.controller'; import { ChannelsService } from './channels.service';
@Module({ controllers: [ChannelsController, AdminChannelsController], providers: [ChannelsService], exports: [ChannelsService] }) export class ChannelsModule {}
