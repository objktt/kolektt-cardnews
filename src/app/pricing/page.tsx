'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus, useUserData, useNhostClient } from '@nhost/nextjs';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { PLANS, PlanType } from '@/config/plans';
import { SubscriptionService, getLemonSqueezyCheckoutUrl } from '@/services/subscription';
import { Check, Sparkles, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const nhost = useNhostClient();

  const [currentPlan, setCurrentPlan] = useState<PlanType>('free');
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function fetchPlan() {
      if (!user?.id) return;
      const service = new SubscriptionService(nhost);
      const plan = await service.getUserPlan(user.id);
      setCurrentPlan(plan);
      setLoadingPlan(false);
    }
    fetchPlan();
  }, [user?.id, nhost]);

  const handleSubscribe = (planKey: PlanType) => {
    if (!user?.id || !user?.email) {
      router.push('/login');
      return;
    }

    const plan = PLANS[planKey];
    if (!plan.priceId) {
      // Free plan - no checkout needed
      return;
    }

    // Redirect to Lemon Squeezy checkout
    const checkoutUrl = getLemonSqueezyCheckoutUrl(
      plan.priceId,
      user.id,
      user.email
    );
    window.location.href = checkoutUrl;
  };

  if (isLoading || loadingPlan) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const planIcons = {
    free: Zap,
    pro: Sparkles,
    team: Users,
  };

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-100 font-sans">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-8 pl-24">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">요금제 선택</h1>
              <p className="text-neutral-400 text-lg">
                필요에 맞는 플랜을 선택하세요. 언제든 업그레이드하거나 취소할 수 있습니다.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => {
                const Icon = planIcons[key];
                const isCurrentPlan = currentPlan === key;
                const isPopular = key === 'pro';

                return (
                  <div
                    key={key}
                    className={cn(
                      "relative bg-neutral-900 rounded-2xl border p-6 flex flex-col",
                      isPopular
                        ? "border-indigo-500 ring-2 ring-indigo-500/20"
                        : "border-neutral-800"
                    )}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          인기
                        </span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="mb-6">
                      <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="text-indigo-400" size={24} />
                      </div>
                      <h2 className="text-xl font-bold mb-1">{plan.name}</h2>
                      <p className="text-neutral-500 text-sm">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">
                          {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-neutral-500">/월</span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="text-green-500 shrink-0 mt-0.5" size={16} />
                          <span className="text-sm text-neutral-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(key)}
                      disabled={isCurrentPlan}
                      className={cn(
                        "w-full py-3 rounded-xl font-semibold transition-all",
                        isCurrentPlan
                          ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
                          : isPopular
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                          : "bg-neutral-800 hover:bg-neutral-700 text-white"
                      )}
                    >
                      {isCurrentPlan ? '현재 플랜' : key === 'free' ? '시작하기' : '구독하기'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* FAQ or Additional Info */}
            <div className="mt-16 text-center">
              <p className="text-neutral-500 text-sm">
                결제는 Lemon Squeezy를 통해 안전하게 처리됩니다.
                <br />
                언제든지 구독을 취소할 수 있으며, 취소 후에도 결제 기간 동안 서비스를 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
