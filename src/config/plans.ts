// Subscription Plans Configuration
export const PLANS = {
  free: {
    name: 'Free',
    description: '시작하기 좋은 무료 플랜',
    price: 0,
    priceId: null, // No Lemon Squeezy product for free
    features: [
      '월 5회 이미지 생성',
      '기본 템플릿 1종',
      '워터마크 포함',
    ],
    limits: {
      generationsPerMonth: 5,
      templates: ['basic'],
      aiImages: false,
      watermark: true,
    }
  },
  pro: {
    name: 'Pro',
    description: '개인 크리에이터를 위한 플랜',
    price: 9900, // KRW or $9
    priceId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_PRO_VARIANT_ID,
    features: [
      '무제한 이미지 생성',
      '모든 프리미엄 템플릿',
      'AI 이미지 생성',
      '워터마크 제거',
      '우선 지원',
    ],
    limits: {
      generationsPerMonth: Infinity,
      templates: ['basic', 'premium', 'minimal', 'bold'],
      aiImages: true,
      watermark: false,
    }
  },
  team: {
    name: 'Team',
    description: '팀 협업을 위한 플랜',
    price: 29900, // KRW or $29
    priceId: process.env.NEXT_PUBLIC_LEMONSQUEEZY_TEAM_VARIANT_ID,
    features: [
      'Pro의 모든 기능',
      '팀원 5명까지',
      '브랜드 에셋 관리',
      '협업 기능',
      '전담 지원',
    ],
    limits: {
      generationsPerMonth: Infinity,
      templates: ['basic', 'premium', 'minimal', 'bold', 'custom'],
      aiImages: true,
      watermark: false,
      teamMembers: 5,
    }
  }
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanByPriceId(priceId: string): PlanType | null {
  for (const [key, plan] of Object.entries(PLANS)) {
    if (plan.priceId === priceId) {
      return key as PlanType;
    }
  }
  return null;
}

export function canUseFeature(
  userPlan: PlanType,
  feature: 'aiImages' | 'watermark' | 'teamMembers'
): boolean {
  const plan = PLANS[userPlan];
  if (feature === 'aiImages') return plan.limits.aiImages;
  if (feature === 'watermark') return !plan.limits.watermark;
  if (feature === 'teamMembers') return 'teamMembers' in plan.limits;
  return false;
}

export function hasGenerationsRemaining(
  userPlan: PlanType,
  currentUsage: number
): boolean {
  const limit = PLANS[userPlan].limits.generationsPerMonth;
  return limit === Infinity || currentUsage < limit;
}
