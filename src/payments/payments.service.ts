/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    this.stripe = new Stripe(
      this.configService.getOrThrow('STRIPE_SECRET_KEY'),
      {
        apiVersion: '2025-12-15.clover', // Use latest version
      },
    );
  }

  // 1. Create a Checkout Link for 5 Credits ($50)
  async createCheckoutSession(userId: string) {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '5 Candidate Unlock Credits',
            },
            unit_amount: 100, // $1.00
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:3001/payments/success',
      cancel_url: 'http://localhost:3001/payments/cancel',
      metadata: {
        userId: userId,
        creditsAmount: '5',
      },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      // 1. Verify the signature (Security Check)
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      throw new BadRequestException('Webhook signature verification failed');
    }

    // 2. Handle the specific event type
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Extract the User ID we sent earlier in metadata
      const userId = session.metadata?.userId;
      const creditsAmount = Number(session.metadata?.creditsAmount) || 0;

      if (userId && creditsAmount) {
        console.log(
          `💰 Payment success! Adding ${creditsAmount} credits to user ${userId}`,
        );
        await this.usersService.addCredits(userId, creditsAmount);
      }
    }

    return { received: true };
  }
}
