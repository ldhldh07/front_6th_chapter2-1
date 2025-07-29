import * as constants from '../constants/index.js';
import { getProductDiscountRate } from './calculations.js';

const { QUANTITY_DISCOUNT_THRESHOLD, PRODUCT_ONE, PRODUCT_TWO, PRODUCT_THREE } = constants;

/**
 * 상품 ID로 상품을 찾습니다
 * @param {string} productId - 찾을 상품 ID
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object|undefined} 찾은 상품 객체 또는 undefined
 */
export const findProductById = (productId, productList) => {
  return productList.find(product => product.id === productId);
};

/**
 * 장바구니 아이템의 계산 데이터를 생성합니다
 * @param {HTMLElement} cartItem - 장바구니 DOM 요소
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object} 아이템 계산 정보
 * @returns {Object} returns.product - 상품 정보
 * @returns {number} returns.quantity - 수량
 * @returns {number} returns.itemTotal - 아이템 총액
 * @returns {number} returns.discount - 할인율 (0.0 ~ 1.0)
 * @returns {HTMLElement} returns.cartItem - 장바구니 DOM 요소
 */
export const calculateItemData = (cartItem, productList) => {
  const product = findProductById(cartItem.id, productList);
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

/**
 * 장바구니에 있는 상품 유형들을 확인합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object} 상품 유형 확인 결과
 * @returns {boolean} returns.hasKeyboard - 키보드 포함 여부
 * @returns {boolean} returns.hasMouse - 마우스 포함 여부
 * @returns {boolean} returns.hasMonitorArm - 모니터암 포함 여부
 */
export const getCartProductTypes = (cartItems, productList) => {
  return Array.from(cartItems).reduce((types, node) => {
    const product = findProductById(node.id, productList);
    if (!product) return types;
    
    if (product.id === PRODUCT_ONE) types.hasKeyboard = true;
    if (product.id === PRODUCT_TWO) types.hasMouse = true;
    if (product.id === PRODUCT_THREE) types.hasMonitorArm = true;
    
    return types;
  }, { hasKeyboard: false, hasMouse: false, hasMonitorArm: false });
}; 