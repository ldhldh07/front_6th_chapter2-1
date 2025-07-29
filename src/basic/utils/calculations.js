import * as constants from '../constants/index.js';

const {
  PRODUCT_ONE, PRODUCT_TWO, PRODUCT_THREE, PRODUCT_FOUR, PRODUCT_FIVE,
  KEYBOARD_DISCOUNT_RATE, MOUSE_DISCOUNT_RATE, MONITOR_ARM_DISCOUNT_RATE,
  SPEAKER_DISCOUNT_RATE, SUGGESTION_DISCOUNT_RATE,
  QUANTITY_DISCOUNT_THRESHOLD, BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_RATE
} = constants;

/**
 * 상품별 할인율을 반환합니다
 * @param {string} productId - 상품 ID (PRODUCT_ONE ~ PRODUCT_FIVE)
 * @returns {number} 할인율 (0.0 ~ 1.0)
 */
export const getProductDiscountRate = (productId) => {
  if (productId === PRODUCT_ONE) return KEYBOARD_DISCOUNT_RATE;
  if (productId === PRODUCT_TWO) return MOUSE_DISCOUNT_RATE;
  if (productId === PRODUCT_THREE) return MONITOR_ARM_DISCOUNT_RATE;
  if (productId === PRODUCT_FOUR) return SUGGESTION_DISCOUNT_RATE;
  if (productId === PRODUCT_FIVE) return SPEAKER_DISCOUNT_RATE;
  return 0;
};

/**
 * 대량구매 할인을 적용합니다
 * @param {number} itemCount - 총 상품 개수
 * @param {number} subtotal - 소계 금액
 * @returns {Object|null} 할인 정보 또는 null
 * @returns {number} returns.totalAmount - 할인 적용된 금액
 * @returns {number} returns.discRate - 할인율
 */
export const applyBulkDiscount = (itemCount, subtotal) => {
  if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
    return {
      totalAmount: subtotal * (1 - BULK_DISCOUNT_RATE),
      discRate: BULK_DISCOUNT_RATE
    };
  }
  return null; // 대량구매 할인 미적용
};

/**
 * 화요일 할인을 계산합니다
 * @param {number} totalAmount - 현재 총액
 * @param {number} originalTotal - 원래 총액  
 * @param {number} tuesdayDayNumber - 화요일 요일 번호 (0-6)
 * @param {number} discountRate - 화요일 할인율 (0.0 ~ 1.0)
 * @returns {Object} 할인 계산 결과
 * @returns {number} returns.totalAmount - 할인 적용된 금액
 * @returns {number} returns.discRate - 전체 할인율
 * @returns {boolean} returns.isTuesday - 오늘이 화요일인지 여부
 */
export const calculateTuesdayDiscount = (totalAmount, originalTotal, tuesdayDayNumber, discountRate) => {
  const today = new Date();
  const isTuesday = today.getDay() === tuesdayDayNumber;
  
  if (isTuesday && totalAmount > 0) {
    const discountedAmount = totalAmount * (1 - discountRate);
    const discRate = 1 - discountedAmount / originalTotal;
    return {
      totalAmount: discountedAmount,
      discRate,
      isTuesday
    };
  }
  
  return {
    totalAmount,
    discRate: 1 - totalAmount / originalTotal,
    isTuesday
  };
}; 