import { updateItemStyles } from '../../../shared/index.js';
import { updateTuesdayUI } from '../../discounts/index.js';

/**
 * 장바구니 아이템들의 스타일을 일괄 업데이트합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록
 */
export const updateCartItemStyles = (cartItems, productList) => {
  Array.from(cartItems).forEach(cartItem => {
    const quantityElement = cartItem.querySelector(".quantity-number");
    const quantity = parseInt(quantityElement.textContent);
    updateItemStyles(cartItem, quantity);
  });
};

/**
 * 장바구니 요약 정보를 업데이트합니다
 * @param {Object} cartData - 장바구니 계산 결과
 */
export const updateCartSummary = (cartData) => {
  // 아이템 개수 표시
  const itemCountElement = document.getElementById("item-count");
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${cartData.itemCount} items in cart`;
  }
  
  // 화요일 특별 할인 UI
  updateTuesdayUI(cartData.isTuesday);
  
  // 할인 정보 표시
  updateDiscountInfo(cartData.itemDiscounts, cartData.bulkDiscount);
  
  // 총액 표시
  updateTotalDisplay(cartData.totalAmount);
};

/**
 * 할인 정보를 표시합니다
 * @param {Array} itemDiscounts - 개별 상품 할인 목록
 * @param {Object|null} bulkDiscount - 대량구매 할인 정보
 */
const updateDiscountInfo = (itemDiscounts, bulkDiscount) => {
  const discountInfo = document.getElementById("discount-info");
  if (!discountInfo) return;
  
  let discountText = "";
  
  if (itemDiscounts.length > 0) {
    discountText += itemDiscounts
      .map(item => `${item.name}: ${item.discount}% 할인`)
      .join(", ") + "<br>";
  }
  
  if (bulkDiscount) {
    discountText += `대량구매 할인: ${(bulkDiscount.discRate * 100).toFixed(0)}%`;
  }
  
  discountInfo.innerHTML = discountText;
};

/**
 * 총액을 표시합니다
 * @param {number} totalAmount - 총 금액
 */
const updateTotalDisplay = (totalAmount) => {
  const cartTotal = document.querySelector("#cart-total .text-2xl");
  if (cartTotal) {
    cartTotal.textContent = `₩${Math.round(totalAmount).toLocaleString()}`;
  }
}; 