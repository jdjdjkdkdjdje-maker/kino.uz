import { BadRequestException, Body, Controller, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PresignDto } from './uploads.dto';
import { UploadsService } from './uploads.service';

@ApiTags('uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly service: UploadsService) {}
  @Post('presign') presign(@CurrentUser() user: AuthUser, @Body() dto: PresignDto) { return this.service.presign(user.id,dto); }
  @Post('image') @ApiConsumes('multipart/form-data') @UseInterceptors(FileInterceptor('file',{limits:{fileSize:8*1024*1024}}))
  upload(@CurrentUser() user:AuthUser,@UploadedFile() file:Express.Multer.File,@Body('folder') folder:string){if(!file||!['image/jpeg','image/png','image/webp'].includes(file.mimetype))throw new BadRequestException("JPG, PNG yoki WebP rasm yuboring.");if(!['posters','banners','logos','avatars'].includes(folder))throw new BadRequestException("Rasm papkasi noto‘g‘ri.");return this.service.upload(user.id,file,folder);}
}

@ApiTags('media')
@Controller('media')
export class MediaController {
  constructor(private readonly service:UploadsService){}
  @Get(':id') async get(@Param('id')id:string,@Res()res:Response){const asset=await this.service.media(id);res.setHeader('Content-Type',asset.contentType);res.setHeader('Content-Length',asset.size);res.setHeader('Cache-Control','public, max-age=31536000, immutable');res.send(asset.data);}
}
