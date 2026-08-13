import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { UsersService } from '../users/users.service';

interface StripeMock {
  checkout: { sessions: { create: jest.Mock } };
  webhooks: { constructEvent: jest.Mock };
}

const mockConfigService = {
  getOrThrow: jest.fn().mockReturnValue('sk_test_xxx'),
  get: jest.fn().mockReturnValue('whsec_test'),
};

const mockUsersService = {
  addCredits: jest.fn(),
};

describe('PaymentsService', () => {
  let service: PaymentsService;

  const setStripeMock = (stripe: StripeMock) => {
    (service as unknown as { stripe: StripeMock }).stripe = stripe;
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCheckoutSession', () => {
    it('should create a checkout session and return its url', async () => {
      const session = { url: 'https://checkout.stripe.com/abc' };
      const create = jest.fn().mockResolvedValue(session);
      setStripeMock({
        checkout: { sessions: { create } },
        webhooks: { constructEvent: jest.fn() },
      });

      const result = await service.createCheckoutSession('user_1');

      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'payment' }),
      );
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { userId: 'user_1', creditsAmount: '5' },
        }),
      );
      expect(result).toEqual({ url: 'https://checkout.stripe.com/abc' });
    });
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException when signature verification fails', async () => {
      const constructEvent = jest.fn().mockImplementation(() => {
        throw new Error('bad signature');
      });
      setStripeMock({
        checkout: { sessions: { create: jest.fn() } },
        webhooks: { constructEvent },
      });

      await expect(
        service.handleWebhook('invalid-sig', Buffer.from('{}')),
      ).rejects.toThrow(BadRequestException);
      expect(mockUsersService.addCredits).not.toHaveBeenCalled();
    });

    it('should add credits when checkout.session.completed event is received', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: { userId: 'user_1', creditsAmount: '5' },
          },
        },
      };
      const constructEvent = jest.fn().mockReturnValue(event);
      setStripeMock({
        checkout: { sessions: { create: jest.fn() } },
        webhooks: { constructEvent },
      });

      const result = await service.handleWebhook(
        'valid-sig',
        Buffer.from('{"type":"checkout.session.completed"}'),
      );

      expect(mockUsersService.addCredits).toHaveBeenCalledWith('user_1', 5);
      expect(result).toEqual({ received: true });
    });

    it('should not add credits when metadata is missing', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: { object: { metadata: {} } },
      };
      const constructEvent = jest.fn().mockReturnValue(event);
      setStripeMock({
        checkout: { sessions: { create: jest.fn() } },
        webhooks: { constructEvent },
      });

      const result = await service.handleWebhook(
        'valid-sig',
        Buffer.from('{}'),
      );

      expect(mockUsersService.addCredits).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });

    it('should ignore unrelated event types', async () => {
      const event = {
        type: 'payment_intent.succeeded',
        data: {
          object: { metadata: { userId: 'user_1', creditsAmount: '5' } },
        },
      };
      const constructEvent = jest.fn().mockReturnValue(event);
      setStripeMock({
        checkout: { sessions: { create: jest.fn() } },
        webhooks: { constructEvent },
      });

      const result = await service.handleWebhook(
        'valid-sig',
        Buffer.from('{}'),
      );

      expect(mockUsersService.addCredits).not.toHaveBeenCalled();
      expect(result).toEqual({ received: true });
    });
  });
});
