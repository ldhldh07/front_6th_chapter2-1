/**
 * Application Constants - React Ready
 * 모든 상수를 중앙에서 관리 (React 준비)
 */

// ==================== Product Constants ====================

export const PRODUCT_IDS = {
  KEYBOARD: "p1",
  MOUSE: "p2",
  MONITOR_ARM: "p3",
  LAPTOP_POUCH: "p4",
  SPEAKER: "p5",
};

// Legacy aliases (기존 코드 호환성)
export const PRODUCT_ONE = PRODUCT_IDS.KEYBOARD;
export const PRODUCT_TWO = PRODUCT_IDS.MOUSE;
export const PRODUCT_THREE = PRODUCT_IDS.MONITOR_ARM;
export const PRODUCT_FOUR = PRODUCT_IDS.LAPTOP_POUCH;
export const PRODUCT_FIVE = PRODUCT_IDS.SPEAKER;

export const INITIAL_PRODUCT_DATA = [
  {
    id: PRODUCT_IDS.KEYBOARD,
    name: "버그 없애는 키보드",
    price: 10000,
    originalPrice: 10000,
    quantity: 50,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MOUSE,
    name: "생산성 폭발 마우스",
    price: 20000,
    originalPrice: 20000,
    quantity: 30,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.MONITOR_ARM,
    name: "거북목 탈출 모니터암",
    price: 30000,
    originalPrice: 30000,
    quantity: 20,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.LAPTOP_POUCH,
    name: "에러 방지 노트북 파우치",
    price: 15000,
    originalPrice: 15000,
    quantity: 0,
    onSale: false,
    suggestSale: false,
  },
  {
    id: PRODUCT_IDS.SPEAKER,
    name: "코딩할 때 듣는 Lo-Fi 스피커",
    price: 25000,
    originalPrice: 25000,
    quantity: 10,
    onSale: false,
    suggestSale: false,
  },
];

// ==================== Discount Constants ====================

export const DISCOUNT_RATES = {
  KEYBOARD: 0.1,
  MOUSE: 0.15,
  MONITOR_ARM: 0.2,
  SPEAKER: 0.25,
  SUGGESTION: 0.05,
  BULK: 0.25,
  TUESDAY_ADDITIONAL: 0.1,
  LIGHTNING_SALE: 0.2,
};

// Legacy aliases
export const KEYBOARD_DISCOUNT_RATE = DISCOUNT_RATES.KEYBOARD;
export const MOUSE_DISCOUNT_RATE = DISCOUNT_RATES.MOUSE;
export const MONITOR_ARM_DISCOUNT_RATE = DISCOUNT_RATES.MONITOR_ARM;
export const SPEAKER_DISCOUNT_RATE = DISCOUNT_RATES.SPEAKER;
export const SUGGESTION_DISCOUNT_RATE = DISCOUNT_RATES.SUGGESTION;
export const BULK_DISCOUNT_RATE = DISCOUNT_RATES.BULK;
export const TUESDAY_ADDITIONAL_DISCOUNT_RATE =
  DISCOUNT_RATES.TUESDAY_ADDITIONAL;
export const LIGHTNING_SALE_DISCOUNT_RATE = DISCOUNT_RATES.LIGHTNING_SALE;

export const THRESHOLDS = {
  BULK_DISCOUNT: 30,
  QUANTITY_DISCOUNT: 10,
  LOW_STOCK: 5,
  TOTAL_STOCK_WARNING: 50,
  SMALL_BULK: 10,
  MEDIUM_BULK: 20,
  LARGE_BULK: 30,
};

// Legacy aliases
export const BULK_DISCOUNT_THRESHOLD = THRESHOLDS.BULK_DISCOUNT;
export const QUANTITY_DISCOUNT_THRESHOLD = THRESHOLDS.QUANTITY_DISCOUNT;
export const LOW_STOCK_THRESHOLD = THRESHOLDS.LOW_STOCK;
export const TOTAL_STOCK_WARNING_THRESHOLD = THRESHOLDS.TOTAL_STOCK_WARNING;
export const SMALL_BULK_THRESHOLD = THRESHOLDS.SMALL_BULK;
export const MEDIUM_BULK_THRESHOLD = THRESHOLDS.MEDIUM_BULK;
export const LARGE_BULK_THRESHOLD = THRESHOLDS.LARGE_BULK;

