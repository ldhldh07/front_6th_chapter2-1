import { updateItemStyles } from '../../../shared/index.js';
import { updateTuesdayUI } from '../../discounts/index.js';

/**
 * 장바구니 아이템들의 스타일을 일괄 업데이트합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록
 */
export const updateCartItemStyles = (cartItems, productList) => {
  Array.from(cartItems).forEach(cartItem => {
    const quantityElement = cartItem.querySelector(".quantity-number");
    const quantity = parseInt(quantityElement.textContent);
    updateItemStyles(cartItem, quantity);
  });
};

/**
 * 장바구니 요약 정보를 업데이트합니다
 * @param {Object} cartData - 장바구니 계산 결과
 */
export const updateCartSummary = (cartData) => {
  // 아이템 개수 표시
  const itemCountElement = document.getElementById("item-count");
  if (itemCountElement) {
    itemCountElement.textContent = `🛍️ ${cartData.itemCount} items in cart`;
  }
  
  // 화요일 특별 할인 UI
  updateTuesdayUI(cartData.isTuesday);
  
  // 할인 정보 표시
  updateDiscountInfo(cartData.itemDiscounts, cartData.bulkDiscount);
  
  // 총액 표시
  updateTotalDisplay(cartData.totalAmount);
};

/**
 * 할인 정보를 표시합니다
 * @param {Array} itemDiscounts - 개별 상품 할인 목록
 * @param {Object|null} bulkDiscount - 대량구매 할인 정보
 */
const updateDiscountInfo = (itemDiscounts, bulkDiscount) => {
  const discountInfo = document.getElementById("discount-info");
  if (!discountInfo) return;
  
  let discountText = "";
  
  if (itemDiscounts.length > 0) {
    discountText += itemDiscounts
      .map(item => `${item.name}: ${item.discount}% 할인`)
      .join(", ") + "<br>";
  }
  
  if (bulkDiscount) {
    discountText += `대량구매 할인: ${(bulkDiscount.discRate * 100).toFixed(0)}%`;
  }
  
  discountInfo.innerHTML = discountText;
};

/**
 * 총액을 표시합니다
 * @param {number} totalAmount - 총 금액
 */
const updateTotalDisplay = (totalAmount) => {
  const cartTotal = document.querySelector("#cart-total .text-2xl");
  if (cartTotal) {
    cartTotal.textContent = `₩${Math.round(totalAmount).toLocaleString()}`;
  }
};

/**
 * 장바구니 내 상품들의 가격 정보를 업데이트합니다 (main.basic.js에서 이전)
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록  
 * @param {Function} findProductById - 상품 조회 함수
 * @param {Function} getProductDisplayInfo - 상품 표시 정보 생성 함수
 * @param {Function} calculateCartTotals - 장바구니 총액 계산 함수
 */
export const updatePricesInCart = (cartItems, productList, findProductById, getProductDisplayInfo, calculateCartTotals) => {
  Array.from(cartItems).forEach(cartItem => {
    const productId = cartItem.id;
    const product = findProductById(productId, productList);
    
    if (!product) return;
    
    const priceElement = cartItem.querySelector(".text-lg");
    const nameElement = cartItem.querySelector("h3");
    const displayInfo = getProductDisplayInfo(product);
    
    priceElement.innerHTML = displayInfo.priceHtml;
    nameElement.textContent = displayInfo.nameText;
  });
  
  calculateCartTotals();
};

/**
 * 장바구니 계산 결과를 기반으로 모든 UI를 업데이트합니다 (main.basic.js에서 UI 로직 분리)
 * @param {Object} calculationResult - 계산 결과 객체
 * @param {Object} domRefs - DOM 참조 객체
 * @param {Object} appState - 앱 상태 (업데이트용)
 * @param {Object} dependencies - 필요한 의존성 함수들
 */
export const updateCartTotalsDisplay = (calculationResult, domRefs, appState, dependencies) => {
  const {
    totalAmount,
    itemCount,
    originalTotal,
    subtotal,
    discRate,
    isTuesday,
    itemDiscounts,
    lowStockItems,
    earnedPoints,
    cartItemsData
  } = calculationResult;

  const {
    updateItemStyles,
    updateTuesdayUI,
    cartSummaryTemplate,
    discountInfoTemplate,
    renderBonusPoints,
    calculateBasePoints,
    calculateTuesdayBonus,
    calculateComboBonuses,
    calculateBulkBonus,
    getCartProductTypes
  } = dependencies;

  // === 1. 상태 업데이트 ===
  appState.totalAmount = totalAmount;
  appState.itemCount = itemCount;

  // === 2. 아이템 스타일 업데이트 ===
  cartItemsData.forEach(itemData => {
    updateItemStyles(itemData.cartItem, itemData.quantity);
  });

  // === 3. 화요일 UI 업데이트 ===
  updateTuesdayUI(isTuesday);

  // === 4. DOM 요소 선언 및 초기화 ===
  const itemCountElement = document.getElementById("item-count");
  const summaryDetails = document.getElementById("summary-details");
  const loyaltyPointsElement = document.getElementById("loyalty-points");
  const discountInfoElement = document.getElementById("discount-info");
  
  summaryDetails.innerHTML = "";
  discountInfoElement.innerHTML = "";

  // === 5. Summary Details 렌더링 ===
  if (subtotal > 0) {
    const summaryItems = cartItemsData.map(itemData => {
      const { product, quantity, itemTotal } = itemData;
      return `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }).join('');

    summaryDetails.innerHTML = cartSummaryTemplate(summaryItems, subtotal);

    // 개별 상품 할인 정보 표시
    if (itemDiscounts.length > 0) {
      const discountDetails = itemDiscounts.map(item => 
        `<div class="text-2xs text-green-600">• ${item.name}: ${item.discount}% 할인</div>`
      ).join('');
      
      summaryDetails.innerHTML += `
        <div class="bg-green-50 rounded-md p-2 mt-2">
          <div class="text-2xs font-medium text-green-800 mb-1">개별 상품 할인</div>
          ${discountDetails}
        </div>
      `;
    }

    // 배송비 정보 추가
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }

  // === 6. 총액 및 포인트 정보 ===
  const totalElement = domRefs.cartTotalElement.querySelector(".text-2xl");
  if (totalElement) {
    totalElement.textContent = "₩" + Math.round(totalAmount).toLocaleString();
  }

  // 적립 포인트 표시
  if (loyaltyPointsElement) {
    loyaltyPointsElement.textContent = earnedPoints > 0 
      ? `적립 포인트: ${earnedPoints}p` 
      : "적립 포인트: 0p";
    loyaltyPointsElement.style.display = "block";
  }

  // 할인 정보 표시
  if (discRate > 0 && totalAmount > 0) {
    const savedAmount = originalTotal - totalAmount;
    discountInfoElement.innerHTML = discountInfoTemplate(discRate, savedAmount);
  }

  // === 7. 아이템 개수 및 상태 표시 ===
  if (itemCountElement) {
    const previousItemCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = "🛍️ " + itemCount + " items in cart";
    if (previousItemCount !== itemCount) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }

  // === 8. 재고 정보 표시 ===
  const stockMessage = lowStockItems.join('\n');
  domRefs.stockInformation.textContent = stockMessage;
  
  // === 9. 보너스 포인트 렌더링 ===
  renderBonusPoints(
    domRefs.cartDisplay.children,
    totalAmount,
    itemCount,
    dependencies.productList,
    appState,
    calculateBasePoints,
    calculateTuesdayBonus,
    calculateComboBonuses,
    calculateBulkBonus,
    getCartProductTypes
  );
}; 