import {
  applyBulkDiscount,
  calculateTuesdayDiscount,
  getProductDiscountRate,
} from "./discounts.js";
import {
  QUANTITY_DISCOUNT_THRESHOLD,
  PRODUCT_ONE,
  PRODUCT_TWO,
  PRODUCT_THREE,
  TOTAL_STOCK_WARNING_THRESHOLD,
} from "../constants.js";
import { updateTuesdayUI } from "./discounts.js";
import { cartSummary, discountInfo } from "../app.js";
import {
  renderBonusPoints,
  calculateBasePoints,
  calculateTuesdayBonus,
  calculateComboBonuses,
  calculateBulkBonus,
} from "./points.js";

/**
 * 장바구니 아이템의 스타일을 업데이트합니다
 * @param {HTMLElement} cartItem - 장바구니 DOM 요소
 * @param {number} quantity - 상품 수량
 */
export const updateItemStyles = (cartItem, quantity) => {
  const priceElements = cartItem.querySelectorAll(".text-lg, .text-xs");
  priceElements.forEach(element => {
    if (element.classList.contains("text-lg")) {
      element.style.fontWeight =
        quantity >= QUANTITY_DISCOUNT_THRESHOLD ? "bold" : "normal";
    }
  });
};

// ==================== Business Logic ====================

/**
 * 장바구니 아이템의 계산 데이터를 생성합니다 (상태 기반)
 * @param {Object} cartItem - 장바구니 아이템 객체 {id, quantity}
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object} 아이템 계산 정보
 */
export const calculateItemData = (cartItem, productList) => {
  const product = productList.find(product => product.id === cartItem.id);
  const quantity = cartItem.quantity;
  const itemTotal = product.price * quantity;
  const discount =
    quantity >= QUANTITY_DISCOUNT_THRESHOLD
      ? getProductDiscountRate(product.id)
      : 0;

  return {
    product,
    quantity,
    itemTotal,
    discount,
    cartItem,
  };
};

/**
 * 장바구니에 있는 상품 유형들을 확인합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object} 상품 유형 확인 결과
 */
export const getCartProductTypes = (cartItems, productList) => {
  return Array.from(cartItems).reduce(
    (types, node) => {
      const product = productList.find(product => product.id === node.id);
      if (!product) return types;

      return {
        ...types,
        hasKeyboard: types.hasKeyboard || product.id === PRODUCT_ONE,
        hasMouse: types.hasMouse || product.id === PRODUCT_TWO,
        hasMonitorArm: types.hasMonitorArm || product.id === PRODUCT_THREE,
      };
    },
    { hasKeyboard: false, hasMouse: false, hasMonitorArm: false }
  );
};

/**
 * 장바구니 전체 계산을 수행합니다 (let 제거, 함수형 패턴 적용)
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록
 * @param {Object} constants - 상수 객체
 * @returns {Object} 완전한 장바구니 계산 결과
 */
export const calculateCompleteCartTotals = (
  cartItems,
  productList,
  constants
) => {
  const {
    TUESDAY_DAY_NUMBER,
    TUESDAY_ADDITIONAL_DISCOUNT_RATE,
    POINTS_CALCULATION_BASE,
    LOW_STOCK_THRESHOLD,
  } = constants;

  const cartItemsData = cartItems.map(cartItem =>
    calculateItemData(cartItem, productList)
  );

  const {
    totalAmount: initialTotalAmount,
    itemCount,
    subtotal,
    itemDiscounts,
  } = cartItemsData.reduce(
    (acc, itemData) => {
      const { quantity, itemTotal, discount, product } = itemData;
      const discountedTotal = itemTotal * (1 - discount);

      return {
        totalAmount: acc.totalAmount + discountedTotal,
        itemCount: acc.itemCount + quantity,
        subtotal: acc.subtotal + itemTotal,
        itemDiscounts:
          discount > 0
            ? [
                ...acc.itemDiscounts,
                { name: product.name, discount: discount * 100 },
              ]
            : acc.itemDiscounts,
      };
    },
    { totalAmount: 0, itemCount: 0, subtotal: 0, itemDiscounts: [] }
  );

  const originalTotal = subtotal;

  // 대량구매 할인 적용
  const bulkDiscount = applyBulkDiscount(itemCount, subtotal);
  const afterBulkAmount = bulkDiscount
    ? bulkDiscount.totalAmount
    : initialTotalAmount;

  // 화요일 할인 적용
  const tuesdayDiscount = calculateTuesdayDiscount(
    afterBulkAmount,
    originalTotal,
    TUESDAY_DAY_NUMBER,
    TUESDAY_ADDITIONAL_DISCOUNT_RATE
  );
  const finalTotalAmount = tuesdayDiscount.totalAmount;
  const discRate = tuesdayDiscount.discRate;

  // 재고 부족 상품 목록
  const lowStockItems = productList
    .filter(item => item.quantity < LOW_STOCK_THRESHOLD)
    .map(item =>
      item.quantity > 0
        ? `${item.name}: 재고 부족 (${item.quantity}개 남음)`
        : `${item.name}: 품절`
    );

  // 적립 포인트 계산
  const earnedPoints = Math.floor(finalTotalAmount / POINTS_CALCULATION_BASE);

  return {
    totalAmount: finalTotalAmount,
    itemCount,
    originalTotal,
    subtotal,
    discRate,
    isTuesday: tuesdayDiscount.isTuesday,
    itemDiscounts,
    bulkDiscount,
    lowStockItems,
    earnedPoints,
    cartItemsData,
  };
};

