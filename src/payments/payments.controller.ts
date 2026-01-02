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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @UseGuards(AuthGuard('jwt'))
  @Post('create-checkout-session')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session for purchasing credits' })
  @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createSession(@Request() req) {
    return this.paymentsService.createCheckoutSession(req.user.id);
  }

  @Get('success')
  @ApiOperation({ summary: 'Payment success callback page' })
  @ApiResponse({ status: 200, description: 'Payment was successful' })
  paymentSuccess() {
    return {
      message:
        '✅ Payment successful! Credits have been added to your account.',
    };
  }

  @Get('cancel')
  @ApiOperation({ summary: 'Payment cancelled callback page' })
  @ApiResponse({ status: 200, description: 'Payment was cancelled' })
  paymentCancelled() {
    return { message: '❌ Payment was cancelled.' };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler for payment events' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for verification',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid signature or missing header' })
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

