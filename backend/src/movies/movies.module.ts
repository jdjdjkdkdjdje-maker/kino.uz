import { Module } from '@nestjs/common';
import { AdminMoviesController, MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
@Module({ controllers: [MoviesController, AdminMoviesController], providers: [MoviesService], exports: [MoviesService] })
export class MoviesModule {}
