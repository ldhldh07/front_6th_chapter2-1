/**
 * 번개세일과 추천상품 할인 이벤트 타이머를 설정합니다 (main.basic.js에서 이전)
 * @param {Object} config - 설정 객체
 * @param {Array} config.productList - 상품 목록
 * @param {Object} config.appState - 앱 상태 
 * @param {Object} config.domRefs - DOM 참조
 * @param {Object} config.constants - 상수들
 * @param {Object} config.functions - 필요한 함수들
 */
export const setupEventTimers = (config) => {
  const { 
    productList, 
    appState, 
    domRefs, 
    constants: {
      LIGHTNING_SALE_MAX_DELAY,
      LIGHTNING_SALE_DISCOUNT_RATE,
      LIGHTNING_SALE_DURATION,
      SUGGESTION_DISCOUNT_RATE,
      SUGGESTION_SALE_MAX_DELAY,
      SUGGESTION_INTERVAL_MS,
      TOTAL_STOCK_WARNING_THRESHOLD
    },
    functions: {
      updateSelectOptions,
      updatePricesInCart,
      findProductById,
      getProductDisplayInfo,
      calculateCartTotals,
      createElement
    }
  } = config;

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
        updateSelectOptions(productList, domRefs.productSelect, createElement, TOTAL_STOCK_WARNING_THRESHOLD);
        updatePricesInCart(domRefs.cartDisplay.children, productList, findProductById, getProductDisplayInfo, calculateCartTotals);
      }
    }, LIGHTNING_SALE_DURATION);
  }, lightningDelay);

  // Suggestion Sale Timer  
  setTimeout(() => {
    setInterval(() => {
      if (domRefs.cartDisplay.children.length === 0) {
        return;
      }
      if (appState.lastSelectedItem) {
        const suggestedProduct = productList.find(product => 
          product.id !== appState.lastSelectedItem && 
          product.quantity > 0 && 
          !product.suggestSale
        );
        if (suggestedProduct) {
          alert(
            "💝 " +
              suggestedProduct.name +
              "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!"
          );

          suggestedProduct.price = Math.round(
            suggestedProduct.price * (1 - SUGGESTION_DISCOUNT_RATE)
          );
          suggestedProduct.suggestSale = true;
          updateSelectOptions(productList, domRefs.productSelect, createElement, TOTAL_STOCK_WARNING_THRESHOLD);
          updatePricesInCart(domRefs.cartDisplay.children, productList, findProductById, getProductDisplayInfo, calculateCartTotals);
        }
      }
    }, SUGGESTION_INTERVAL_MS);
  }, Math.random() * SUGGESTION_SALE_MAX_DELAY);
}; 