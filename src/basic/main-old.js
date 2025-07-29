

const {
  QUANTITY_DISCOUNT_THRESHOLD
} = constants;

// ==================== Shared Utilities (통합) ====================

const specialProperties = ["checked", "selected", "disabled", "readOnly"];

/**
 * DOM 요소 생성 헬퍼
 * @param {string} tagName - 태그명
 * @param {Object} props - 속성 객체
 * @param {...any} children - 자식 요소들
 * @returns {Element} DOM 요소
 */
const createElement = (tagName, props = {}, ...children) => {
  const element = document.createElement(tagName);

  if (props) {
    applyProps(element, props);
  }

  if (children && children.length > 0) {
    appendChildren(element, children);
  }

  return element;
};

/**
 * 요소에 props 적용
 */
const applyProps = (element, props) => {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
    } else if (key === "className") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key === "textContent") {
      element.textContent = value;
    } else if (specialProperties.includes(key)) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });
};

/**
 * 자식 요소들 추가
 */
const appendChildren = (element, children) => {
  children.forEach(child => {
    if (child === null || child === undefined) return;
    
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else if (Array.isArray(child)) {
      appendChildren(element, child);
    } else if (child && child.nodeType === 1) {
      element.appendChild(child);
    }
  });
};

/**
 * DOM 참조 설정 헬퍼
 */
const setDOMRefs = (target, selectors) => {
  Object.entries(selectors).forEach(([key, config]) => {
    if (config.container && config.selector) {
      target[key] = config.container.querySelector(config.selector);
    } else if (typeof config === "string") {
      target[key] = document.querySelector(config);
    }
  });
};

/**
 * 장바구니 아이템의 스타일을 업데이트합니다
 * @param {HTMLElement} cartItem - 장바구니 DOM 요소
 * @param {number} quantity - 상품 수량
 */
const updateItemStyles = (cartItem, quantity) => {
  const priceElements = cartItem.querySelectorAll(".text-lg, .text-xs");
  priceElements.forEach(function (elem) {
    if (elem.classList.contains("text-lg")) {
      elem.style.fontWeight = quantity >= QUANTITY_DISCOUNT_THRESHOLD ? "bold" : "normal";
    }
  });
};

/**
 * 매뉴얼 시스템 컴포넌트
 * @param {Object} dependencies - 필요한 의존성들
 * @returns {Object} 매뉴얼 시스템 요소들
 */
const createManualSystem = (dependencies) => {
  const { createElement, manualGuideTemplate, helpToggleTemplate } = dependencies;

  const manualColumn = createElement("div", {
    className: "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300",
    innerHTML: manualGuideTemplate
  });

  const manualOverlay = createElement("div", {
    className: "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300",
    onclick: (event) => {
      if (event.target === manualOverlay) {
        manualOverlay.classList.add("hidden");
        manualColumn.classList.add("translate-x-full");
      }
    }
  }, [manualColumn]);

  const manualToggle = createElement("button", {
    className: "fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50",
    innerHTML: helpToggleTemplate,
    onclick: () => {
      manualOverlay.classList.toggle("hidden");
      manualColumn.classList.toggle("translate-x-full");
    }
  });

  return { manualToggle, manualOverlay };
};

// ==================== Templates (통합) ====================

/**
 * 헤더 템플릿
 */
const headerTemplate = `
  <div class="mb-8">
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  </div>
`;

/**
 * 주문 요약 템플릿
 */
