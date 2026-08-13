/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

const mockPaymentsService = {
  createCheckoutSession: jest.fn(),
  handleWebhook: jest.fn(),
};

describe('PaymentsController', () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [{ provide: PaymentsService, useValue: mockPaymentsService }],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createSession', () => {
    it('should create a checkout session for the requesting user', () => {
      const req = { user: { id: 'user_1' } };
      mockPaymentsService.createCheckoutSession.mockReturnValue({
        url: 'https://checkout.stripe.com/abc',
      });

      const result = controller.createSession(req);

      expect(mockPaymentsService.createCheckoutSession).toHaveBeenCalledWith(
        'user_1',
      );
      expect(result).toEqual({ url: 'https://checkout.stripe.com/abc' });
    });
  });

  describe('paymentSuccess / paymentCancelled', () => {
    it('should return a success message', () => {
      expect(controller.paymentSuccess()).toHaveProperty('message');
    });

    it('should return a cancellation message', () => {
      expect(controller.paymentCancelled()).toHaveProperty('message');
    });
  });

  describe('handleWebhook', () => {
    it('should throw BadRequestException when stripe-signature is missing', async () => {
      await expect(
        controller.handleWebhook(undefined as any, Buffer.from('{}')),
      ).rejects.toThrow(BadRequestException);
      expect(mockPaymentsService.handleWebhook).not.toHaveBeenCalled();
    });

    it('should forward signature and raw body to the service', async () => {
      const signature = 'whsec_sig';
      const rawBody = Buffer.from('{"type":"checkout.session.completed"}');
      mockPaymentsService.handleWebhook.mockResolvedValue({ received: true });

      const result = await controller.handleWebhook(signature, { rawBody });

      expect(mockPaymentsService.handleWebhook).toHaveBeenCalledWith(
        signature,
        rawBody,
      );
      expect(result).toEqual({ received: true });
    });
  });
});
