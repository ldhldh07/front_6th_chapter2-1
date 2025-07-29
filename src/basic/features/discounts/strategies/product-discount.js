import * as constants from '../../../constants/index.js';

const {
  PRODUCT_ONE, PRODUCT_TWO, PRODUCT_THREE, PRODUCT_FOUR, PRODUCT_FIVE,
  KEYBOARD_DISCOUNT_RATE, MOUSE_DISCOUNT_RATE, MONITOR_ARM_DISCOUNT_RATE,
  SUGGESTION_DISCOUNT_RATE, SPEAKER_DISCOUNT_RATE
} = constants;

/**
 * 상품별 할인율 매핑
 */
const PRODUCT_DISCOUNT_MAP = {
  [PRODUCT_ONE]: KEYBOARD_DISCOUNT_RATE,
  [PRODUCT_TWO]: MOUSE_DISCOUNT_RATE, 
  [PRODUCT_THREE]: MONITOR_ARM_DISCOUNT_RATE,
  [PRODUCT_FOUR]: SUGGESTION_DISCOUNT_RATE,
  [PRODUCT_FIVE]: SPEAKER_DISCOUNT_RATE
};

/**
 * 상품별 할인율을 반환합니다 (Strategy Pattern)
 * @param {string} productId - 상품 ID
 * @returns {number} 할인율 (0.0 ~ 1.0)
 */
export const getProductDiscountRate = (productId) => {
  return PRODUCT_DISCOUNT_MAP[productId] || 0;
};

/**
 * 개별 상품 할인 전략을 적용합니다
 * @param {Object} product - 상품 정보
 * @param {number} quantity - 수량
 * @param {number} threshold - 할인 적용 기준 수량
 * @returns {number} 할인율
 */
export const applyProductDiscount = (product, quantity, threshold) => {
  if (quantity >= threshold) {
    return getProductDiscountRate(product.id);
  }
  return 0;
}; 