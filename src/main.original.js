let productList;
let bonusPoints = 0;
let stockInformation;
let itemCount;
let lastSelectedItem;
let productSelect;
let addButton;
let totalAmount = 0;
const PRODUCT_ONE = "p1";
const PRODUCT_TWO = "p2";
const PRODUCT_THREE = "p3";
const PRODUCT_FOUR = "p4";
const PRODUCT_FIVE = "p5";

// 할인 시스템 상수
const QUANTITY_DISCOUNT_THRESHOLD = 10;
const BULK_DISCOUNT_THRESHOLD = 30;
const KEYBOARD_DISCOUNT_RATE = 0.1;
const MOUSE_DISCOUNT_RATE = 0.15;
const MONITOR_ARM_DISCOUNT_RATE = 0.2;
const SPEAKER_DISCOUNT_RATE = 0.25;
const BULK_DISCOUNT_RATE = 0.25;
const SUGGESTION_DISCOUNT_RATE = 0.05;
const TUESDAY_ADDITIONAL_DISCOUNT_RATE = 0.1;
const LIGHTNING_SALE_DISCOUNT_RATE = 0.2;

// 포인트 시스템 상수
const POINTS_CALCULATION_BASE = 1000;
const COMBO_BONUS_POINTS = 50;
const FULL_SET_BONUS_POINTS = 100;
const SMALL_BULK_BONUS_POINTS = 20;
const MEDIUM_BULK_BONUS_POINTS = 50;
const LARGE_BULK_BONUS_POINTS = 100;

// 구매 수량 임계값
const SMALL_BULK_THRESHOLD = 10;
const MEDIUM_BULK_THRESHOLD = 20;
const LARGE_BULK_THRESHOLD = 30;

// 기타 상수
const LOW_STOCK_THRESHOLD = 5;
const TUESDAY_DAY_NUMBER = 2;
const TOTAL_STOCK_WARNING_THRESHOLD = 50;

// 타이밍 상수 (밀리초)
const LIGHTNING_SALE_MAX_DELAY = 10000;
const LIGHTNING_SALE_DURATION = 30000;
const SUGGESTION_SALE_MAX_DELAY = 20000;

function getProductDiscountRate(productId) {
  if (productId === PRODUCT_ONE) return KEYBOARD_DISCOUNT_RATE;
  if (productId === PRODUCT_TWO) return MOUSE_DISCOUNT_RATE;
  if (productId === PRODUCT_THREE) return MONITOR_ARM_DISCOUNT_RATE;
  if (productId === PRODUCT_FOUR) return SUGGESTION_DISCOUNT_RATE;
  if (productId === PRODUCT_FIVE) return SPEAKER_DISCOUNT_RATE;
  return 0;
}

function findProductById(productId) {
  return productList.find(product => product.id === productId);
}

function getLowStockItems() {
  return productList
    .filter(
      product => product.quantity < LOW_STOCK_THRESHOLD && product.quantity > 0
    )
    .map(product => product.name);
}

