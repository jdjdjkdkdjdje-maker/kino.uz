import { Module } from '@nestjs/common';
import { AppSettingsModule } from '../settings/settings.module';
import { AdminCatalogController, CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({ imports: [AppSettingsModule], controllers: [CatalogController, AdminCatalogController], providers: [CatalogService] })
export class CatalogModule {}
