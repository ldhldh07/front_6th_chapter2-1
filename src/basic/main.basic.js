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

import { renderApp, renderCartItems } from "./app.js";
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
  cartItems: [],
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

/**
 * 장바구니 상태를 업데이트하고 재렌더링합니다 (선언적 방식)
 */
const updateCartDisplay = () => {
  if (domRefs.cartDisplay.children.length === dataState.cartItems.length) {
    // 기존 DOM 활용: 수량만 업데이트
    dataState.cartItems.forEach(item => {
      const itemElement = document.getElementById(item.id);
      if (itemElement) {
        const quantityElement = itemElement.querySelector(".quantity-number");
        if (quantityElement) {
          quantityElement.textContent = item.quantity;
        }
      }
    });
  } else {
    // 전체 재생성: 아이템 추가/제거 시
    const cartHTML = renderCartItems(
      dataState.cartItems,
      dataState.productList
    );
    domRefs.cartDisplay.innerHTML = cartHTML;
  }
};

/**
 * 장바구니에 아이템을 추가합니다
 */
const addCartItem = (productId, quantity = 1) => {
  const existingItemIndex = dataState.cartItems.findIndex(
    item => item.id === productId
  );

  if (existingItemIndex >= 0) {
    // 기존 아이템 수량 증가
    dataState.cartItems[existingItemIndex].quantity += quantity;
  } else {
    // 새 아이템 추가
    dataState.cartItems.push({ id: productId, quantity });
  }

  updateCartDisplay();
};

/**
 * 장바구니 아이템 수량을 변경합니다
 */
const updateCartItemQuantity = (productId, newQuantity) => {
  if (newQuantity <= 0) {
    // 아이템 제거
    dataState.cartItems = dataState.cartItems.filter(
      item => item.id !== productId
    );
  } else {
    // 수량 업데이트
    const itemIndex = dataState.cartItems.findIndex(
      item => item.id === productId
    );
    if (itemIndex >= 0) {
      dataState.cartItems[itemIndex].quantity = newQuantity;
    }
  }

  updateCartDisplay();
};

/**
 * 장바구니에서 아이템을 제거합니다
 */
const removeCartItem = productId => {
  dataState.cartItems = dataState.cartItems.filter(
    item => item.id !== productId
  );
  updateCartDisplay();
};

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
  const calculationResult = calculateCompleteCartTotals(
    dataState.cartItems,
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
    dataState,
    functions: {
      findProductById,
      calculateCartTotals,
      addCartItem,
      updateCartDisplay,
    },
  });
});

domRefs.cartDisplay.addEventListener("click", event => {
  handleCartActions(event, {
    productList: dataState.productList,
    domRefs,
    dataState,
    functions: {
      findProductById,
      calculateCartTotals,
      updateSelectOptions,
      updateCartItemQuantity,
      removeCartItem,
      updateCartDisplay,
    },
  });
});
