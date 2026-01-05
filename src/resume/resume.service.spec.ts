import { Test, TestingModule } from '@nestjs/testing';
import { ResumeService } from './resume.service';
import { getQueueToken } from '@nestjs/bullmq';

// Mock Bull Queue
const mockQueue = {
  add: jest.fn(),
};

describe('ResumeService', () => {
  let service: ResumeService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResumeService,
        {
          provide: getQueueToken('cv-processing'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<ResumeService>(ResumeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('queueResumeForParsing', () => {
    it('should add a job to the queue', async () => {
      const userId = 'test-user-id';
      const fileUrl = 'https://example.com/resume.pdf';

      const result = await service.queueResumeForParsing(userId, fileUrl);

      expect(mockQueue.add).toHaveBeenCalledWith('parse-pdf', {
        userId,
        fileUrl,
      });
      expect(result).toHaveProperty('message');
    });
  });
});
