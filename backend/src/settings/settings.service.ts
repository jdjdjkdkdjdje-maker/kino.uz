import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SendNotificationDto, UpdateAppSettingsDto } from './settings.dto';

const defaults = {
  appName: 'KinoTV', logoUrl: '', homeBanners: [] as string[], contactEmail: '', contactPhone: '',
  about: 'KinoTV — kino va qonuniy jonli telekanallar platformasi.', maintenanceMode: false, notificationsEnabled: true,
};

@Injectable()
export class AppSettingsService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService, private readonly cache: RedisService) {}

  async get() {
    const rows = await this.prisma.$queryRaw<Array<{ data: Record<string, unknown>; updatedAt: Date }>>`SELECT "data", "updatedAt" FROM "app_settings" WHERE "id"='main'`;
    return { ...defaults, ...(rows[0]?.data || {}), updatedAt: rows[0]?.updatedAt };
  }

  async update(dto: UpdateAppSettingsDto, userId: string) {
    const current = await this.get();
    const { updatedAt: _updatedAt, ...data } = { ...current, ...dto };
    await this.prisma.$executeRaw`INSERT INTO "app_settings" ("id","data","updatedBy","updatedAt") VALUES ('main', ${JSON.stringify(data)}::jsonb, ${userId}::uuid, NOW()) ON CONFLICT ("id") DO UPDATE SET "data"=EXCLUDED."data", "updatedBy"=EXCLUDED."updatedBy", "updatedAt"=NOW()`;
    await this.cache.deleteByPrefix('home:');
    return this.get();
  }

  async notifications() {
    return this.prisma.$queryRaw<Array<Record<string, unknown>>>`SELECT * FROM "notification_logs" ORDER BY "createdAt" DESC LIMIT 100`;
  }

  async sendNotification(dto: SendNotificationDto, userId: string) {
    const serverKey = this.config.get<string>('FCM_SERVER_KEY');
    let status = 'QUEUED', providerMessageId: string | null = null, error: string | null = null;
    if (serverKey) {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `key=${serverKey}` },
          body: JSON.stringify({ to: `/topics/${dto.topic || 'all'}`, notification: { title: dto.title, body: dto.body }, data: { kind: dto.kind || 'GENERAL' } }),
        });
        const result = await response.json() as { message_id?: string; message?: string };
        if (!response.ok) throw new Error(result.message || `FCM ${response.status}`);
        status = 'SENT'; providerMessageId = result.message_id || null;
      } catch (cause) { status = 'FAILED'; error = cause instanceof Error ? cause.message : 'FCM xatosi'; }
    }
    const rows = await this.prisma.$queryRaw<Array<Record<string, unknown>>>`INSERT INTO "notification_logs" ("title","body","topic","kind","status","providerMessageId","error","createdBy") VALUES (${dto.title},${dto.body},${dto.topic || 'all'},${dto.kind || 'GENERAL'},${status},${providerMessageId},${error},${userId}::uuid) RETURNING *`;
    return { ...rows[0], configured: Boolean(serverKey), message: serverKey ? (status === 'SENT' ? "Bildirishnoma yuborildi." : "Bildirishnomani yuborishda xatolik yuz berdi.") : "FCM kaliti kiritilmagan; bildirishnoma navbat jurnaliga saqlandi." };
  }
}
