/**
 * UI 렌더링 통합 모듈 - 점진적 접근
 * 기존 기능 100% 호환 + 여기저기 흩어진 UI 요소들 통합
 */

// ==================== 메인 템플릿들 (main.basic.js에서 이동) ====================

/**
 * 헤더
 */
export const header = `
  <div class="mb-8">
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  </div>
`;

/**
 * 주문 요약
 */
export const orderSummary = `
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
    <button 
      class="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
      data-action="checkout"
    >
      Proceed to Checkout
    </button>
    <p class="mt-4 text-2xs text-white/60 text-center leading-relaxed">
      Free shipping on all orders.<br>
      <span id="points-notice">Earn loyalty points with purchase.</span>
    </p>
  </div>
`;

/**
 * 도움말 토글 버튼
 */
export const helpToggle = `
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
</svg>
`;

/**
 * 이용 안내 매뉴얼
 */
export const manualGuide = `
<button 
  class="absolute top-4 right-4 text-gray-500 hover:text-black" 
  data-action="close-manual"
>
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
`;

// ==================== 동적 템플릿들 ====================

/**
 * 장바구니 요약 정보 (동적)
 */
export const cartSummary = (summaryItems, subtotal) => `
${summaryItems}
<div class="border-t border-gray-200 my-2"></div>
<div class="flex justify-between text-sm font-medium">
  <span>소계</span>
  <span>₩${subtotal.toLocaleString()}</span>
</div>
`;

/**
 * 할인 정보 (동적)
 */
export const discountInfo = (discRate, savedAmount) => `
<div class="bg-green-500/20 rounded-lg p-3">
  <div class="flex justify-between items-center mb-1">
    <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
    <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
  </div>
  <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
</div>
`;

// ==================== 장바구니 아이템 템플릿 (cart.js에서 이동) ====================

/**
 * 장바구니 아이템 (동적)
 * @param {Object} selectedProduct - 선택된 상품 정보
 * @returns {string} HTML
 */
/**
 * 단일 장바구니 아이템 HTML 생성 (수량 포함)
 * @param {Object} product - 상품 정보
 * @param {number} quantity - 장바구니 수량
 * @returns {string} 장바구니 아이템 HTML
 */
export const cartItem = (product, quantity = 1) => {
  const saleStates = {
    both: "⚡💝",
    lightning: "⚡",
    suggest: "💝",
    none: "",
  };

  const priceColors = {
    both: "text-purple-600",
    lightning: "text-red-500",
    suggest: "text-blue-500",
    none: "text-black",
  };

  const getSaleState = (onSale, suggestSale) => {
    if (onSale && suggestSale) return "both";
    if (onSale) return "lightning";
    if (suggestSale) return "suggest";
    return "none";
  };

  const saleState = getSaleState(product.onSale, product.suggestSale);
  const saleIcon = saleStates[saleState];

  const priceDisplay =
    saleState !== "none"
      ? `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="${priceColors[saleState]}">₩${product.price.toLocaleString()}</span>`
      : `₩${product.price.toLocaleString()}`;

  const itemTotal = product.price * quantity;

  return `
<div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
  <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
</div>
<div>
  <h3 class="text-base font-normal mb-1 tracking-tight">${saleIcon}${product.name}</h3>
  <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
  <p class="text-xs text-black mb-3">${priceDisplay}</p>
  <div class="flex items-center gap-4">
    <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="-1">−</button>
    <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">${quantity}</span>
    <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${product.id}" data-change="1">+</button>
  </div>
</div>
<div class="text-right">
  <div class="text-lg mb-2 tracking-tight tabular-nums">₩${itemTotal.toLocaleString()}</div>
  <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${product.id}">Remove</a>
</div>
`;
};

/**
 * 장바구니 전체 아이템들을 렌더링합니다 (선언적 방식)
 * @param {Array} cartItems - 장바구니 아이템 배열 [{id, quantity}, ...]
 * @param {Array} products - 전체 상품 목록
 * @returns {string} 장바구니 HTML
 */
export const renderCartItems = (cartItems, products) => {
  if (!cartItems || cartItems.length === 0) {
    return ""; // 빈 장바구니
  }

  return cartItems
    .map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return "";

      return `<div id="${item.id}" class="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0">${cartItem(product, item.quantity)}</div>`;
    })
    .filter(Boolean) // 빈 문자열 제거
    .join("");
};

/**
 * 상품 셀렉터
 */
export const productSelector = `
  <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
    <div class="mb-6 pb-6 border-b border-gray-200">
      <select 
        id="product-select" 
        class="w-full p-3 border border-gray-300 rounded-lg text-base mb-3"
        data-action="select-product"
      >
        <!-- Options will be populated by JavaScript -->
      </select>
      <button 
        id="add-to-cart" 
        class="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all"
        data-action="add-to-cart"
      >
        Add to Cart
      </button>
      <div id="stock-status" class="text-xs text-red-500 mt-3 whitespace-pre-line">
        <!-- Stock information will be populated by JavaScript -->
      </div>
    </div>
    <div id="cart-items" data-action-container="cart-actions">
      <!-- Cart items will be populated by JavaScript -->
    </div>
  </div>
`;

/**
 * 전체 앱 구조를 HTML로 생성 (innerHTML 기반)
 * @returns {string} 전체 앱 HTML
 */
export const createAppHTML = () => {
  return `
    <div class="app-container">
      ${header}
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
        ${productSelector}
        ${orderSummary}
      </div>
      <button 
        class="fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50"
        data-action="toggle-manual"
      >
        ${helpToggle}
      </button>
      <div 
        class="fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300"
        id="manual-overlay"
      >
        <div class="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300" id="manual-panel">
          ${manualGuide}
        </div>
      </div>
    </div>
  `;
};

/**
 * innerHTML 기반 전체 앱 렌더링
 * @param {HTMLElement} rootElement - 루트 DOM 요소
 */
export const renderApp = rootElement => {
  rootElement.innerHTML = createAppHTML();
};

// ======================== 이벤트 위임 시스템  ========================

/**
 * 이벤트 위임 설정 - HTML data 속성 기반
 * @param {HTMLElement} rootElement - 루트 요소
 * @param {Object} handlers - 이벤트 핸들러 객체
 */
export const setupEventDelegation = (rootElement, handlers = {}) => {
  // 클릭 이벤트 위임
  rootElement.addEventListener("click", event => {
    const action = event.target.dataset.action;
    const productId = event.target.dataset.productId;
    const change = event.target.dataset.change;

    if (action && handlers[action]) {
      event.preventDefault();

      // 매개변수가 필요한 핸들러들
      if (productId || change) {
        handlers[action](productId, change);
        return;
      }

      handlers[action](event);
    }
  });

  // 변경 이벤트 위임 (select 등)
  rootElement.addEventListener("change", event => {
    const action = event.target.dataset.action;

    if (action && handlers[action]) {
      handlers[action](event);
    }
  });
};

/**
 * 매뉴얼 표시/숨김 처리
 * @param {boolean} show - 표시 여부
 */
export const toggleManual = show => {
  const overlay = document.getElementById("manual-overlay");
  const panel = document.getElementById("manual-panel");

  if (!overlay || !panel) return;

  if (show) {
    overlay.classList.remove("hidden");
    setTimeout(() => panel.classList.remove("translate-x-full"), 10);
    return;
  }

  panel.classList.add("translate-x-full");
  setTimeout(() => overlay.classList.add("hidden"), 300);
};
