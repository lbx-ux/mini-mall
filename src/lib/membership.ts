// 心悦会员等级计算

/** 会员等级定义 */
const MEMBERSHIP_TIERS = [
  { level: 0, threshold: 0, name: "心悦 0" },
  { level: 1, threshold: 800, name: "心悦 1" },
  { level: 2, threshold: 8_000, name: "心悦 2" },
  { level: 3, threshold: 80_000, name: "心悦 3" },
] as const;

/** 根据累计消费金额返回会员等级 (0-3) */
export function calcMembershipLevel(totalSpent: number): number {
  let level = 0;
  for (const tier of MEMBERSHIP_TIERS) {
    if (totalSpent >= tier.threshold) {
      level = tier.level;
    }
  }
  return level;
}

/** 根据会员等级返回折扣率 (1.0 = 无折扣, 0.98 = 9.8折) */
export function getDiscountRate(level: number): number {
  switch (level) {
    case 0: return 1.0;
    case 1: return 0.98;
    case 2: return 0.95;
    case 3: return 0.9;
    default: return 1.0;
  }
}

/** 获取等级名称 */
export function getMembershipName(level: number): string {
  return MEMBERSHIP_TIERS[level]?.name ?? "心悦 0";
}
