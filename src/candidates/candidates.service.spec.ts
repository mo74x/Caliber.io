/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { getModelToken } from '@nestjs/mongoose';
import { Candidate } from './schemas/candidate.schema';
import { MailService } from '../mail/mail.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { User } from '../users/schemas/user.schema';

// Mock the Candidate Model as a class (for 'new this.candidateModel()')
const mockSave = jest.fn();

function MockCandidateModel(data: any) {
  return {
    ...data,
    _id: 'some_id',
    save: mockSave.mockResolvedValue({ ...data, _id: 'some_id' }),
  };
}

MockCandidateModel.findOne = jest.fn();
MockCandidateModel.findById = jest.fn();
MockCandidateModel.find = jest.fn();

const mockMailService = {
  sendUnlockNotification: jest.fn(),
};

const mockAnalyticsService = {
  logEvent: jest.fn(),
};

const mockUserModel = {};

describe('CandidatesService', () => {
  let service: CandidatesService;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getModelToken(Candidate.name),
          useValue: MockCandidateModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new candidate', async () => {
      const dto = {
        jobTitle: 'NestJS Developer',
        skills: ['Node', 'Mongo'],
        experienceYears: 5,
        minSalary: 5000,
        noticePeriod: 'Immediate',
      };
      const userId = 'user_123';

      // Mock findOne to return null (user has no profile yet)
      MockCandidateModel.findOne.mockResolvedValue(null);

      const result = await service.create(dto as any, userId);

      expect(result).toHaveProperty('_id');
      expect(result.jobTitle).toEqual('NestJS Developer');
      expect(mockSave).toHaveBeenCalled();
    });
  });
});
