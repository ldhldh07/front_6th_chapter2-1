import * as constants from '../../constants/index.js';

const { QUANTITY_DISCOUNT_THRESHOLD } = constants;

/**
 * 장바구니 아이템의 스타일을 업데이트합니다 (utils에서 이전)
 * @param {HTMLElement} cartItem - 장바구니 DOM 요소
 * @param {number} quantity - 상품 수량
 */
export const updateItemStyles = (cartItem, quantity) => {
  const priceElements = cartItem.querySelectorAll(".text-lg, .text-xs");
  priceElements.forEach(function (elem) {
    if (elem.classList.contains("text-lg")) {
      elem.style.fontWeight = quantity >= QUANTITY_DISCOUNT_THRESHOLD ? "bold" : "normal";
    }
  });
}; 