import * as constants from './constants/index.js';
import { initializeProducts, findProductById, getProductDisplayInfo, updateSelectOptions } from './features/products/index.js';
import { updateTuesdayUI } from './features/discounts/index.js';
import { getCartProductTypes, updatePricesInCart, calculateCompleteCartTotals, updateCartTotalsDisplay, handleAddToCart, handleCartActions } from './features/cart/index.js';
import { updateItemStyles, setDOMRefs, createElement, createManualSystem } from './shared/index.js';
import { calculateBasePoints, calculateTuesdayBonus, calculateComboBonuses, calculateBulkBonus, renderBonusPoints } from './features/points/index.js';
import { setupEventTimers } from './features/events/index.js';
import { headerTemplate, orderSummaryTemplate, manualGuideTemplate, helpToggleTemplate, cartSummaryTemplate, discountInfoTemplate } from './shared/templates/index.js';
import { productSelectorTemplate } from './features/products/templates/index.js';
import { cartItemTemplate } from './features/cart/templates/index.js';

const {
  TUESDAY_DAY_NUMBER, TUESDAY_ADDITIONAL_DISCOUNT_RATE,
  POINTS_CALCULATION_BASE, LOW_STOCK_THRESHOLD, TOTAL_STOCK_WARNING_THRESHOLD,
  LIGHTNING_SALE_MAX_DELAY, LIGHTNING_SALE_DISCOUNT_RATE, LIGHTNING_SALE_DURATION,
  SUGGESTION_DISCOUNT_RATE, SUGGESTION_SALE_MAX_DELAY, SUGGESTION_INTERVAL_MS
} = constants;

const appState = {
  totalAmount: 0,
  itemCount: 0,
  lastSelectedItem: null,
  bonusPoints: 0
};

const dataState = {
  productList: null
};

const domRefs = {
  stockInformation: null,
  productSelect: null,
  addButton: null,
  cartDisplay: null,
  cartTotalElement: null
};

const initializeAppState = () => {
  appState.totalAmount = 0;
  appState.itemCount = 0;
  appState.lastSelectedItem = null;
};

const initializeProductData = () => {
  dataState.productList = initializeProducts();
};

const main = () => {
  initializeAppState();
  initializeProductData();
  const root = document.getElementById("app");
  createDOMStructure(root);
  
  // 이벤트 타이머 설정
  setupEventTimers({
    productList: dataState.productList,
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
  });
};

const createDOMStructure = (root) => {
  const header = createElement("div", { innerHTML: headerTemplate });
  const leftColumn = createElement("div", { innerHTML: productSelectorTemplate });
  const rightColumn = createElement("div", { innerHTML: orderSummaryTemplate });

  setDOMRefs(domRefs, {
    productSelect: { container: leftColumn, selector: "#product-select" },
    addButton: { container: leftColumn, selector: "#add-to-cart" },
    stockInformation: { container: leftColumn, selector: "#stock-status" },
    cartDisplay: { container: leftColumn, selector: "#cart-items" },
    cartTotalElement: { container: rightColumn, selector: "#cart-total" }
  });

  const gridContainer = createElement("div", { 
    className: "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden" 
  }, [leftColumn, rightColumn]);

  const { manualToggle, manualOverlay } = createManualSystem({
    createElement,
    manualGuideTemplate,
    helpToggleTemplate
  });

  const appStructure = createElement("div", { className: "app-container" }, [
    header,
    gridContainer,
    manualToggle,
    manualOverlay
  ]);

  root.appendChild(appStructure);
  updateSelectOptions(dataState.productList, domRefs.productSelect, createElement, TOTAL_STOCK_WARNING_THRESHOLD);
  calculateCartTotals();
};

/**
 * 장바구니 총액 계산 및 UI 업데이트 - 조합 함수 (분리 완료)
 * 
 * 추상화 수준 일관성 개선:
 * - 비즈니스 로직: cart/business/calculations.js → calculateCompleteCartTotals()  
 * - UI 업데이트: cart/ui/dom-updates.js → updateCartTotalsDisplay()
 * - 조합 로직: main.basic.js → 단순한 함수 호출 조합
 * 
 * 이제 다른 복잡한 함수들과 동일한 추상화 수준 달성! ✅
 */
const calculateCartTotals = () => {
  const cartItems = domRefs.cartDisplay.children;
  
  // 1. 순수한 계산 수행
  const calculationResult = calculateCompleteCartTotals(
    cartItems, 
    dataState.productList, 
    {
      TUESDAY_DAY_NUMBER, 
      TUESDAY_ADDITIONAL_DISCOUNT_RATE, 
      POINTS_CALCULATION_BASE, 
      LOW_STOCK_THRESHOLD
    }
  );

  // 2. UI 업데이트 수행
  updateCartTotalsDisplay(
    calculationResult,
    domRefs,
    appState,
    {
      updateItemStyles,
      updateTuesdayUI,
      cartSummaryTemplate,
      discountInfoTemplate,
      renderBonusPoints,
      calculateBasePoints,
      calculateTuesdayBonus,
      calculateComboBonuses,
      calculateBulkBonus,
      getCartProductTypes,
      productList: dataState.productList
    }
  );
};

main();

/**
 * 이벤트 핸들러 설정 - 조합 함수로 추상화 수준 일관성 달성 ✅
 * 
 * 추상화 개선:
 * - 비즈니스 로직: cart/handlers/cart-handlers.js → 순수함수로 분리
 * - 이벤트 등록: main.basic.js → 단순한 함수 호출 조합
 */

// 장바구니 아이템 추가 이벤트
domRefs.addButton.addEventListener("click", () => {
  const selectedItemId = domRefs.productSelect.value;
  
  handleAddToCart(selectedItemId, {
    productList: dataState.productList,
    appState,
    domRefs,
    functions: { findProductById, createElement, calculateCartTotals },
    templates: { cartItemTemplate }
  });
});

// 장바구니 액션 처리 이벤트 (수량 변경/제거)
domRefs.cartDisplay.addEventListener("click", (event) => {
  handleCartActions(event, {
    productList: dataState.productList,
    domRefs,
    constants: { TOTAL_STOCK_WARNING_THRESHOLD },
    functions: { findProductById, calculateCartTotals, updateSelectOptions, createElement }
  });
});