// ==================== Points Constants ====================

export const POINTS = {
  CALCULATION_BASE: 1000,
  COMBO_BONUS: 50,
  FULL_SET_BONUS: 100,
  SMALL_BULK_BONUS: 20,
  MEDIUM_BULK_BONUS: 50,
  LARGE_BULK_BONUS: 100,
};

// Legacy aliases
export const POINTS_CALCULATION_BASE = POINTS.CALCULATION_BASE;
export const COMBO_BONUS_POINTS = POINTS.COMBO_BONUS;
export const FULL_SET_BONUS_POINTS = POINTS.FULL_SET_BONUS;
export const SMALL_BULK_BONUS_POINTS = POINTS.SMALL_BULK_BONUS;
export const MEDIUM_BULK_BONUS_POINTS = POINTS.MEDIUM_BULK_BONUS;
export const LARGE_BULK_BONUS_POINTS = POINTS.LARGE_BULK_BONUS;

// ==================== Time & Event Constants ====================

export const TIME_CONFIG = {
  TUESDAY_DAY_NUMBER: 2,
  LIGHTNING_SALE_MAX_DELAY: 10000,
  LIGHTNING_SALE_DURATION: 30000,
  SUGGESTION_SALE_MAX_DELAY: 20000,
  SUGGESTION_INTERVAL_MS: 60000,
};

// Legacy aliases
export const TUESDAY_DAY_NUMBER = TIME_CONFIG.TUESDAY_DAY_NUMBER;
export const LIGHTNING_SALE_MAX_DELAY = TIME_CONFIG.LIGHTNING_SALE_MAX_DELAY;
export const LIGHTNING_SALE_DURATION = TIME_CONFIG.LIGHTNING_SALE_DURATION;
export const SUGGESTION_SALE_MAX_DELAY = TIME_CONFIG.SUGGESTION_SALE_MAX_DELAY;
export const SUGGESTION_INTERVAL_MS = TIME_CONFIG.SUGGESTION_INTERVAL_MS;

// ==================== UI Text Constants ====================

export const SALE_TEXTS = {
  SUPER_SALE: "25% SUPER SALE!",
  LIGHTNING_SALE: "20% SALE!",
  SUGGESTION_SALE: "5% 추천할인!",
};

// Legacy aliases
export const SUPER_SALE_TEXT = SALE_TEXTS.SUPER_SALE;
export const LIGHTNING_SALE_TEXT = SALE_TEXTS.LIGHTNING_SALE;
export const SUGGESTION_SALE_TEXT = SALE_TEXTS.SUGGESTION_SALE;

// ==================== React-Style Grouped Exports ====================

export const PRODUCT_CONFIG = {
  IDS: PRODUCT_IDS,
  INITIAL_DATA: INITIAL_PRODUCT_DATA,
};

export const DISCOUNT_CONFIG = {
  RATES: DISCOUNT_RATES,
  THRESHOLDS: THRESHOLDS,
};

export const POINTS_CONFIG = {
  ...POINTS,
  THRESHOLDS: {
    SMALL_BULK: THRESHOLDS.SMALL_BULK,
    MEDIUM_BULK: THRESHOLDS.MEDIUM_BULK,
    LARGE_BULK: THRESHOLDS.LARGE_BULK,
  },
};

export const APP_CONFIG = {
  PRODUCTS: PRODUCT_CONFIG,
  DISCOUNTS: DISCOUNT_CONFIG,
  POINTS: POINTS_CONFIG,
  TIME: TIME_CONFIG,
  UI_TEXTS: SALE_TEXTS,
};
