import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PresignDto } from './uploads.dto';

@Injectable()
export class UploadsService {
  private readonly client: S3Client;
  constructor(private readonly config: ConfigService, private readonly prisma: PrismaService) {
    this.client = new S3Client({ region: config.get('S3_REGION','us-east-1'), endpoint: config.get('S3_ENDPOINT'), forcePathStyle: true, credentials: { accessKeyId: config.get('S3_ACCESS_KEY','kinotv_minio'), secretAccessKey: config.get('S3_SECRET_KEY','kinotv_minio_password') } });
  }
  private key(userId:string, fileName:string, folder:string){const ext=fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g,'')||'bin';return `${folder}/${new Date().toISOString().slice(0,7)}/${userId}-${randomUUID()}.${ext}`;}
  async presign(userId:string,dto:PresignDto){const key=this.key(userId,dto.fileName,dto.folder);const bucket=this.config.get('S3_BUCKET','kinotv');const uploadUrl=await getSignedUrl(this.client,new PutObjectCommand({Bucket:bucket,Key:key,ContentType:dto.contentType}),{expiresIn:300});return{uploadUrl,key,publicUrl:`${this.config.get('S3_PUBLIC_URL','http://localhost:9000/kinotv')}/${key}`,expiresIn:300};}
  async upload(userId:string,file:Express.Multer.File,folder:string){
    const key=this.key(userId,file.originalname,folder);
    const endpoint=this.config.get<string>('S3_ENDPOINT'),publicBase=this.config.get<string>('S3_PUBLIC_URL');
    if(endpoint&&publicBase){try{await this.client.send(new PutObjectCommand({Bucket:this.config.get('S3_BUCKET','kinotv'),Key:key,ContentType:file.mimetype,Body:file.buffer}));return{key,publicUrl:`${publicBase.replace(/\/$/,'')}/${key}`,storage:'S3'};}catch{console.warn('S3 mavjud emas: rasm PostgreSQL fallback omboriga saqlanadi.');}}
    const rows=await this.prisma.$queryRaw<Array<{id:string}>>`INSERT INTO "media_assets" ("key","contentType","size","data","createdBy") VALUES (${key},${file.mimetype},${file.size},${file.buffer},${userId}::uuid) RETURNING "id"`;
    const base=this.config.get<string>('PUBLIC_API_URL','http://localhost:4000/api/v1').replace(/\/$/,'');
    return{key,publicUrl:`${base}/media/${rows[0].id}`,storage:'POSTGRESQL_FALLBACK'};
  }
  async media(id:string){const rows=await this.prisma.$queryRaw<Array<{contentType:string;size:number;data:Buffer}>>`SELECT "contentType","size","data" FROM "media_assets" WHERE "id"=${id}::uuid`;if(!rows[0])throw new NotFoundException("Rasm topilmadi.");return rows[0];}
}
