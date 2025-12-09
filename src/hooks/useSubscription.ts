'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUserData, useNhostClient } from '@nhost/nextjs';
import { SubscriptionService } from '@/services/subscription';
import { PLANS, PlanType, hasGenerationsRemaining } from '@/config/plans';

export function useSubscription() {
  const user = useUserData();
  const nhost = useNhostClient();

  const [plan, setPlan] = useState<PlanType>('free');
  const [usage, setUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const service = new SubscriptionService(nhost);
      const [userPlan, currentUsage] = await Promise.all([
        service.getUserPlan(user.id),
        service.getCurrentUsage(user.id),
      ]);

      setPlan(userPlan);
      setUsage(currentUsage);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, nhost]);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const canGenerate = hasGenerationsRemaining(plan, usage);
  const remainingGenerations = PLANS[plan].limits.generationsPerMonth === Infinity
    ? Infinity
    : Math.max(0, PLANS[plan].limits.generationsPerMonth - usage);

  const incrementUsage = useCallback(async () => {
    if (!user?.id) return false;

    try {
      const service = new SubscriptionService(nhost);
      const success = await service.incrementUsage(user.id);
      if (success) {
        setUsage(prev => prev + 1);
      }
      return success;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }, [user?.id, nhost]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  return {
    plan,
    planDetails: PLANS[plan],
    usage,
    loading,
    canGenerate,
    remainingGenerations,
    incrementUsage,
    refresh,
    isPro: plan === 'pro' || plan === 'team',
    isTeam: plan === 'team',
  };
}