const orderSummaryTemplate = `
  <div class="bg-black text-white p-8 flex flex-col">
    <h2 class="text-xs font-medium mb-5 tracking-extra-wide uppercase">Order Summary</h2>
    <div class="flex-1 flex flex-col">
      <div id="summary-details" class="space-y-3"></div>
      <div class="mt-auto">
        <div id="discount-info" class="mb-4"></div>
        <div id="cart-total" class="pt-5 border-t border-white/10">
          <div class="flex justify-between items-baseline">
            <span class="text-sm uppercase tracking-wider">Total</span>
            <div class="text-2xl tracking-tight">₩0</div>
          </div>
          <div id="loyalty-points" class="text-xs text-blue-400 mt-2 text-right">적립 포인트: 0p</div>
        </div>
        <div id="tuesday-special" class="mt-4 p-3 bg-white/10 rounded-lg hidden">
          <div class="flex items-center gap-2">
            <span class="text-2xs">🎉</span>
            <span class="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
          </div>
        </div>
      </div>
    </div>
    <button class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  </div>
\`;

/**
 * 도움말 토글 버튼 템플릿
 */
const helpToggleTemplate = \`
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
</svg>
\`;

/**
 * 이용 안내 매뉴얼 템플릿
 */
const manualGuideTemplate = \`
<button class="absolute top-4 right-4 text-gray-500 hover:text-black" onclick="document.querySelector('.fixed.inset-0').classList.add('hidden'); this.parentElement.classList.add('translate-x-full')">
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
  </svg>
</button>
<h2 class="text-xl font-bold mb-4">📖 이용 안내</h2>

<div class="mb-6">
  <h3 class="text-base font-bold mb-3">💰 할인 정책</h3>
  <div class="space-y-3">
    <div class="bg-gray-100 rounded-lg p-3">
      <p class="font-semibold text-sm mb-1">개별 상품</p>
      <p class="text-gray-700 text-xs pl-2">
        • 키보드 10개↑: 10%<br>
        • 마우스 10개↑: 15%<br>
        • 모니터암 10개↑: 20%<br>
        • 스피커 10개↑: 25%
      </p>
    </div>
   
    <div class="bg-gray-100 rounded-lg p-3">
      <p class="font-semibold text-sm mb-1">전체 수량</p>
      <p class="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
    </div>
   
    <div class="bg-gray-100 rounded-lg p-3">
      <p class="font-semibold text-sm mb-1">특별 할인</p>
      <p class="text-gray-700 text-xs pl-2">
        • 화요일: +10%<br>
        • ⚡번개세일: 20%<br>
        • 💝추천할인: 5%
      </p>
    </div>
  </div>
</div>

<div class="mb-6">
  <h3 class="text-base font-bold mb-3">🎁 포인트 적립</h3>
  <div class="space-y-3">
    <div class="bg-gray-100 rounded-lg p-3">
      <p class="font-semibold text-sm mb-1">기본</p>
      <p class="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
    </div>
   
    <div class="bg-gray-100 rounded-lg p-3">
      <p class="font-semibold text-sm mb-1">추가</p>
      <p class="text-gray-700 text-xs pl-2">
        • 화요일: 2배<br>
        • 키보드+마우스: +50p<br>
        • 풀세트: +100p<br>
        • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
      </p>
    </div>
  </div>
</div>

<div class="border-t border-gray-200 pt-4 mt-4">
  <p class="text-xs font-bold mb-1">💡 TIP</p>
  <p class="text-2xs text-gray-600 leading-relaxed">
    • 화요일 대량구매 = MAX 혜택<br>
    • ⚡+💝 중복 가능<br>
    • 상품4 = 품절
  </p>
</div>
\`;

/**
 * 장바구니 요약 정보 템플릿 (동적)
 */
const cartSummaryTemplate = (summaryItems, subtotal) => \`
\${summaryItems}
<div class="border-t border-gray-200 my-2"></div>
<div class="flex justify-between text-sm font-medium">
  <span>소계</span>
  <span>₩\${subtotal.toLocaleString()}</span>
</div>
\`;

/**
 * 할인 정보 템플릿 (동적)
 */
const discountInfoTemplate = (discRate, savedAmount) => \`
<div class="bg-green-500/20 rounded-lg p-3">
  <div class="flex justify-between items-center mb-1">
    <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
    <span class="text-sm font-medium text-green-400">\${(discRate * 100).toFixed(1)}%</span>
  </div>
  <div class="text-2xs text-gray-300">₩\${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
</div>
\`;

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
`;