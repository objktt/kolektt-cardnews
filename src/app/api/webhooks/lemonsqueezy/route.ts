import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { nhostServer } from '@/utils/nhost-server';
import { getPlanByPriceId } from '@/config/plans';

// Verify Lemon Squeezy webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('x-signature') || '';

    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production') {
      if (!verifySignature(payload, signature)) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(payload);
    const eventName = event.meta.event_name;
    const data = event.data;

    console.log('Lemon Squeezy webhook:', eventName, data.id);

    switch (eventName) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionCreatedOrUpdated(data, event.meta.custom_data);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(data, event.meta.custom_data);
        break;

      case 'subscription_resumed':
        await handleSubscriptionResumed(data, event.meta.custom_data);
        break;

      case 'subscription_expired':
        await handleSubscriptionExpired(data, event.meta.custom_data);
        break;

      case 'subscription_payment_success':
        await handlePaymentSuccess(data, event.meta.custom_data);
        break;

      case 'subscription_payment_failed':
        await handlePaymentFailed(data, event.meta.custom_data);
        break;

      default:
        console.log('Unhandled event:', eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionCreatedOrUpdated(
  data: any,
  customData: { user_id?: string }
) {
  const userId = customData?.user_id;
  if (!userId) {
    console.error('No user_id in custom data');
    return;
  }

  const variantId = data.attributes.variant_id?.toString();
  const plan = getPlanByPriceId(variantId) || 'pro';

  const subscriptionData = {
    lemon_customer_id: data.attributes.customer_id?.toString(),
    lemon_subscription_id: data.id?.toString(),
    plan,
    status: mapStatus(data.attributes.status),
    current_period_end: data.attributes.renews_at,
  };

  await upsertSubscription(userId, subscriptionData);
}

async function handleSubscriptionCancelled(data: any, customData: { user_id?: string }) {
  const userId = customData?.user_id;
  if (!userId) return;

  await upsertSubscription(userId, {
    status: 'cancelled',
    current_period_end: data.attributes.ends_at,
  });
}

async function handleSubscriptionResumed(data: any, customData: { user_id?: string }) {
  const userId = customData?.user_id;
  if (!userId) return;

  await upsertSubscription(userId, {
    status: 'active',
    current_period_end: data.attributes.renews_at,
  });
}

async function handleSubscriptionExpired(data: any, customData: { user_id?: string }) {
  const userId = customData?.user_id;
  if (!userId) return;

  await upsertSubscription(userId, {
    plan: 'free',
    status: 'active',
    lemon_subscription_id: null,
  });
}

async function handlePaymentSuccess(data: any, customData: { user_id?: string }) {
  // Payment successful - subscription continues
  console.log('Payment successful for subscription:', data.attributes.subscription_id);
}

async function handlePaymentFailed(data: any, customData: { user_id?: string }) {
  const userId = customData?.user_id;
  if (!userId) return;

  await upsertSubscription(userId, {
    status: 'past_due',
  });
}

function mapStatus(lemonStatus: string): 'active' | 'cancelled' | 'past_due' | 'paused' {
  switch (lemonStatus) {
    case 'active':
    case 'on_trial':
      return 'active';
    case 'cancelled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    case 'paused':
      return 'paused';
    default:
      return 'active';
  }
}

async function upsertSubscription(userId: string, data: any) {
  // Check if subscription exists
  const { data: existing } = await nhostServer.graphql.request<{ subscriptions: { id: string }[] }>(`
    query GetSubscription($userId: uuid!) {
      subscriptions(where: { user_id: { _eq: $userId } }, limit: 1) {
        id
      }
    }
  `, { userId });

  if (existing?.subscriptions?.length) {
    // Update
    await nhostServer.graphql.request(`
      mutation UpdateSubscription($id: uuid!, $data: subscriptions_set_input!) {
        update_subscriptions_by_pk(pk_columns: { id: $id }, _set: $data) {
          id
        }
      }
    `, {
      id: existing.subscriptions[0].id,
      data: { ...data, updated_at: new Date().toISOString() },
    });
  } else {
    // Insert
    await nhostServer.graphql.request(`
      mutation CreateSubscription($object: subscriptions_insert_input!) {
        insert_subscriptions_one(object: $object) {
          id
        }
      }
    `, {
      object: {
        user_id: userId,
        plan: 'free',
        status: 'active',
        ...data,
      },
    });
  }
}
