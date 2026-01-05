/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';

// Mock Dependencies
const mockUsersService = {
  findOneByEmail: jest.fn(),
  create: jest.fn(),
  findOneByResetToken: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(() => 'test_token'),
};

const mockMailService = {
  sendWelcomeEmail: jest.fn(),
  sendResetPasswordEmail: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return an access token and user info', () => {
      const result = service.login({
        email: 'test@test.com',
        _id: '123',
        role: 'RECRUITER',
      } as any);

      expect(result).toHaveProperty('access_token', 'test_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toEqual('test@test.com');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return null if user not found', async () => {
      mockUsersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.validateUser('test@test.com', 'password');
      expect(result).toBeNull();
    });
  });
});
