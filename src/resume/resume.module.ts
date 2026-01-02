import { Module } from '@nestjs/common';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { BullModule } from '@nestjs/bullmq';
import { ResumeProcessor } from './resume.processor';

@Module({
  imports: [
    // Register the specific queue for this module
    BullModule.registerQueue({
      name: 'cv-processing',
    }),
  ],
  providers: [ResumeService, ResumeProcessor],
  controllers: [ResumeController],
  exports: [ResumeService],
})
export class ResumeModule {}
