// ==================== Product Constants ====================

export const PRODUCT_IDS = {
  KEYBOARD: "p1",
  MOUSE: "p2",
  MONITOR_ARM: "p3",
  LAPTOP_POUCH: "p4",
  SPEAKER: "p5",
} as const;

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
} as const;

export const QUANTITY_DISCOUNT_THRESHOLD = 10;
export const BULK_DISCOUNT_THRESHOLD = 30;

// ==================== Points Constants ====================

export const POINTS = {
  CALCULATION_BASE: 1000,
  COMBO_BONUS: 50,
  FULL_SET_BONUS: 100,
  SMALL_BULK_BONUS: 20,
  MEDIUM_BULK_BONUS: 50,
  LARGE_BULK_BONUS: 100,
} as const;

export const BULK_THRESHOLDS = {
  SMALL: 10,
  MEDIUM: 20,
  LARGE: 30,
} as const;

// ==================== Events Constants ====================

export const EVENT_CONFIG = {
  LIGHTNING_SALE_MAX_DELAY: 10000,
  LIGHTNING_SALE_DURATION: 30000,
  LIGHTNING_SALE_DISCOUNT_RATE: 0.2,
  SUGGESTION_SALE_MAX_DELAY: 20000,
  SUGGESTION_INTERVAL_MS: 60000,
  SUGGESTION_DISCOUNT_RATE: 0.05,
} as const;

// ==================== Business Logic Constants ====================

export const TUESDAY_DAY_NUMBER = 2;
export const TUESDAY_ADDITIONAL_DISCOUNT_RATE = 0.1;
export const POINTS_CALCULATION_BASE = 1000;
export const LOW_STOCK_THRESHOLD = 5;
export const TOTAL_STOCK_WARNING_THRESHOLD = 50;
