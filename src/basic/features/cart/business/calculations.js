import { calculateItemData } from '../../../utils/index.js';
import { applyBulkDiscount, calculateTuesdayDiscount } from '../../../utils/index.js';

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