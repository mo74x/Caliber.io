import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsLog, AnalyticsLogSchema } from './schemas/analytics.schema';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
    ]),
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
