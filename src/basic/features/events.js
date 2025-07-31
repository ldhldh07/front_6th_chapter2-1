/**
 * Events Feature - 통합 모듈
 * 번개세일과 추천상품 할인 이벤트 타이머 관리
 */

import {
  LIGHTNING_SALE_MAX_DELAY,
  LIGHTNING_SALE_DISCOUNT_RATE,
  LIGHTNING_SALE_DURATION,
  SUGGESTION_DISCOUNT_RATE,
  SUGGESTION_SALE_MAX_DELAY,
  SUGGESTION_INTERVAL_MS,
  TOTAL_STOCK_WARNING_THRESHOLD,
} from "../constants.js";
import {
  updateSelectOptions,
  findProductById,
  getProductDisplayInfo,
} from "./products.js";

import { updatePricesInCart } from "./cart.js";

/**
 * 번개세일과 추천상품 할인 이벤트 타이머를 설정합니다
 * @param {Object} config - 설정 객체
 * @param {Array} config.productList - 상품 목록
 * @param {Object} config.appState - 앱 상태
 * @param {Object} config.domRefs - DOM 참조
 * @param {Function} config.calculateCartTotals - 장바구니 계산 함수 (main.basic.js 로컬 함수)
 */
export const setupEventTimers = config => {
  const { productList, appState, domRefs, calculateCartTotals } = config;

  // Lightning Sale Timer
  const lightningDelay = Math.random() * LIGHTNING_SALE_MAX_DELAY;
  setTimeout(() => {
    setInterval(() => {
      const luckyIndex = Math.floor(Math.random() * productList.length);
      const luckyItem = productList[luckyIndex];
      if (luckyItem.quantity > 0 && !luckyItem.onSale) {
        luckyItem.price = Math.round(
          luckyItem.originalPrice * (1 - LIGHTNING_SALE_DISCOUNT_RATE)
        );
        luckyItem.onSale = true;
        alert("⚡번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
        updateSelectOptions(
          productList,
          domRefs.productSelect,
          TOTAL_STOCK_WARNING_THRESHOLD
        );
        updatePricesInCart(
          domRefs.cartDisplay.children,
          productList,
          findProductById,
          getProductDisplayInfo,
          calculateCartTotals
        );
      }
    }, LIGHTNING_SALE_DURATION);
  }, lightningDelay);

  // Suggestion Sale Timer
  setTimeout(() => {
    setInterval(() => {
      if (domRefs.cartDisplay.children.length === 0) {
        return;
      }
      if (!appState.lastSelectedItem) return;

      const suggestedProduct = productList.find(
        product =>
          product.id !== appState.lastSelectedItem &&
          product.quantity > 0 &&
          !product.suggestSale
      );

      if (!suggestedProduct) return;

      alert(
        "💝 " +
          suggestedProduct.name +
          "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!"
      );

      suggestedProduct.price = Math.round(
        suggestedProduct.price * (1 - SUGGESTION_DISCOUNT_RATE)
      );
      suggestedProduct.suggestSale = true;
      updateSelectOptions(
        productList,
        domRefs.productSelect,
        TOTAL_STOCK_WARNING_THRESHOLD
      );
      updatePricesInCart(
        domRefs.cartDisplay.children,
        productList,
        findProductById,
        getProductDisplayInfo,
        calculateCartTotals
      );
    }, SUGGESTION_INTERVAL_MS);
  }, Math.random() * SUGGESTION_SALE_MAX_DELAY);
};
