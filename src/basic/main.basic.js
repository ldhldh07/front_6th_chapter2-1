import * as constants from './constants/index.js';
import { initializeProducts, findProductById, getOptionData } from './features/products/index.js';
import { getProductDiscountRate, applyBulkDiscount, calculateTuesdayDiscount, updateTuesdayUI } from './features/discounts/index.js';
import { calculateItemData, getCartProductTypes } from './features/cart/index.js';
import { updateItemStyles, setDOMRefs, createElement } from './shared/index.js';
import { calculateBasePoints, calculateTuesdayBonus, calculateComboBonuses, calculateBulkBonus, displayPointsInfo, hidePointsIfEmpty } from './features/points/index.js';
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

// 데이터 상태 객체 (let → const 개선)
const dataState = {
  productList: null
};

// DOM 참조 객체 (let → const 개선)
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
  setupEventTimers();
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

  const createManualSystem = () => {
    const manualColumn = createElement("div", {
      className: "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300",
      innerHTML: manualGuideTemplate
    });

    const manualOverlay = createElement("div", {
      className: "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300",
      onclick: function (e) {
        if (e.target === manualOverlay) {
          manualOverlay.classList.add("hidden");
          manualColumn.classList.add("translate-x-full");
        }
      }
    }, [manualColumn]);

    const manualToggle = createElement("button", {
      className: "fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50",
      innerHTML: helpToggleTemplate,
      onclick: function () {
        manualOverlay.classList.toggle("hidden");
        manualColumn.classList.toggle("translate-x-full");
      }
    });

    return { manualToggle, manualOverlay };
  };

  const { manualToggle, manualOverlay } = createManualSystem();

  const appStructure = createElement("div", { className: "app-container" }, [
    header,
    gridContainer,
    manualToggle,
    manualOverlay
  ]);

  root.appendChild(appStructure);
  updateSelectOptions();
  calculateCartTotals();
};

