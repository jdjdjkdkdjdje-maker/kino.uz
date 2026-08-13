import { Controller, Get, Query } from '@nestjs/common'; import { ApiTags } from '@nestjs/swagger'; import { SearchDto } from './search.dto'; import { SearchService } from './search.service';
@ApiTags('search') @Controller('search') export class SearchController { constructor(private readonly service: SearchService) {} @Get() search(@Query() dto: SearchDto) { return this.service.search(dto); } }
