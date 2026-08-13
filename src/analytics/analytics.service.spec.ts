/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog, AnalyticsAction } from './schemas/analytics.schema';

const VALID_RECRUITER_ID = '64f1a2b3c4d5e6f7a8b9c0d1';
const VALID_CANDIDATE_ID = '64f1a2b3c4d5e6f7a8b9c0d2';

const mockSave = jest.fn();

function MockAnalyticsModel(data: any) {
  return {
    ...data,
    _id: 'log_id',
    save: mockSave.mockResolvedValue({ ...data, _id: 'log_id' }),
  };
}

MockAnalyticsModel.countDocuments = jest.fn();

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: getModelToken(AnalyticsLog.name),
          useValue: MockAnalyticsModel,
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logEvent', () => {
    it('should save an analytics log with the given action', async () => {
      const result = await service.logEvent(
        VALID_RECRUITER_ID,
        VALID_CANDIDATE_ID,
        AnalyticsAction.VIEW,
      );

      expect(result).toHaveProperty('_id');
      expect(result.recruiter).toEqual(new Types.ObjectId(VALID_RECRUITER_ID));
      expect(result.candidate).toEqual(new Types.ObjectId(VALID_CANDIDATE_ID));
      expect(result.action).toEqual(AnalyticsAction.VIEW);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getRecruiterStats', () => {
    it('should return total views and unlocks for the recruiter', async () => {
      MockAnalyticsModel.countDocuments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(3);

      const result = await service.getRecruiterStats(VALID_RECRUITER_ID);

      expect(result).toEqual({ totalViews: 10, totalUnlocks: 3 });
      expect(MockAnalyticsModel.countDocuments).toHaveBeenCalledWith({
        recruiter: new Types.ObjectId(VALID_RECRUITER_ID),
        action: AnalyticsAction.VIEW,
      });
      expect(MockAnalyticsModel.countDocuments).toHaveBeenCalledWith({
        recruiter: new Types.ObjectId(VALID_RECRUITER_ID),
        action: AnalyticsAction.UNLOCK,
      });
    });

    it('should return zero stats when no events exist', async () => {
      MockAnalyticsModel.countDocuments
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await service.getRecruiterStats(VALID_RECRUITER_ID);

      expect(result).toEqual({ totalViews: 0, totalUnlocks: 0 });
    });
  });
});