let cartDisplay;
function main() {
  var root;
  let header;
  let gridContainer;
  let leftColumn;
  let selectorContainer;
  let rightColumn;
  let manualToggle;
  let manualOverlay;
  let manualColumn;
  let lightningDelay;
  totalAmount = 0;
  itemCount = 0;
  lastSelectedItem = null;
  productList = [
    {
      id: PRODUCT_ONE,
      name: "버그 없애는 키보드",
      price: 10000,
      originalPrice: 10000,
      quantity: 50,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_TWO,
      name: "생산성 폭발 마우스",
      price: 20000,
      originalPrice: 20000,
      quantity: 30,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_THREE,
      name: "거북목 탈출 모니터암",
      price: 30000,
      originalPrice: 30000,
      quantity: 20,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_FOUR,
      name: "에러 방지 노트북 파우치",
      price: 15000,
      originalPrice: 15000,
      quantity: 0,
      onSale: false,
      suggestSale: false,
    },
    {
      id: PRODUCT_FIVE,
      name: "코딩할 때 듣는 Lo-Fi 스피커",
      price: 25000,
      originalPrice: 25000,
      quantity: 10,
      onSale: false,
      suggestSale: false,
    },
  ];
  var root = document.getElementById("app");
  header = document.createElement("div");
  header.className = "mb-8";
  header.innerHTML = `
    <h1 class="text-xs font-medium tracking-extra-wide uppercase mb-2">🛒 Hanghae Online Store</h1>
    <div class="text-5xl tracking-tight leading-none">Shopping Cart</div>
    <p id="item-count" class="text-sm text-gray-500 font-normal mt-3">🛍️ 0 items in cart</p>
  `;
  productSelect = document.createElement("select");
  productSelect.id = "product-select";
  gridContainer = document.createElement("div");
  leftColumn = document.createElement("div");
  leftColumn["className"] =
    "bg-white border border-gray-200 p-8 overflow-y-auto";
  selectorContainer = document.createElement("div");
  selectorContainer.className = "mb-6 pb-6 border-b border-gray-200";
  productSelect.className =
    "w-full p-3 border border-gray-300 rounded-lg text-base mb-3";
  gridContainer.className =
    "grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden";
  addButton = document.createElement("button");
  stockInformation = document.createElement("div");
  addButton.id = "add-to-cart";
  stockInformation.id = "stock-status";
  stockInformation.className = "text-xs text-red-500 mt-3 whitespace-pre-line";
  addButton.innerHTML = "Add to Cart";
  addButton.className =
    "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all";
  selectorContainer.appendChild(productSelect);
  selectorContainer.appendChild(addButton);
  selectorContainer.appendChild(stockInformation);
  leftColumn.appendChild(selectorContainer);
  cartDisplay = document.createElement("div");
  leftColumn.appendChild(cartDisplay);
  cartDisplay.id = "cart-items";
  rightColumn = document.createElement("div");
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
  sum = rightColumn.querySelector("#cart-total");
  manualToggle = document.createElement("button");
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
  manualOverlay = document.createElement("div");
  manualOverlay.className =
    "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300";
  manualOverlay.onclick = function (e) {
    if (e.target === manualOverlay) {
      manualOverlay.classList.add("hidden");
      manualColumn.classList.add("translate-x-full");
    }
  };
  manualColumn = document.createElement("div");
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
  let initStock = 0;
  for (let i = 0; i < productList.length; i++) {
    initStock += productList[i].quantity;
  }
  updateSelectOptions();
  calculateCartTotals();
  lightningDelay = Math.random() * LIGHTNING_SALE_MAX_DELAY;
  setTimeout(() => {
    setInterval(function () {
      const luckyIdx = Math.floor(Math.random() * productList.length);
      const luckyItem = productList[luckyIdx];
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
      if (cartDisplay.children.length === 0) {
      }
      if (lastSelectedItem) {
        let suggest = null;

        for (let k = 0; k < productList.length; k++) {
          if (productList[k].id !== lastSelectedItem) {
            if (productList[k].quantity > 0) {
              if (!productList[k].suggestSale) {
                suggest = productList[k];
                break;
              }
            }
          }
        }
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
    }, 60000);
  }, Math.random() * SUGGESTION_SALE_MAX_DELAY);
}
let sum;
function updateSelectOptions() {
  let totalStock;
  let opt;
  let discountText;
  productSelect.innerHTML = "";
  totalStock = 0;
  for (let idx = 0; idx < productList.length; idx++) {
    const _p = productList[idx];
    totalStock = totalStock + _p.quantity;
  }
  for (var i = 0; i < productList.length; i++) {
    (function () {
      const item = productList[i];
      opt = document.createElement("option");
      opt.value = item.id;
      discountText = "";
      if (item.onSale) discountText += " ⚡SALE";
      if (item.suggestSale) discountText += " 💝추천";
      if (item.quantity === 0) {
        opt.textContent =
          item.name + " - " + item.price + "원 (품절)" + discountText;
        opt.disabled = true;
        opt.className = "text-gray-400";
      } else {
        if (item.onSale && item.suggestSale) {
          opt.textContent =
            "⚡💝" +
            item.name +
            " - " +
            item.originalPrice +
            "원 → " +
            item.price +
            "원 (25% SUPER SALE!)";
          opt.className = "text-purple-600 font-bold";
        } else if (item.onSale) {
          opt.textContent =
            "⚡" +
            item.name +
            " - " +
            item.originalPrice +
            "원 → " +
            item.price +
            "원 (20% SALE!)";
          opt.className = "text-red-500 font-bold";
        } else if (item.suggestSale) {
          opt.textContent =
            "💝" +
            item.name +
            " - " +
            item.originalPrice +
            "원 → " +
            item.price +
            "원 (5% 추천할인!)";
          opt.className = "text-blue-500 font-bold";
        } else {
          opt.textContent =
            item.name + " - " + item.price + "원" + discountText;
        }
      }
      productSelect.appendChild(opt);
    })();
  }
  if (totalStock < TOTAL_STOCK_WARNING_THRESHOLD) {
    productSelect.style.borderColor = "orange";
  } else {
    productSelect.style.borderColor = "";
  }
}
function calculateCartTotals() {
  let cartItems;
  let subtotal;
  let itemDiscounts;
  let lowStockItems;
  let idx;
  var originalTotal;
  let bulkDisc;
  let itemDisc;
  let savedAmount;
  let summaryDetails;
  let totalDiv;
  let loyaltyPointsDiv;
  let points;
  let discountInfoDiv;
  let itemCountElement;
  let previousCount;
  let stockMsg;
  let pts;
  let hasP1;
  let hasP2;
  let loyaltyDiv;
  totalAmount = 0;
  itemCount = 0;
  cartItems = cartDisplay.children;
  subtotal = 0;
  itemDiscounts = [];
  lowStockItems = getLowStockItems();
  for (let i = 0; i < cartItems.length; i++) {
    (function () {
      const product = findProductById(cartItems[i].id);
      const quantityElement = cartItems[i].querySelector(".quantity-number");
      const quantity = parseInt(quantityElement.textContent);
      const itemTotal = product.price * quantity;
      const discount =
        quantity >= QUANTITY_DISCOUNT_THRESHOLD
          ? getProductDiscountRate(product.id)
          : 0;

      itemCount += quantity;
      subtotal += itemTotal;

      const itemDiv = cartItems[i];
      const priceElements = itemDiv.querySelectorAll(".text-lg, .text-xs");
      priceElements.forEach(function (elem) {
        if (elem.classList.contains("text-lg")) {
          elem.style.fontWeight =
            quantity >= QUANTITY_DISCOUNT_THRESHOLD ? "bold" : "normal";
        }
      });

      if (discount > 0) {
        itemDiscounts.push({ name: product.name, discount: discount * 100 });
      }
      totalAmount += itemTotal * (1 - discount);
    })();
  }
  let discRate = 0;
  var originalTotal = subtotal;
  if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
    totalAmount = subtotal * (1 - BULK_DISCOUNT_RATE);
    discRate = BULK_DISCOUNT_RATE;
  } else {
    discRate = (subtotal - totalAmount) / subtotal;
  }

  const today = new Date();
  const isTuesday = today.getDay() === TUESDAY_DAY_NUMBER;
  const tuesdaySpecial = document.getElementById("tuesday-special");
  if (isTuesday) {
    if (totalAmount > 0) {
      totalAmount = totalAmount * (1 - TUESDAY_ADDITIONAL_DISCOUNT_RATE);

      discRate = 1 - totalAmount / originalTotal;
      tuesdaySpecial.classList.remove("hidden");
    } else {
      tuesdaySpecial.classList.add("hidden");
    }
  } else {
    tuesdaySpecial.classList.add("hidden");
  }
  document.getElementById("item-count").textContent =
    "🛍️ " + itemCount + " items in cart";
  summaryDetails = document.getElementById("summary-details");
  summaryDetails.innerHTML = "";
  if (subtotal > 0) {
    for (let i = 0; i < cartItems.length; i++) {
      const product = findProductById(cartItems[i].id);
      const quantityElement = cartItems[i].querySelector(".quantity-number");
      const quantity = parseInt(quantityElement.textContent);
      const itemTotal = product.price * quantity;
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-xs tracking-wide text-gray-400">
          <span>${product.name} x ${quantity}</span>
          <span>₩${itemTotal.toLocaleString()}</span>
        </div>
      `;
    }

    summaryDetails.innerHTML += `
      <div class="border-t border-white/10 my-3"></div>
      <div class="flex justify-between text-sm tracking-wide">
                   <span>Subtotal</span>
           <span>₩${subtotal.toLocaleString()}</span>
      </div>
    `;

    if (itemCount >= 30) {
      summaryDetails.innerHTML += `
        <div class="flex justify-between text-sm tracking-wide text-green-400">
          <span class="text-xs">🎉 대량구매 할인 (30개 이상)</span>
          <span class="text-xs">-25%</span>
        </div>
      `;
    } else if (itemDiscounts.length > 0) {
      itemDiscounts.forEach(function (item) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-green-400">
            <span class="text-xs">${item.name} (10개↑)</span>
            <span class="text-xs">-${item.discount}%</span>
          </div>
        `;
      });
    }
    if (isTuesday) {
      if (totalAmount > 0) {
        summaryDetails.innerHTML += `
          <div class="flex justify-between text-sm tracking-wide text-purple-400">
            <span class="text-xs">🌟 화요일 추가 할인</span>
            <span class="text-xs">-10%</span>
          </div>
        `;
      }
    }
    summaryDetails.innerHTML += `
      <div class="flex justify-between text-sm tracking-wide text-gray-400">
        <span>Shipping</span>
        <span>Free</span>
      </div>
    `;
  }
  totalDiv = sum.querySelector(".text-2xl");
  if (totalDiv) {
    totalDiv.textContent = "₩" + Math.round(totalAmount).toLocaleString();
  }
  loyaltyPointsDiv = document.getElementById("loyalty-points");
  if (loyaltyPointsDiv) {
    points = Math.floor(totalAmount / POINTS_CALCULATION_BASE);
    if (points > 0) {
      loyaltyPointsDiv.textContent = "적립 포인트: " + points + "p";
      loyaltyPointsDiv.style.display = "block";
    } else {
      loyaltyPointsDiv.textContent = "적립 포인트: 0p";
      loyaltyPointsDiv.style.display = "block";
    }
  }
  discountInfoDiv = document.getElementById("discount-info");
  discountInfoDiv.innerHTML = "";

  if (discRate > 0 && totalAmount > 0) {
    savedAmount = originalTotal - totalAmount;
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
  itemCountElement = document.getElementById("item-count");
  if (itemCountElement) {
    previousCount = parseInt(itemCountElement.textContent.match(/\d+/) || 0);
    itemCountElement.textContent = "🛍️ " + itemCount + " items in cart";
    if (previousCount !== itemCount) {
      itemCountElement.setAttribute("data-changed", "true");
    }
  }
  stockMsg = "";

  for (let stockIdx = 0; stockIdx < productList.length; stockIdx++) {
    const item = productList[stockIdx];
    if (item.quantity < LOW_STOCK_THRESHOLD) {
      if (item.quantity > 0) {
        stockMsg =
          stockMsg + item.name + ": 재고 부족 (" + item.quantity + "개 남음)\n";
      } else {
        stockMsg = stockMsg + item.name + ": 품절\n";
      }
    }
  }
  stockInformation.textContent = stockMsg;

  updateStockInformation();
  renderBonusPoints();
}
var renderBonusPoints = function () {
  let basePoints;
  let finalPoints;
  let pointsDetail;

  let hasKeyboard;
  let hasMouse;
  let hasMonitorArm;
  let nodes;
  if (cartDisplay.children.length === 0) {
    document.getElementById("loyalty-points").style.display = "none";
    return;
  }
  basePoints = Math.floor(totalAmount / POINTS_CALCULATION_BASE);
  finalPoints = 0;
  pointsDetail = [];

  if (basePoints > 0) {
    finalPoints = basePoints;
    pointsDetail.push("기본: " + basePoints + "p");
  }
  if (new Date().getDay() === TUESDAY_DAY_NUMBER) {
    if (basePoints > 0) {
      finalPoints = basePoints * 2;
      pointsDetail.push("화요일 2배");
    }
  }
  hasKeyboard = false;
  hasMouse = false;
  hasMonitorArm = false;
  nodes = cartDisplay.children;
  for (const node of nodes) {
    let product = null;

    for (let pIdx = 0; pIdx < productList.length; pIdx++) {
      if (productList[pIdx].id === node.id) {
        product = productList[pIdx];
        break;
      }
    }
    if (!product) continue;
    if (product.id === PRODUCT_ONE) {
      hasKeyboard = true;
    } else if (product.id === PRODUCT_TWO) {
      hasMouse = true;
    } else if (product.id === PRODUCT_THREE) {
      hasMonitorArm = true;
    }
  }
  if (hasKeyboard && hasMouse) {
    finalPoints = finalPoints + COMBO_BONUS_POINTS;
    pointsDetail.push(`키보드+마우스 세트 +${COMBO_BONUS_POINTS}p`);
  }
  if (hasKeyboard && hasMouse && hasMonitorArm) {
    finalPoints = finalPoints + FULL_SET_BONUS_POINTS;
    pointsDetail.push(`풀세트 구매 +${FULL_SET_BONUS_POINTS}p`);
  }

  if (itemCount >= LARGE_BULK_THRESHOLD) {
    finalPoints = finalPoints + LARGE_BULK_BONUS_POINTS;
    pointsDetail.push(
      `대량구매(${LARGE_BULK_THRESHOLD}개+) +${LARGE_BULK_BONUS_POINTS}p`
    );
  } else {
    if (itemCount >= MEDIUM_BULK_THRESHOLD) {
      finalPoints = finalPoints + MEDIUM_BULK_BONUS_POINTS;
      pointsDetail.push(
        `대량구매(${MEDIUM_BULK_THRESHOLD}개+) +${MEDIUM_BULK_BONUS_POINTS}p`
      );
    } else {
      if (itemCount >= SMALL_BULK_THRESHOLD) {
        finalPoints = finalPoints + SMALL_BULK_BONUS_POINTS;
        pointsDetail.push(
          `대량구매(${SMALL_BULK_THRESHOLD}개+) +${SMALL_BULK_BONUS_POINTS}p`
        );
      }
    }
  }
  bonusPoints = finalPoints;
  const ptsTag = document.getElementById("loyalty-points");
  if (ptsTag) {
    if (bonusPoints > 0) {
      ptsTag.innerHTML =
        '<div>적립 포인트: <span class="font-bold">' +
        bonusPoints +
        "p</span></div>" +
        '<div class="text-2xs opacity-70 mt-1">' +
        pointsDetail.join(", ") +
        "</div>";
      ptsTag.style.display = "block";
    } else {
      ptsTag.textContent = "적립 포인트: 0p";
      ptsTag.style.display = "block";
    }
  }
};
function getStockTotal() {
  let sum;
  let i;
  let currentProduct;
  sum = 0;
  for (i = 0; i < productList.length; i++) {
    currentProduct = productList[i];
    sum += currentProduct.quantity;
  }
  return sum;
}
const updateStockInformation = function () {
  let infoMsg;
  let totalStock;
  let messageOptimizer;
  infoMsg = "";
  totalStock = getStockTotal();
  if (totalStock < 30) {
  }
  productList.forEach(function (item) {
    if (item.quantity < LOW_STOCK_THRESHOLD) {
      if (item.quantity > 0) {
        infoMsg =
          infoMsg + item.name + ": 재고 부족 (" + item.quantity + "개 남음)\n";
      } else {
        infoMsg = infoMsg + item.name + ": 품절\n";
      }
    }
  });
  stockInformation.textContent = infoMsg;
};
function updatePricesInCart() {
  let totalCount = 0,
    j = 0;
  let cartItems;
  while (cartDisplay.children[j]) {
    const qty = cartDisplay.children[j].querySelector(".quantity-number");
    totalCount += qty ? parseInt(qty.textContent) : 0;
    j++;
  }
  totalCount = 0;
  for (j = 0; j < cartDisplay.children.length; j++) {
    totalCount += parseInt(
      cartDisplay.children[j].querySelector(".quantity-number").textContent
    );
  }
  cartItems = cartDisplay.children;
  for (let i = 0; i < cartItems.length; i++) {
    const itemId = cartItems[i].id;
    let product = null;

    for (let productIdx = 0; productIdx < productList.length; productIdx++) {
      if (productList[productIdx].id === itemId) {
        product = productList[productIdx];
        break;
      }
    }
    if (product) {
      const priceDiv = cartItems[i].querySelector(".text-lg");
      const nameDiv = cartItems[i].querySelector("h3");
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
  }
  calculateCartTotals();
}
main();
addButton.addEventListener("click", function () {
  const selectedItemId = productSelect.value;

  let hasItem = false;
  for (let idx = 0; idx < productList.length; idx++) {
    if (productList[idx].id === selectedItemId) {
      hasItem = true;
      break;
    }
  }
  if (!selectedItemId || !hasItem) {
    return;
  }
  let selectedProduct = null;
  for (let j = 0; j < productList.length; j++) {
    if (productList[j].id === selectedItemId) {
      selectedProduct = productList[j];
      break;
    }
  }
  if (selectedProduct && selectedProduct.quantity > 0) {
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
      cartDisplay.appendChild(newItem);
      selectedProduct.quantity--;
    }
    calculateCartTotals();
    lastSelectedItem = selectedItemId;
  }
});
cartDisplay.addEventListener("click", function (event) {
  const target = event.target;
  if (
    target.classList.contains("quantity-change") ||
    target.classList.contains("remove-item")
  ) {
    const productId = target.dataset.productId;
    const cartItemElement = document.getElementById(productId);
    let prod = null;

    for (let prdIdx = 0; prdIdx < productList.length; prdIdx++) {
      if (productList[prdIdx].id === productId) {
        prod = productList[prdIdx];
        break;
      }
    }
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
    if (prod && prod.quantity < LOW_STOCK_THRESHOLD) {
    }
    calculateCartTotals();
    updateSelectOptions();
  }
});
