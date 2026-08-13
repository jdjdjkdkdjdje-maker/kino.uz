import { Module } from '@nestjs/common';
import { MediaController, UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
@Module({controllers:[UploadsController,MediaController],providers:[UploadsService]})
export class UploadsModule{}
