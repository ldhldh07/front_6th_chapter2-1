import { INITIAL_PRODUCT_DATA } from '../../../constants/index.js';

/**
 * 상품 목록을 초기화합니다
 * @returns {Array} 초기화된 상품 목록
 */
export const initializeProducts = () => {
  return [...INITIAL_PRODUCT_DATA];
};

/**
 * 상품 ID로 상품을 찾습니다
 * @param {string} productId - 찾을 상품 ID
 * @param {Array} productList - 상품 목록
 * @returns {Object|undefined} 찾은 상품 또는 undefined
 */
export const findProduct = (productId, productList) => {
  return productList.find(product => product.id === productId);
};

/**
 * 재고가 부족한 상품들을 찾습니다
 * @param {Array} productList - 상품 목록
 * @param {number} threshold - 재고 부족 기준
 * @returns {Array} 재고 부족 상품 목록
 */
export const getLowStockProducts = (productList, threshold) => {
  return productList.filter(product => 
    product.quantity > 0 && product.quantity < threshold
  );
};

/**
 * 상품 ID로 상품을 찾습니다 (utils에서 이전)
 * @param {string} productId - 찾을 상품 ID
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object|undefined} 찾은 상품 객체 또는 undefined
 */
export const findProductById = (productId, productList) => {
  return productList.find(product => product.id === productId);
}; 