import { Test, TestingModule } from '@nestjs/testing';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';

// Mock ResumeService
const mockResumeService = {
  queueResumeForParsing: jest.fn(),
};

describe('ResumeController', () => {
  let controller: ResumeController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResumeController],
      providers: [
        {
          provide: ResumeService,
          useValue: mockResumeService,
        },
      ],
    }).compile();

    controller = module.get<ResumeController>(ResumeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('testParse', () => {
    it('should queue a resume for parsing', async () => {
      const body = {
        userId: 'test-user-id',
        url: 'https://example.com/resume.pdf',
      };
      mockResumeService.queueResumeForParsing.mockResolvedValue({
        message: 'Resume queued for processing. We will notify you when done!',
      });

      const result = await controller.testParse(body);

      expect(mockResumeService.queueResumeForParsing).toHaveBeenCalledWith(
        body.userId,
        body.url,
      );
      expect(result).toHaveProperty('message');
    });
  });
});