const calculateCartTotals = () => {
  appState.totalAmount = 0;
  appState.itemCount = 0;
  const cartItems = domRefs.cartDisplay.children;
  const itemDiscounts = [];
  

  const subtotal = Array.from(cartItems).reduce((sum, cartItem) => {
    const itemData = calculateItemData(cartItem, dataState.productList);
    const product = itemData.product;
    const quantity = itemData.quantity;
    const itemTotal = itemData.itemTotal;
    const discount = itemData.discount;

    appState.itemCount += quantity;

    const itemDiv = cartItem;
    updateItemStyles(itemDiv, quantity);

    if (discount > 0) {
      itemDiscounts.push({ name: product.name, discount: discount * 100 });
    }
    appState.totalAmount += itemTotal * (1 - discount);
    
    return sum + itemTotal;
  }, 0);
  
  const originalTotal = subtotal;
  

  const bulkDiscount = applyBulkDiscount(appState.itemCount, subtotal);
  if (bulkDiscount) {
    appState.totalAmount = bulkDiscount.totalAmount;
  }
  

  const tuesdayDiscount = calculateTuesdayDiscount(appState.totalAmount, originalTotal, TUESDAY_DAY_NUMBER, TUESDAY_ADDITIONAL_DISCOUNT_RATE);
  appState.totalAmount = tuesdayDiscount.totalAmount;
  const discRate = tuesdayDiscount.discRate;
  updateTuesdayUI(tuesdayDiscount.isTuesday);
  document.getElementById("item-count").textContent =
    "🛍️ " + appState.itemCount + " items in cart";
  const summaryDetails = document.getElementById("summary-details");
  summaryDetails.innerHTML = "";
  if (subtotal > 0) {
    const summaryItems = Array.from(cartItems).map(cartItem => {
      const itemData = calculateItemData(cartItem, dataState.productList);
      const product = itemData.product;
      const quantity = itemData.quantity;
      const itemTotal = itemData.itemTotal;
      return `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }).join('');

    summaryDetails.innerHTML = cartSummaryTemplate(summaryItems, subtotal);

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

    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
  const totalDiv = domRefs.cartTotalElement.querySelector(".text-2xl");
  if (totalDiv) {
    totalDiv.textContent = "₩" + Math.round(appState.totalAmount).toLocaleString();
  }
  const loyaltyPointsDiv = document.getElementById("loyalty-points");
  if (loyaltyPointsDiv) {
    const earnedPoints = Math.floor(appState.totalAmount / POINTS_CALCULATION_BASE);
    loyaltyPointsDiv.textContent = earnedPoints > 0 
      ? `적립 포인트: ${earnedPoints}p` 
      : "적립 포인트: 0p";
    loyaltyPointsDiv.style.display = "block";
  }
  const discountInfoDiv = document.getElementById("discount-info");
  discountInfoDiv.innerHTML = "";

  if (discRate > 0 && appState.totalAmount > 0) {
    const savedAmount = originalTotal - appState.totalAmount;
    discountInfoDiv.innerHTML = discountInfoTemplate(discRate, savedAmount);
  }
  const itemCountElement = document.getElementById("item-count");
  if (itemCountElement) {
    const previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = "🛍️ " + appState.itemCount + " items in cart";
    if (previousCount !== appState.itemCount) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }
  const stockMsg = dataState.productList
    .filter(item => item.quantity < LOW_STOCK_THRESHOLD)
    .map(item => item.quantity > 0 
      ? `${item.name}: 재고 부족 (${item.quantity}개 남음)`
      : `${item.name}: 품절`
    )
    .join('\n');

  domRefs.stockInformation.textContent = stockMsg;

  renderBonusPoints();
};

const setupEventTimers = () => {
  const lightningDelay = Math.random() * LIGHTNING_SALE_MAX_DELAY;
  setTimeout(() => {
    setInterval(function () {
      const luckyIndex = Math.floor(Math.random() * dataState.productList.length);
      const luckyItem = dataState.productList[luckyIndex];
      if (luckyItem.quantity > 0 && !luckyItem.onSale) {
        luckyItem.price = Math.round(
          luckyItem.originalPrice * (1 - LIGHTNING_SALE_DISCOUNT_RATE)
        );
        luckyItem.onSale = true;
        alert("⚡번개세일! " + luckyItem.name + "이(가) 20% 할인 중입니다!");
        updateSelectOptions();
        updatePricesInCart();
      }
    }, LIGHTNING_SALE_DURATION);
  }, lightningDelay);
  
  setTimeout(function () {
    setInterval(function () {
      if (domRefs.cartDisplay.children.length === 0) {
        return;
      }
      if (appState.lastSelectedItem) {
        const suggest = dataState.productList.find(product => 
          product.id !== appState.lastSelectedItem && 
          product.quantity > 0 && 
          !product.suggestSale
        );
        if (suggest) {
          alert(
            "💝 " +
              suggest.name +
              "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!"
          );

          suggest.price = Math.round(
            suggest.price * (1 - SUGGESTION_DISCOUNT_RATE)
          );
          suggest.suggestSale = true;
          updateSelectOptions();
          updatePricesInCart();
        }
      }
    }, SUGGESTION_INTERVAL_MS);
  }, Math.random() * SUGGESTION_SALE_MAX_DELAY);
};

const updateSelectOptions = () => {
  const totalStock = dataState.productList.reduce((sum, product) => sum + product.quantity, 0);

  const options = dataState.productList.map(item => {
    const optionData = getOptionData(item);
    return createElement("option", {
      value: item.id,
      textContent: optionData.textContent,
      className: optionData.className,
      disabled: optionData.disabled
    });
  });

  domRefs.productSelect.replaceChildren(...options);
  domRefs.productSelect.style.borderColor = totalStock < TOTAL_STOCK_WARNING_THRESHOLD ? "orange" : "";
};













const renderBonusPoints = () => {
  // 장바구니가 비어있으면 포인트 UI 숨김
  hidePointsIfEmpty(domRefs.cartDisplay.children.length);
  if (domRefs.cartDisplay.children.length === 0) return;
  
  // 기본 포인트 계산
  const basePoints = calculateBasePoints(appState.totalAmount);
  const pointsDetail = [];


  const initialPoints = basePoints > 0 ? (() => {
    pointsDetail.push("기본: " + basePoints + "p");
    return basePoints;
  })() : 0;
  
  // 화요일 보너스 계산
  const tuesdayBonus = calculateTuesdayBonus(basePoints);
  const tuesdayPoints = tuesdayBonus.applied ? (() => {
    pointsDetail.push(tuesdayBonus.description);
    return tuesdayBonus.points;
  })() : initialPoints;
  
  // 콤보 보너스 계산
  const productTypes = getCartProductTypes(domRefs.cartDisplay.children, dataState.productList);
  const comboBonuses = calculateComboBonuses(productTypes);
  const comboPoints = comboBonuses.reduce((sum, bonus) => {
    pointsDetail.push(bonus.description);
    return sum + bonus.points;
  }, 0);
  
  // 대량구매 보너스 계산
  const bulkBonus = calculateBulkBonus(appState.itemCount);
  const bulkPoints = bulkBonus ? (() => {
    pointsDetail.push(bulkBonus.description);
    return bulkBonus.points;
  })() : 0;
  
  const finalPoints = tuesdayPoints + comboPoints + bulkPoints;
  
  // 전역 상태 업데이트 및 UI 표시
  appState.bonusPoints = finalPoints;
  displayPointsInfo(finalPoints, pointsDetail);
};

const updatePricesInCart = () => {
  const cartItems = domRefs.cartDisplay.children;
  
  Array.from(cartItems).forEach(cartItem => {
    const itemId = cartItem.id;
    const product = dataState.productList.find(product => product.id === itemId);
    if (product) {
      const priceDiv = cartItem.querySelector(".text-lg");
      const nameDiv = cartItem.querySelector("h3");
      if (product.onSale && product.suggestSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalPrice.toLocaleString() +
          '</span> <span class="text-purple-600">₩' +
          product.price.toLocaleString() +
          "</span>";
        nameDiv.textContent = "⚡💝" + product.name;
      } else if (product.onSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalPrice.toLocaleString() +
          '</span> <span class="text-red-500">₩' +
          product.price.toLocaleString() +
          "</span>";
        nameDiv.textContent = "⚡" + product.name;
      } else if (product.suggestSale) {
        priceDiv.innerHTML =
          '<span class="line-through text-gray-400">₩' +
          product.originalPrice.toLocaleString() +
          '</span> <span class="text-blue-500">₩' +
          product.price.toLocaleString() +
          "</span>";
        nameDiv.textContent = "💝" + product.name;
      } else {
        priceDiv.textContent = "₩" + product.price.toLocaleString();
        nameDiv.textContent = product.name;
      }
    }
  });
  calculateCartTotals();
};
main();
domRefs.addButton.addEventListener("click", function () {
  const selectedItemId = domRefs.productSelect.value;
  const selectedProduct = dataState.productList.find(product => product.id === selectedItemId);

  if (!selectedItemId || !selectedProduct) {
    return;
  }
  
  if (selectedProduct.quantity > 0) {
    const item = document.getElementById(selectedProduct["id"]);
    if (item) {
      const quantityElement = item.querySelector(".quantity-number");
      const newQuantity = parseInt(quantityElement["textContent"]) + 1;
      if (
        newQuantity <=
        selectedProduct.quantity + parseInt(quantityElement.textContent)
      ) {
        quantityElement.textContent = newQuantity;
        selectedProduct["quantity"]--;
      } else {
        alert("재고가 부족합니다.");
      }
    } else {
      const newItem = createElement("div", {
        id: selectedProduct.id,
        className: "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0",
        innerHTML: cartItemTemplate(selectedProduct)
      });
      domRefs.cartDisplay.appendChild(newItem);
      selectedProduct.quantity--;
    }
    calculateCartTotals();
    appState.lastSelectedItem = selectedItemId;
  }
});
domRefs.cartDisplay.addEventListener("click", function (event) {
  const target = event.target;
  if (
    target.classList.contains("quantity-change") ||
    target.classList.contains("remove-item")
  ) {
    const productId = target.dataset.productId;
    const cartItemElement = document.getElementById(productId);
    const prod = dataState.productList.find(product => product.id === productId);
    
    if (!prod) return;
    
    if (target.classList.contains("quantity-change")) {
      const quantityChange = parseInt(target.dataset.change);
      const quantityElement = cartItemElement.querySelector(".quantity-number");
      const currentQuantity = parseInt(quantityElement.textContent);
      const newQuantity = currentQuantity + quantityChange;
      if (newQuantity > 0 && newQuantity <= prod.quantity + currentQuantity) {
        quantityElement.textContent = newQuantity;
        prod.quantity -= quantityChange;
      } else if (newQuantity <= 0) {
        prod.quantity += currentQuantity;
        cartItemElement.remove();
      } else {
        alert("재고가 부족합니다.");
      }
    } else if (target.classList.contains("remove-item")) {
      const quantityElement = cartItemElement.querySelector(".quantity-number");
      const removedQuantity = parseInt(quantityElement.textContent);
      prod.quantity += removedQuantity;
      cartItemElement.remove();
    }

    calculateCartTotals();
    updateSelectOptions();
  }
});
