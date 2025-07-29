import { applyBulkDiscount, calculateTuesdayDiscount } from '../../../utils/index.js';
import { getProductDiscountRate } from '../../../features/discounts/index.js';
import * as constants from '../../../constants/index.js';

const { QUANTITY_DISCOUNT_THRESHOLD } = constants;

/**
 * 장바구니 총 금액 및 할인을 계산합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록
 * @param {Object} discountConfig - 할인 설정
 * @returns {Object} 계산 결과
 */
export const calculateCartTotals = (cartItems, productList, discountConfig) => {
  let totalAmount = 0;
  let itemCount = 0;
  let subtotal = 0;
  const itemDiscounts = [];
  
  // 개별 아이템 계산
  Array.from(cartItems).forEach(cartItem => {
    const itemData = calculateItemData(cartItem, productList);
    const { product, quantity, itemTotal, discount } = itemData;

    itemCount += quantity;
    subtotal += itemTotal;

    if (discount > 0) {
      itemDiscounts.push({ name: product.name, discount: discount * 100 });
    }
    totalAmount += itemTotal * (1 - discount);
  });
  
  const originalTotal = subtotal;
  
  // 대량구매 할인 적용
  const bulkDiscount = applyBulkDiscount(itemCount, subtotal);
  if (bulkDiscount) {
    totalAmount = bulkDiscount.totalAmount;
  }
  
  // 화요일 할인 적용
  const tuesdayDiscount = calculateTuesdayDiscount(
    totalAmount, 
    originalTotal, 
    discountConfig.tuesdayDayNumber, 
    discountConfig.tuesdayDiscountRate
  );
  
  return {
    totalAmount: tuesdayDiscount.totalAmount,
    itemCount,
    originalTotal,
    discRate: tuesdayDiscount.discRate,
    isTuesday: tuesdayDiscount.isTuesday,
    itemDiscounts,
    bulkDiscount
  };
};

/**
 * 장바구니 상태를 업데이트합니다
 * @param {Object} cartState - 현재 장바구니 상태
 * @param {Object} newData - 새로운 계산 데이터
 * @returns {Object} 업데이트된 상태
 */
export const updateCartState = (cartState, newData) => {
  return {
    ...cartState,
    totalAmount: newData.totalAmount,
    itemCount: newData.itemCount,
    discRate: newData.discRate,
    isTuesday: newData.isTuesday
  };
};

/**
 * 장바구니 아이템의 계산 데이터를 생성합니다 (utils에서 이전)
 * @param {HTMLElement} cartItem - 장바구니 DOM 요소
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object} 아이템 계산 정보
 */
export const calculateItemData = (cartItem, productList) => {
  const product = productList.find(product => product.id === cartItem.id);
  const quantityElement = cartItem.querySelector(".quantity-number");
  const quantity = parseInt(quantityElement.textContent);
  const itemTotal = product.price * quantity;
  const discount = quantity >= QUANTITY_DISCOUNT_THRESHOLD 
    ? getProductDiscountRate(product.id) 
    : 0;
  
  return {
    product,
    quantity,
    itemTotal,
    discount,
    cartItem
  };
}; 