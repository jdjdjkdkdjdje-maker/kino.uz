import { Module } from '@nestjs/common';
import { AdminSettingsController, PublicSettingsController } from './settings.controller';
import { AppSettingsService } from './settings.service';

@Module({ controllers: [PublicSettingsController, AdminSettingsController], providers: [AppSettingsService], exports: [AppSettingsService] })
export class AppSettingsModule {}
