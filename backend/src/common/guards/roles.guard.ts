import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

const resourceFor = (url: string) => {
  if (url.includes('/movies')) return 'movies';
  if (url.includes('/channels')) return 'channels';
  if (url.includes('/categories') || url.includes('/genres') || url.includes('/catalog')) return 'categories';
  if (url.includes('/programs')) return 'programs';
  if (url.includes('/users')) return 'users';
  if (url.includes('/imports')) return 'imports';
  if (url.includes('/uploads')) return 'uploads';
  if (url.includes('/notifications')) return 'notifications';
  if (url.includes('/settings')) return 'settings';
  return 'statistics';
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!required?.length) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id?: string; role?: Role } | undefined;
    if (!user?.id || !user.role || !required.includes(user.role)) throw new ForbiddenException("Bu amal uchun ruxsat yo‘q.");
    if (user.role !== Role.ADMIN) return true;

    const admin = await this.prisma.admin.findUnique({ where: { userId: user.id }, select: { permissions: true } });
    const permissions = Array.isArray(admin?.permissions) ? admin.permissions.filter((x): x is string => typeof x === 'string') : [];
    if (permissions.includes('*')) return true;

    const resource = resourceFor(request.originalUrl || request.url || '');
    const method = String(request.method || 'GET').toUpperCase();
    const action = method === 'GET' ? 'read' : method === 'DELETE' ? 'delete' : 'write';
    if (permissions.includes(`${resource}:${action}`) || (action === 'read' && permissions.includes(`${resource}:write`))) return true;
    throw new ForbiddenException("Admin rolingizda ushbu amal uchun ruxsat mavjud emas.");
  }
}
