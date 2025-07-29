import * as constants from './constants/index.js';
import { initializeProducts, findProductById, getOptionData } from './features/products/index.js';
import { getProductDiscountRate, applyBulkDiscount, calculateTuesdayDiscount, updateTuesdayUI } from './features/discounts/index.js';
import { calculateItemData, getCartProductTypes } from './features/cart/index.js';
import { updateItemStyles } from './shared/index.js';
import { calculateBasePoints, calculateTuesdayBonus, calculateComboBonuses, calculateBulkBonus, displayPointsInfo, hidePointsIfEmpty } from './features/points/index.js';
const {
  // 실제 사용되는 상수들만 (Feature로 이전 후 정리됨)
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
  const header = document.createElement("div");
  header.className = "mb-8";
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  domRefs.productSelect = document.createElement("select");
  domRefs.productSelect.id = "product-select";
  const gridContainer = document.createElement("div");
  const leftColumn = document.createElement("div");
  leftColumn["className"] =
    "bg-white border border-gray-200 p-8 overflow-y-auto";
  const selectorContainer = document.createElement("div");
  selectorContainer.className = "mb-6 pb-6 border-b border-gray-200";
  domRefs.productSelect.className =
    "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";
  domRefs.addButton = document.createElement("button");
  domRefs.stockInformation = document.createElement("div");
  domRefs.addButton.id = "add-to-cart";
  domRefs.stockInformation.id = "stock-status";
  domRefs.stockInformation.className = "text-xs text-red-500 mt-3 whitespace-pre-line";
  domRefs.addButton.innerHTML = "Add to Cart";
  domRefs.addButton.className =
    "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all";
  selectorContainer.appendChild(domRefs.productSelect);
  selectorContainer.appendChild(domRefs.addButton);
  selectorContainer.appendChild(domRefs.stockInformation);
  leftColumn.appendChild(selectorContainer);
  domRefs.cartDisplay = document.createElement("div");
  leftColumn.appendChild(domRefs.cartDisplay);
  domRefs.cartDisplay.id = "cart-items";
  const rightColumn = document.createElement("div");
  rightColumn.className = "bg-black text-white p-8 flex flex-col";
  rightColumn.innerHTML = `
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
  `;
  domRefs.cartTotalElement = rightColumn.querySelector("#cart-total");
  const manualToggle = document.createElement("button");
  manualToggle.onclick = function () {
    manualOverlay.classList.toggle("hidden");
    manualColumn.classList.toggle("translate-x-full");
  };
  manualToggle.className =
    "fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50";
  manualToggle.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
  `;
  const manualOverlay = document.createElement("div");
  manualOverlay.className =
    "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300";
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };
  const manualColumn = document.createElement("div");
  manualColumn.className =
    "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300";
  manualColumn.innerHTML = `
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
  `;
  gridContainer.appendChild(leftColumn);
  gridContainer.appendChild(rightColumn);
  manualOverlay.appendChild(manualColumn);
  root.appendChild(header);
  root.appendChild(gridContainer);
  root.appendChild(manualToggle);
  root.appendChild(manualOverlay);
  updateSelectOptions();
  calculateCartTotals();
};

const calculateCartTotals = () => {
  appState.totalAmount = 0;
  appState.itemCount = 0;
  const cartItems = domRefs.cartDisplay.children;
  const itemDiscounts = [];
  
  // subtotal을 reduce 패턴으로 개선
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
  
  // 대량구매 할인 적용
  const bulkDiscount = applyBulkDiscount(appState.itemCount, subtotal);
  if (bulkDiscount) {
    appState.totalAmount = bulkDiscount.totalAmount;
  }
  
  // 화요일 할인 적용
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

    summaryDetails.innerHTML = `
      ${summaryItems}
      <div class="border-t border-gray-200 my-2"></div>
      <div class="flex justify-between text-sm font-medium">
        <span>소계</span>
        <span>₩${subtotal.toLocaleString()}</span>
      </div>
    `;

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
    discountInfoDiv.innerHTML = `
      <div class="bg-green-500/20 rounded-lg p-3">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
          <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
        </div>
        <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
      </div>
    `;
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
  domRefs.productSelect.innerHTML = "";
  
  const totalStock = dataState.productList.reduce((sum, product) => sum + product.quantity, 0);
  dataState.productList.forEach(item => {
    const option = document.createElement("option");
      option.value = item.id;
      
      const optionData = getOptionData(item);
      option.textContent = optionData.textContent;
      option.className = optionData.className;
      option.disabled = optionData.disabled;
      domRefs.productSelect.appendChild(option);
    });
  domRefs.productSelect.style.borderColor = totalStock < TOTAL_STOCK_WARNING_THRESHOLD ? "orange" : "";
};













const renderBonusPoints = () => {
  // 장바구니가 비어있으면 포인트 UI 숨김
  hidePointsIfEmpty(domRefs.cartDisplay.children.length);
  if (domRefs.cartDisplay.children.length === 0) return;
  
  // 기본 포인트 계산
  const basePoints = calculateBasePoints(appState.totalAmount);
  const pointsDetail = [];

  // 기본 포인트 적용
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
  
  // 최종 포인트 합계 (const 개선)
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
      const newItem = document.createElement("div");
      newItem.id = selectedProduct.id;
      newItem.className =
        "grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0";
      newItem.innerHTML = `
        <div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
          <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        </div>
        <div>
          <h3 class="text-base font-normal mb-1 tracking-tight">${selectedProduct.onSale && selectedProduct.suggestSale ? "⚡💝" : selectedProduct.onSale ? "⚡" : selectedProduct.suggestSale ? "💝" : ""}${selectedProduct.name}</h3>
          <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
          <p class="text-xs text-black mb-3">${selectedProduct.onSale || selectedProduct.suggestSale ? '<span class="line-through text-gray-400">₩' + selectedProduct.originalPrice.toLocaleString() + '</span> <span class="' + (selectedProduct.onSale && selectedProduct.suggestSale ? "text-purple-600" : selectedProduct.onSale ? "text-red-500" : "text-blue-500") + '">₩' + selectedProduct.price.toLocaleString() + "</span>" : "₩" + selectedProduct.price.toLocaleString()}</p>
          <div class="flex items-center gap-4">
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${selectedProduct.id}" data-change="-1">−</button>
            <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
            <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${selectedProduct.id}" data-change="1">+</button>
          </div>
        </div>
        <div class="text-right">
          <div class="text-lg mb-2 tracking-tight tabular-nums">${selectedProduct.onSale || selectedProduct.suggestSale ? '<span class="line-through text-gray-400">₩' + selectedProduct.originalPrice.toLocaleString() + '</span> <span class="' + (selectedProduct.onSale && selectedProduct.suggestSale ? "text-purple-600" : selectedProduct.onSale ? "text-red-500" : "text-blue-500") + '">₩' + selectedProduct.price.toLocaleString() + "</span>" : "₩" + selectedProduct.price.toLocaleString()}</div>
          <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${selectedProduct.id}">Remove</a>
        </div>
      `;
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
