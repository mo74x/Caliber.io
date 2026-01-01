import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnalyticsLog, AnalyticsAction } from './schemas/analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(AnalyticsLog.name) private analyticsModel: Model<AnalyticsLog>,
  ) {}

  // 1. Log an Event (Fire and Forget)
  async logEvent(
    recruiterId: string,
    candidateId: string,
    action: AnalyticsAction,
  ) {
    const log = new this.analyticsModel({
      recruiter: new Types.ObjectId(recruiterId),
      candidate: new Types.ObjectId(candidateId),
      action,
    });
    return log.save();
  }

  // 2. Get Stats for a Recruiter
  async getRecruiterStats(recruiterId: string) {
    const id = new Types.ObjectId(recruiterId);

    // Run parallel queries for speed
    const [totalViews, totalUnlocks] = await Promise.all([
      this.analyticsModel.countDocuments({
        recruiter: id,
        action: AnalyticsAction.VIEW,
      }),
      this.analyticsModel.countDocuments({
        recruiter: id,
        action: AnalyticsAction.UNLOCK,
      }),
    ]);

    return { totalViews, totalUnlocks };
  }
}
