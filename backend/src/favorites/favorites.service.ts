import { Injectable, NotFoundException } from '@nestjs/common'; import { PrismaService } from '../prisma/prisma.service';
@Injectable() export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}
  async all(userId: string) { const [movieRows, channelRows] = await Promise.all([
    this.prisma.movieFavorite.findMany({ where:{userId}, include:{movie:{include:{genres:true,categories:true}}}, orderBy:{createdAt:'desc'} }),
    this.prisma.channelFavorite.findMany({ where:{userId}, include:{channel:{include:{categories:true}}}, orderBy:{createdAt:'desc'} }),
  ]); return { movies: movieRows.map((x)=>({...x.movie,videoUrl:null,subtitleUrl:null,hasFullVideo:Boolean(x.movie.isLicensedVideo&&x.movie.videoUrl),favoritedAt:x.createdAt})), channels: channelRows.map((x)=>{const {streamUrl:_s,epgUrl:_e,...channel}=x.channel; return {...channel,favoritedAt:x.createdAt};}) }; }
  async addMovie(userId:string,movieId:string) { if(!await this.prisma.movie.findUnique({where:{id:movieId}})) throw new NotFoundException("Kino topilmadi."); await this.prisma.movieFavorite.upsert({where:{userId_movieId:{userId,movieId}},create:{userId,movieId},update:{}}); return {message:"Kino sevimlilarga qo‘shildi."}; }
  async removeMovie(userId:string,movieId:string) { await this.prisma.movieFavorite.deleteMany({where:{userId,movieId}}); return {message:"Kino sevimlilardan olib tashlandi."}; }
  async addChannel(userId:string,channelId:string) { if(!await this.prisma.tVChannel.findUnique({where:{id:channelId}})) throw new NotFoundException("Telekanal topilmadi."); await this.prisma.channelFavorite.upsert({where:{userId_channelId:{userId,channelId}},create:{userId,channelId},update:{}}); return {message:"Telekanal sevimlilarga qo‘shildi."}; }
  async removeChannel(userId:string,channelId:string) { await this.prisma.channelFavorite.deleteMany({where:{userId,channelId}}); return {message:"Telekanal sevimlilardan olib tashlandi."}; }
}
