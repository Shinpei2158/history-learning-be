import { Module } from '@nestjs/common';
import { HistoricalFigureService } from './historical-figure.service';
import { HistoricalFigureController } from './historical-figure.controller';
import { HistoricalFigure, HistoricalFigureSchema } from './schemas/historical-figure.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: HistoricalFigure.name, schema: HistoricalFigureSchema }]),],
  controllers: [HistoricalFigureController],
  providers: [HistoricalFigureService],
})
export class HistoricalFigureModule { }
