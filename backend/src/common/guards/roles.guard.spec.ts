import { ForbiddenException } from '@nestjs/common';
import { Role } from '../../generated/prisma/client';
import { RolesGuard } from './roles.guard';

const context = (method:string,url:string) => ({
  getHandler:()=>({}), getClass:()=>({}), switchToHttp:()=>({getRequest:()=>({method,originalUrl:url,user:{id:'admin-id',role:Role.ADMIN}})}),
}) as any;

describe('RolesGuard admin permissions',()=>{
  const reflector={getAllAndOverride:()=>[Role.ADMIN]} as any;
  it('moderatorga kino tahrirlashga ruxsat beradi',async()=>{const prisma={admin:{findUnique:jest.fn().mockResolvedValue({permissions:['movies:write']})}} as any;await expect(new RolesGuard(reflector,prisma).canActivate(context('PUT','/api/v1/admin/movies/id'))).resolves.toBe(true)});
  it('moderatorga kino o‘chirishni taqiqlaydi',async()=>{const prisma={admin:{findUnique:jest.fn().mockResolvedValue({permissions:['movies:write']})}} as any;await expect(new RolesGuard(reflector,prisma).canActivate(context('DELETE','/api/v1/admin/movies/id'))).rejects.toBeInstanceOf(ForbiddenException)});
  it('super admin barcha amallarni bajara oladi',async()=>{const prisma={admin:{findUnique:jest.fn().mockResolvedValue({permissions:['*']})}} as any;await expect(new RolesGuard(reflector,prisma).canActivate(context('DELETE','/api/v1/admin/users/id'))).resolves.toBe(true)});
});
