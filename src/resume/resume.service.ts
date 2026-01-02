import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ResumeService {
  constructor(@InjectQueue('cv-processing') private cvQueue: Queue) {}

  async queueResumeForParsing(userId: string, fileUrl: string) {
    // Add a job to the queue
    await this.cvQueue.add('parse-pdf', {
      userId,
      fileUrl,
    });

    return {
      message: 'Resume queued for processing. We will notify you when done!',
    };
  }
}