// ==================== UI Updates ====================

/**
 * 장바구니 아이템들의 스타일을 일괄 업데이트합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록
 */
export const updateCartItemStyles = cartItems => {
  Array.from(cartItems).forEach(cartItem => {
    const quantityElement = cartItem.querySelector(".quantity-number");
    const quantity = parseInt(quantityElement.textContent);
    updateItemStyles(cartItem, quantity);
  });
};

/**
 * 장바구니 내 상품들의 가격 정보를 업데이트합니다
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {Array} productList - 상품 목록
 * @param {Function} findProductById - 상품 조회 함수
 * @param {Function} getProductDisplayInfo - 상품 표시 정보 생성 함수
 * @param {Function} calculateCartTotals - 장바구니 총액 계산 함수
 */
export const updatePricesInCart = (
  cartItems,
  productList,
  findProductById,
  getProductDisplayInfo,
  calculateCartTotals
) => {
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
 * 장바구니 계산 결과를 기반으로 모든 UI를 업데이트합니다
 * @param {Object} calculationResult - 계산 결과 객체
 * @param {Object} domRefs - DOM 참조 객체
 * @param {Object} appState - 앱 상태 (업데이트용)
 * @param {Array} productList - 상품 목록 (포인트 계산용)
 */
export const updateCartTotalsDisplay = (
  calculationResult,
  domRefs,
  appState,
  productList
) => {
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
    cartItemsData,
  } = calculationResult;

  // 직접 import된 함수들 사용

  // === 상태 업데이트 ===
  appState.totalAmount = totalAmount;
  appState.itemCount = itemCount;

  // === 화요일 UI 업데이트 ===
  updateTuesdayUI(isTuesday);

  // === DOM 요소 참조 ===
  const {
    itemCountElement,
    summaryDetailsElement: summaryDetails,
    loyaltyPointsElement,
    discountInfoElement,
  } = domRefs;

  summaryDetails.innerHTML = "";
  discountInfoElement.innerHTML = "";

  // === Summary Details 렌더링 ===
  if (subtotal > 0) {
    const summaryItems = cartItemsData
      .map(itemData => {
        const { product, quantity, itemTotal } = itemData;
        return `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
      })
      .join("");

    summaryDetails.innerHTML = cartSummary(summaryItems, subtotal);

    // 개별 상품 할인 정보 표시
    if (itemDiscounts.length > 0) {
      const discountDetails = itemDiscounts
        .map(
          item =>
            `<div class="text-2xs text-green-600">• ${item.name}: ${item.discount}% 할인</div>`
        )
        .join("");

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

  // === 총액 및 포인트 정보 ===
  const totalElement = domRefs.cartTotalElement.querySelector(".text-2xl");
  if (totalElement) {
    totalElement.textContent = "₩" + Math.round(totalAmount).toLocaleString();
  }

  // 적립 포인트 표시
  if (loyaltyPointsElement) {
    loyaltyPointsElement.textContent =
      earnedPoints > 0 ? `적립 포인트: ${earnedPoints}p` : "적립 포인트: 0p";
    loyaltyPointsElement.style.display = "block";
  }

  // 할인 정보 표시
  if (discRate > 0 && totalAmount > 0) {
    const savedAmount = originalTotal - totalAmount;
    discountInfoElement.innerHTML = discountInfo(discRate, savedAmount);
  }

  // === 아이템 개수 및 상태 표시 ===
  if (itemCountElement) {
    const previousItemCount = parseInt(
      itemCountElement.textContent.match(/\d+/) || 0
    );
    itemCountElement.textContent = "🛍️ " + itemCount + " items in cart";
    if (previousItemCount !== itemCount) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }

  // === 재고 정보 표시 ===
  const stockMessage = lowStockItems.join("\n");
  domRefs.stockInformation.textContent = stockMessage;

  // === 보너스 포인트 렌더링 ===
  renderBonusPoints(
    domRefs.cartDisplay.children,
    totalAmount,
    itemCount,
    productList,
    appState,
    calculateBasePoints,
    calculateTuesdayBonus,
    calculateComboBonuses,
    calculateBulkBonus,
    getCartProductTypes,
    domRefs
  );
};

// ==================== Event Handlers ====================

/**
 * 장바구니 아이템 추가 로직
 * @param {string} selectedItemId - 선택된 상품 ID
 * @param {Object} dependencies - 필요한 의존성들
 * @returns {Object} 처리 결과
 */
export const handleAddToCart = (selectedItemId, dependencies) => {
  const {
    productList,
    appState,
    dataState,
    functions: { findProductById, calculateCartTotals, updateCartDisplay },
  } = dependencies;

  const selectedProduct = findProductById(selectedItemId, productList);

  if (!selectedItemId || !selectedProduct) {
    return { success: false, reason: "invalid_product" };
  }

  if (selectedProduct.quantity <= 0) {
    return { success: false, reason: "out_of_stock" };
  }

  const existingItem = dataState.cartItems.find(
    item => item.id === selectedProduct.id
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + 1;

    if (newQuantity <= selectedProduct.quantity + existingItem.quantity) {
      dataState.cartItems = dataState.cartItems.map(item =>
        item.id === selectedProduct.id
          ? { ...item, quantity: newQuantity }
          : item
      );
      selectedProduct.quantity--;
      updateCartDisplay();
    } else {
      alert("재고가 부족합니다.");
      return { success: false, reason: "insufficient_stock" };
    }
  } else {
    dataState.cartItems.push({ id: selectedProduct.id, quantity: 1 });
    selectedProduct.quantity--;
    updateCartDisplay();
  }

  calculateCartTotals();
  appState.lastSelectedItem = selectedItemId;

  return { success: true, product: selectedProduct };
};

/**
 * 장바구니 액션 처리 로직
 * @param {Event} event - 클릭 이벤트
 * @param {Object} dependencies - 필요한 의존성들
 * @returns {Object} 처리 결과
 */
export const handleCartActions = (event, dependencies) => {
  const {
    productList,
    domRefs,
    dataState,
    functions: {
      findProductById,
      calculateCartTotals,
      updateSelectOptions,
      updateCartDisplay,
    },
  } = dependencies;

  const target = event.target;
  const isQuantityButton = target.classList.contains("quantity-change");
  const isRemoveButton = target.classList.contains("remove-item");

  if (!isQuantityButton && !isRemoveButton) {
    return { success: false, reason: "invalid_target" };
  }

  const productId = target.dataset.productId;
  const product = findProductById(productId, productList);

  if (!product) {
    return { success: false, reason: "product_not_found" };
  }

  if (isQuantityButton) {
    const quantityChange = parseInt(target.dataset.change);
    const currentCartItem = dataState.cartItems.find(
      item => item.id === productId
    );

    if (!currentCartItem) {
      return { success: false, reason: "cart_item_not_found" };
    }

    const currentQuantity = currentCartItem.quantity;
    const newQuantity = currentQuantity + quantityChange;

    if (newQuantity > 0 && newQuantity <= product.quantity + currentQuantity) {
      dataState.cartItems = dataState.cartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      product.quantity -= quantityChange;
      updateCartDisplay();
    } else if (newQuantity <= 0) {
      dataState.cartItems = dataState.cartItems.filter(
        item => item.id !== productId
      );
      product.quantity += currentQuantity;
      updateCartDisplay();
    } else {
      alert("재고가 부족합니다.");
      return { success: false, reason: "insufficient_stock" };
    }

    calculateCartTotals();
    updateSelectOptions(
      productList,
      domRefs.productSelect,
      TOTAL_STOCK_WARNING_THRESHOLD
    );
    return { success: true, action: "quantity_change", product };
  }

  if (isRemoveButton) {
    const currentCartItem = dataState.cartItems.find(
      item => item.id === productId
    );

    if (!currentCartItem) {
      return { success: false, reason: "cart_item_not_found" };
    }

    const removedQuantity = currentCartItem.quantity;
    product.quantity += removedQuantity;

    dataState.cartItems = dataState.cartItems.filter(
      item => item.id !== productId
    );
    updateCartDisplay();
  }

  calculateCartTotals();
  updateSelectOptions(
    productList,
    domRefs.productSelect,
    TOTAL_STOCK_WARNING_THRESHOLD
  );

  return {
    success: true,
    action: isQuantityButton ? "quantity_change" : "remove",
    product,
  };
};
