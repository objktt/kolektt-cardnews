import { NhostClient } from '@nhost/nextjs';
import { PlanType } from '@/config/plans';

export interface Subscription {
  id: string;
  user_id: string;
  lemon_customer_id?: string;
  lemon_subscription_id?: string;
  plan: PlanType;
  status: 'active' | 'cancelled' | 'past_due' | 'paused';
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  month: string; // '2024-12'
  generations: number;
}

export class SubscriptionService {
  private nhost: NhostClient;

  constructor(nhost: NhostClient) {
    this.nhost = nhost;
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const { data, error } = await this.nhost.graphql.request(`
      query GetSubscription($userId: uuid!) {
        subscriptions(where: { user_id: { _eq: $userId } }, limit: 1) {
          id
          user_id
          lemon_customer_id
          lemon_subscription_id
          plan
          status
          current_period_end
          created_at
          updated_at
        }
      }
    `, { userId });

    if (error || !data?.subscriptions?.length) {
      return null;
    }

    return data.subscriptions[0];
  }

  async createOrUpdateSubscription(
    userId: string,
    data: Partial<Subscription>
  ): Promise<boolean> {
    const existing = await this.getSubscription(userId);

    if (existing) {
      // Update existing subscription
      const { error } = await this.nhost.graphql.request(`
        mutation UpdateSubscription($id: uuid!, $data: subscriptions_set_input!) {
          update_subscriptions_by_pk(pk_columns: { id: $id }, _set: $data) {
            id
          }
        }
      `, {
        id: existing.id,
        data: {
          ...data,
          updated_at: new Date().toISOString(),
        }
      });
      return !error;
    } else {
      // Create new subscription
      const { error } = await this.nhost.graphql.request(`
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
        }
      });
      return !error;
    }
  }

  async getCurrentUsage(userId: string): Promise<number> {
    const month = new Date().toISOString().slice(0, 7); // '2024-12'

    const { data, error } = await this.nhost.graphql.request(`
      query GetUsage($userId: uuid!, $month: String!) {
        usage(where: { user_id: { _eq: $userId }, month: { _eq: $month } }) {
          generations
        }
      }
    `, { userId, month });

    if (error || !data?.usage?.length) {
      return 0;
    }

    return data.usage[0].generations;
  }

  async incrementUsage(userId: string): Promise<boolean> {
    const month = new Date().toISOString().slice(0, 7);

    // Try to increment existing record
    const { data: existing } = await this.nhost.graphql.request(`
      query GetUsage($userId: uuid!, $month: String!) {
        usage(where: { user_id: { _eq: $userId }, month: { _eq: $month } }) {
          id
          generations
        }
      }
    `, { userId, month });

    if (existing?.usage?.length) {
      // Update existing
      const { error } = await this.nhost.graphql.request(`
        mutation IncrementUsage($id: uuid!, $generations: Int!) {
          update_usage_by_pk(pk_columns: { id: $id }, _set: { generations: $generations }) {
            id
          }
        }
      `, {
        id: existing.usage[0].id,
        generations: existing.usage[0].generations + 1,
      });
      return !error;
    } else {
      // Create new record
      const { error } = await this.nhost.graphql.request(`
        mutation CreateUsage($object: usage_insert_input!) {
          insert_usage_one(object: $object) {
            id
          }
        }
      `, {
        object: {
          user_id: userId,
          month,
          generations: 1,
        }
      });
      return !error;
    }
  }

  async getUserPlan(userId: string): Promise<PlanType> {
    const subscription = await this.getSubscription(userId);
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    return subscription.plan;
  }
}

// Lemon Squeezy checkout URL generator
export function getLemonSqueezyCheckoutUrl(variantId: string, userId: string, email: string): string {
  const storeId = process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID;
  const baseUrl = `https://${storeId}.lemonsqueezy.com/checkout/buy/${variantId}`;

  const params = new URLSearchParams({
    'checkout[custom][user_id]': userId,
    'checkout[email]': email,
    'checkout[success_url]': `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success`,
    'checkout[cancel_url]': `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  return `${baseUrl}?${params.toString()}`;
}
