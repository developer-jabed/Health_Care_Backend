import { PaymentStatus } from '@prisma/client';
import Stripe from 'stripe';
import { prisma } from '../../shared/prisma';

const handleStripeWebhookEvent = async (event: Stripe.Event) => {
  console.log(`💡 Webhook received: ${event.type}`);

  // Check idempotency
  const existingPayment = await prisma.payment.findFirst({
    where: { stripeEventId: event.id }
  });

  if (existingPayment) {
    console.log(`⚠️ Event ${event.id} already processed. Skipping.`);
    return { message: "Event already processed" };
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        console.log("💡 Session metadata:", session.metadata);
        console.log("💡 Payment status:", session.payment_status);

        const appointmentId = session.metadata?.appointmentId;
        const paymentId = session.metadata?.paymentId;

        if (!appointmentId || !paymentId) {
          console.error("⚠️ Missing metadata in webhook event");
          return { message: "Missing metadata" };
        }

        const appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId }
        });

        if (!appointment) {
          console.error(`⚠️ Appointment ${appointmentId} not found.`);
          return { message: "Appointment not found" };
        }

        await prisma.$transaction(async (tx) => {
          const status =
            session.payment_status === "paid"
              ? PaymentStatus.PAID
              : PaymentStatus.UNPAID;

          await tx.appointment.update({
            where: { id: appointmentId },
            data: { paymentStatus: status }
          });

          await tx.payment.update({
            where: { id: paymentId },
            data: {
              status,
              paymentGatewayData: session,
              stripeEventId: event.id
            }
          });
        });

        console.log(`✅ Appointment ${appointmentId} and payment ${paymentId} updated to ${session.payment_status}`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as any;
        console.log(`⚠️ Checkout session expired: ${session.id}`);
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as any;
        console.log(`💳 PaymentIntent succeeded: ${paymentIntent.id}`);
        // Optionally handle PaymentIntent-based payments here
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as any;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return { message: "Webhook processed successfully" };
  } catch (error: any) {
    console.error("❌ Error in webhook processing:", error);
    return { message: "Webhook processing failed", error: error.message };
  }
};

export const PaymentService = { handleStripeWebhookEvent };
