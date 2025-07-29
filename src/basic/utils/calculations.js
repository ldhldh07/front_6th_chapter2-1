import * as constants from '../constants/index.js';

const {
  PRODUCT_ONE, PRODUCT_TWO, PRODUCT_THREE, PRODUCT_FOUR, PRODUCT_FIVE,
  KEYBOARD_DISCOUNT_RATE, MOUSE_DISCOUNT_RATE, MONITOR_ARM_DISCOUNT_RATE,
  SPEAKER_DISCOUNT_RATE, SUGGESTION_DISCOUNT_RATE,
  QUANTITY_DISCOUNT_THRESHOLD, BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_RATE
} = constants;

export const getProductDiscountRate = (productId) => {
  if (productId === PRODUCT_ONE) return KEYBOARD_DISCOUNT_RATE;
  if (productId === PRODUCT_TWO) return MOUSE_DISCOUNT_RATE;
  if (productId === PRODUCT_THREE) return MONITOR_ARM_DISCOUNT_RATE;
  if (productId === PRODUCT_FOUR) return SUGGESTION_DISCOUNT_RATE;
  if (productId === PRODUCT_FIVE) return SPEAKER_DISCOUNT_RATE;
  return 0;
};

export const applyBulkDiscount = (itemCount, subtotal) => {
  if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
    return {
      totalAmount: subtotal * (1 - BULK_DISCOUNT_RATE),
      discRate: BULK_DISCOUNT_RATE
    };
  }
  return null; // 대량구매 할인 미적용
};

// calculateItemData는 findProductById 의존성으로 인해 추후 분리 