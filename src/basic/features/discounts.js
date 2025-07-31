/**
 * Discounts Feature - 통합 모듈
 * 상품별, 대량구매, 화요일 할인 전략 및 UI 관리
 */

// Constants import
import {
  PRODUCT_ONE,
  PRODUCT_TWO,
  PRODUCT_THREE,
  PRODUCT_FOUR,
  PRODUCT_FIVE,
  KEYBOARD_DISCOUNT_RATE,
  MOUSE_DISCOUNT_RATE,
  MONITOR_ARM_DISCOUNT_RATE,
  SPEAKER_DISCOUNT_RATE,
  SUGGESTION_DISCOUNT_RATE,
  BULK_DISCOUNT_THRESHOLD,
  BULK_DISCOUNT_RATE,
} from "../constants.js";

// ==================== Discount Strategies ====================

/**
 * 상품별 할인율 매핑
 */
const PRODUCT_DISCOUNT_MAP = {
  [PRODUCT_ONE]: KEYBOARD_DISCOUNT_RATE,
  [PRODUCT_TWO]: MOUSE_DISCOUNT_RATE,
  [PRODUCT_THREE]: MONITOR_ARM_DISCOUNT_RATE,
  [PRODUCT_FOUR]: SUGGESTION_DISCOUNT_RATE,
  [PRODUCT_FIVE]: SPEAKER_DISCOUNT_RATE,
};

/**
 * 상품별 할인율을 반환합니다 (Strategy Pattern)
 * @param {string} productId - 상품 ID
 * @returns {number} 할인율 (0.0 ~ 1.0)
 */
export const getProductDiscountRate = productId => {
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
      type: "bulk",
    };
  }
  return null;
};

/**
 * 화요일 할인 전략을 적용합니다
 * @param {number} totalAmount - 현재 총액
 * @param {number} originalTotal - 원래 총액
 * @param {number} tuesdayDayNumber - 화요일 요일 번호 (0-6)
 * @param {number} discountRate - 화요일 할인율 (0.0 ~ 1.0)
 * @returns {Object} 할인 계산 결과
 */
export const calculateTuesdayDiscount = (
  totalAmount,
  originalTotal,
  tuesdayDayNumber,
  discountRate
) => {
  const today = new Date();
  const isTuesday = today.getDay() === tuesdayDayNumber;

  if (isTuesday && totalAmount > 0) {
    const discountedAmount = totalAmount * (1 - discountRate);
    const discRate = 1 - discountedAmount / originalTotal;
    return {
      totalAmount: discountedAmount,
      discRate,
      isTuesday,
      type: "tuesday",
    };
  }

  return {
    totalAmount,
    discRate: 1 - totalAmount / originalTotal,
    isTuesday,
    type: "none",
  };
};

// ==================== Discount UI ====================

/**
 * 화요일 특별 할인 UI를 업데이트합니다
 * @param {boolean} isTuesday - 오늘이 화요일인지 여부
 */
export const updateTuesdayUI = isTuesday => {
  const tuesdaySpecial = document.getElementById("tuesday-special");
  if (!tuesdaySpecial) return;

  if (isTuesday) {
    tuesdaySpecial.classList.remove("hidden");
    return;
  }

  tuesdaySpecial.classList.add("hidden");
};
