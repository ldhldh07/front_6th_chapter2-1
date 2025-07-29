import * as constants from '../../../constants/index.js';

const { BULK_DISCOUNT_THRESHOLD, BULK_DISCOUNT_RATE } = constants;

/**
 * 대량구매 할인 전략을 적용합니다
 * @param {number} itemCount - 총 상품 개수
 * @param {number} subtotal - 소계 금액
 * @returns {Object|null} 할인 정보 또는 null
 */
export const applyBulkDiscount = (itemCount, subtotal) => {
  if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
    return {
      totalAmount: subtotal * (1 - BULK_DISCOUNT_RATE),
      discRate: BULK_DISCOUNT_RATE,
      type: 'bulk'
    };
  }
  return null;
}; 