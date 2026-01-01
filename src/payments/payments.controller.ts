/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  BadRequestException,
  Headers,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('create-checkout-session')
  createSession(@Request() req) {
    return this.paymentsService.createCheckoutSession(req.user.id);
  }

  @Get('success')
  paymentSuccess() {
    return {
      message:
        '✅ Payment successful! Credits have been added to your account.',
    };
  }

  @Get('cancel')
  paymentCancelled() {
    return { message: '❌ Payment was cancelled.' };
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() req,
  ) {
    if (!signature)
      throw new BadRequestException('Missing stripe-signature header');

    // req.rawBody is available because we set { rawBody: true } in main.ts
    return this.paymentsService.handleWebhook(signature, req.rawBody);
  }
}
