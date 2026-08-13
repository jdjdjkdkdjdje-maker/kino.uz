import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  constructor(config: ConfigService) {
    const pool = new Pool({ connectionString: config.get<string>('DATABASE_URL') || 'postgresql://kinotv:kinotv_dev_password@localhost:5432/kinotv?schema=public', max: 20 });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }
  async onModuleInit() { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); await this.pool.end(); }
}
