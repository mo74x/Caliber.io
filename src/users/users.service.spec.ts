/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { ResumeService } from '../resume/resume.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// Mock save function
const mockSave = jest.fn();

// Mock the User Model as a constructor function
function MockUserModel(data: any) {
  return {
    ...data,
    save: mockSave.mockResolvedValue({ ...data, _id: 'user_id' }),
  };
}

// Add static methods
MockUserModel.findOne = jest.fn();
MockUserModel.findById = jest.fn();
MockUserModel.findByIdAndUpdate = jest.fn();
MockUserModel.find = jest.fn();

// Mock ResumeService
const mockResumeService = {
  queueResumeForParsing: jest.fn(),
};

// Mock CloudinaryService
const mockCloudinaryService = {
  uploadFile: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: ResumeService,
          useValue: mockResumeService,
        },
        {
          provide: CloudinaryService,
          useValue: mockCloudinaryService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const dto = { email: 'new@user.com', password: '123', role: 'CANDIDATE' };

      // Mock findOne to return null (user doesn't exist yet)
      MockUserModel.findOne.mockResolvedValue(null);

      const result = await service.create(dto as any);

      expect(result).toBeDefined();
      expect(result.email).toEqual('new@user.com');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw error if email already exists', async () => {
      const dto = {
        email: 'existing@user.com',
        password: '123',
        role: 'CANDIDATE',
      };

      // Mock findOne to return an existing user
      MockUserModel.findOne.mockResolvedValue({ email: 'existing@user.com' });

      await expect(service.create(dto as any)).rejects.toThrow();
    });
  });
});
