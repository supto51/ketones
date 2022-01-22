export interface CartTotalOneTime {
  settings: any;
  bannerText: string;
  progressPercent: number;
  requiredPrice: number;
  sumPrice: number;
  qualifiedSkus: Array<string>;
  discountedSkus: Array<{ sku: string; percent: number }>;
  isEnabled: boolean;
  isUnlocked: boolean;
  isAlmostUnlocked: boolean;
  unlockedText?: string;
  almostUnlockedText?: string;
  claimText?: string;
  showItem?: boolean;
}
