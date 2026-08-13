import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

const mockAnalyticsService = {
  getRecruiterStats: jest.fn(),
};

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return the recruiter dashboard stats', () => {
      const req = { user: { id: 'user_1' } };
      mockAnalyticsService.getRecruiterStats.mockReturnValue({
        totalViews: 10,
        totalUnlocks: 3,
      });

      const result = controller.getStats(req);

      expect(mockAnalyticsService.getRecruiterStats).toHaveBeenCalledWith(
        'user_1',
      );
      expect(result).toEqual({ totalViews: 10, totalUnlocks: 3 });
    });
  });
});
