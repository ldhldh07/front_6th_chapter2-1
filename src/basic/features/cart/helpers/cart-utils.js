import * as constants from '../../../constants/index.js';

const { PRODUCT_ONE, PRODUCT_TWO, PRODUCT_THREE } = constants;

/**
 * 장바구니에 있는 상품 유형들을 확인합니다 (utils에서 이전)
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object} 상품 유형 확인 결과
 */
export const getCartProductTypes = (cartItems, productList) => {
  return Array.from(cartItems).reduce((types, node) => {
    const product = productList.find(product => product.id === node.id);
    if (!product) return types;
    
    if (product.id === PRODUCT_ONE) types.hasKeyboard = true;
    if (product.id === PRODUCT_TWO) types.hasMouse = true;
    if (product.id === PRODUCT_THREE) types.hasMonitorArm = true;
    
    return types;
  }, { hasKeyboard: false, hasMouse: false, hasMonitorArm: false });
}; 