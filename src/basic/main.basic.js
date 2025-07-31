/**
 * Clean Shopping Cart Application
 */

// ==================== Imports ====================

// Constants (중앙화)
import {
  INITIAL_PRODUCT_DATA,
  TUESDAY_DAY_NUMBER,
  TUESDAY_ADDITIONAL_DISCOUNT_RATE,
  POINTS_CALCULATION_BASE,
  LOW_STOCK_THRESHOLD,
  TOTAL_STOCK_WARNING_THRESHOLD,
} from "./constants.js";

import { renderApp } from "./app.js";
import { findProductById, updateSelectOptions } from "./features/products.js";

import {
  calculateCompleteCartTotals,
  updateCartTotalsDisplay,
  handleAddToCart,
  handleCartActions,
} from "./features/cart.js";

import { setupEventTimers } from "./features/events.js";

// ==================== App State ====================

const appState = {
  totalAmount: 0,
  itemCount: 0,
  lastSelectedItem: null,
  bonusPoints: 0,
};

const dataState = {
  productList: null,
};

const domRefs = {
  stockInformation: null,
  productSelect: null,
  addButton: null,
  cartDisplay: null,
  cartTotalElement: null,
  itemCountElement: null,
  summaryDetailsElement: null,
  loyaltyPointsElement: null,
  discountInfoElement: null,
};

// ==================== Shared Utilities ====================

// 매뉴얼 시스템은 app.js의 renderApp에 포함됨

// ==================== App Logic ====================

const initializeAppState = () => {
  appState.totalAmount = 0;
  appState.itemCount = 0;
  appState.lastSelectedItem = null;
};

const initializeProductData = () => {
  dataState.productList = [...INITIAL_PRODUCT_DATA];
};

const main = () => {
  initializeAppState();
  initializeProductData();
  const root = document.getElementById("app");
  createAppStructure(root);

  // 이벤트 타이머 설정
  setupEventTimers({
    productList: dataState.productList,
    appState,
    domRefs,
    calculateCartTotals,
  });
};

/**
 * 앱 구조 생성 (완전 HTML 기반)
 */
const createAppStructure = root => {
  // HTML 기반 전체 앱 렌더링
  renderApp(root);

  // DOM 참조 설정
  setupDOMRefs();

  // 초기 데이터 설정
  updateSelectOptions(
    dataState.productList,
    domRefs.productSelect,
    TOTAL_STOCK_WARNING_THRESHOLD
  );
  calculateCartTotals();
};

/**
 * DOM 참조 설정 (HTML 렌더링 후)
 */
const setupDOMRefs = () => {
  domRefs.productSelect = document.getElementById("product-select");
  domRefs.addButton = document.getElementById("add-to-cart");
  domRefs.stockInformation = document.getElementById("stock-status");
  domRefs.cartDisplay = document.getElementById("cart-items");
  domRefs.cartTotalElement = document.getElementById("cart-total");
  domRefs.itemCountElement = document.getElementById("item-count");
  domRefs.summaryDetailsElement = document.getElementById("summary-details");
  domRefs.loyaltyPointsElement = document.getElementById("loyalty-points");
  domRefs.discountInfoElement = document.getElementById("discount-info");

  // 매뉴얼 시스템 이벤트 연결
  setupManualEvents();
};

/**
 * 매뉴얼 시스템 이벤트 설정
 */
const setupManualEvents = () => {
  const helpButton = document.querySelector('[data-action="toggle-manual"]');
  const manualOverlay = document.getElementById("manual-overlay");
  const manualPanel = document.getElementById("manual-panel");
  const closeButton = document.querySelector('[data-action="close-manual"]');

  if (!helpButton || !manualOverlay || !manualPanel) return;

  // 도움말 버튼 클릭
  helpButton.addEventListener("click", () => {
    manualOverlay.classList.remove("hidden");
    manualPanel.classList.remove("translate-x-full");
  });

  // 오버레이 클릭으로 닫기
  manualOverlay.addEventListener("click", event => {
    if (event.target === manualOverlay) {
      manualPanel.classList.add("translate-x-full");
      manualOverlay.classList.add("hidden");
    }
  });

  // 닫기 버튼 클릭
  if (!closeButton) return;

  closeButton.addEventListener("click", () => {
    manualPanel.classList.add("translate-x-full");
    manualOverlay.classList.add("hidden");
  });
};

/**
 * 장바구니 총액 계산 및 UI 업데이트
 */
const calculateCartTotals = () => {
  const cartItems = domRefs.cartDisplay.children;

  const calculationResult = calculateCompleteCartTotals(
    cartItems,
    dataState.productList,
    {
      TUESDAY_DAY_NUMBER,
      TUESDAY_ADDITIONAL_DISCOUNT_RATE,
      POINTS_CALCULATION_BASE,
      LOW_STOCK_THRESHOLD,
    }
  );

  updateCartTotalsDisplay(
    calculationResult,
    domRefs,
    appState,
    dataState.productList
  );
};

main();

// ==================== Event Listeners ====================
domRefs.addButton.addEventListener("click", () => {
  const selectedItemId = domRefs.productSelect.value;

  handleAddToCart(selectedItemId, {
    productList: dataState.productList,
    appState,
    domRefs,
    functions: { findProductById, calculateCartTotals },
  });
});

domRefs.cartDisplay.addEventListener("click", event => {
  handleCartActions(event, {
    productList: dataState.productList,
    domRefs,
    functions: { findProductById, calculateCartTotals, updateSelectOptions },
  });
});
