/**
 * Products Feature - 통합 모듈
 * 상품 데이터 관리, UI 처리, 템플릿 관리
 */

// Constants import
import {
  INITIAL_PRODUCT_DATA,
  SUPER_SALE_TEXT,
  LIGHTNING_SALE_TEXT,
  SUGGESTION_SALE_TEXT,
} from "../constants.js";

// ==================== Product Data Management ====================

/**
 * 상품 목록을 초기화합니다
 * @returns {Array} 초기화된 상품 목록
 */
export const initializeProducts = () => {
  return [...INITIAL_PRODUCT_DATA];
};

/**
 * 상품 ID로 상품을 찾습니다
 * @param {string} productId - 찾을 상품 ID
 * @param {Array} productList - 상품 목록 배열
 * @returns {Object|undefined} 찾은 상품 객체 또는 undefined
 */
export const findProductById = (productId, productList) => {
  return productList.find(product => product.id === productId);
};

/**
 * 재고가 부족한 상품들을 찾습니다
 * @param {Array} productList - 상품 목록
 * @param {number} threshold - 재고 부족 기준
 * @returns {Array} 재고 부족 상품 목록
 */
export const getLowStockProducts = (productList, threshold) => {
  return productList.filter(
    product => product.quantity > 0 && product.quantity < threshold
  );
};

// ==================== Product Options UI ====================

/**
 * 상품 옵션의 표시 데이터를 생성합니다
 * @param {Object} item - 상품 정보 객체
 * @param {string} item.name - 상품명
 * @param {number} item.price - 현재 가격
 * @param {number} item.originalPrice - 원래 가격
 * @param {number} item.quantity - 재고 수량
 * @param {boolean} item.onSale - 번개세일 여부
 * @param {boolean} item.suggestSale - 추천할인 여부
 * @returns {Object} 옵션 표시 정보
 * @returns {string} returns.textContent - 표시할 텍스트
 * @returns {string} returns.className - CSS 클래스명
 * @returns {boolean} returns.disabled - 비활성화 여부
 */
export const getOptionData = item => {
  const discountText =
    (item.onSale ? " ⚡SALE" : "") + (item.suggestSale ? " 💝추천" : "");

  // 품절인 경우
  if (item.quantity === 0) {
    return {
      textContent: `${item.name} - ${item.price}원 (품절)${discountText}`,
      className: "text-gray-400",
      disabled: true,
    };
  }

  // 경우별 매핑 객체
  const saleTypeMap = {
    bothSales: item.onSale && item.suggestSale,
    lightningOnly: item.onSale && !item.suggestSale,
    suggestionOnly: !item.onSale && item.suggestSale,
    normal: !item.onSale && !item.suggestSale,
  };

  const optionConfigs = {
    bothSales: {
      textContent: `⚡💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (${SUPER_SALE_TEXT})`,
      className: "text-purple-600 font-bold",
      disabled: false,
    },
    lightningOnly: {
      textContent: `⚡${item.name} - ${item.originalPrice}원 → ${item.price}원 (${LIGHTNING_SALE_TEXT})`,
      className: "text-red-500 font-bold",
      disabled: false,
    },
    suggestionOnly: {
      textContent: `💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (${SUGGESTION_SALE_TEXT})`,
      className: "text-blue-500 font-bold",
      disabled: false,
    },
    normal: {
      textContent: `${item.name} - ${item.price}원${discountText}`,
      className: "",
      disabled: false,
    },
  };

  // 해당하는 경우 찾기
  const activeType = Object.keys(saleTypeMap).find(type => saleTypeMap[type]);
  return optionConfigs[activeType];
};

/**
 * 장바구니 내 상품의 표시 정보를 생성합니다
 * @param {Object} product - 상품 정보 객체
 * @param {string} product.name - 상품명
 * @param {number} product.price - 현재 가격
 * @param {number} product.originalPrice - 원래 가격
 * @param {boolean} product.onSale - 번개세일 여부
 * @param {boolean} product.suggestSale - 추천할인 여부
 * @returns {Object} 표시 정보
 * @returns {string} returns.priceHtml - 가격 HTML
 * @returns {string} returns.nameText - 이름 텍스트
 */
export const getProductDisplayInfo = product => {
  const hasBothSales = product.onSale && product.suggestSale;
  const hasLightningSale = product.onSale && !product.suggestSale;
  const hasSuggestionSale = !product.onSale && product.suggestSale;

  if (hasBothSales) {
    return {
      priceHtml: `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-purple-600">₩${product.price.toLocaleString()}</span>`,
      nameText: "⚡💝" + product.name,
    };
  }

  if (hasLightningSale) {
    return {
      priceHtml: `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-red-500">₩${product.price.toLocaleString()}</span>`,
      nameText: "⚡" + product.name,
    };
  }

  if (hasSuggestionSale) {
    return {
      priceHtml: `<span class="line-through text-gray-400">₩${product.originalPrice.toLocaleString()}</span> <span class="text-blue-500">₩${product.price.toLocaleString()}</span>`,
      nameText: "💝" + product.name,
    };
  }

  return {
    priceHtml: `₩${product.price.toLocaleString()}`,
    nameText: product.name,
  };
};

/**
 * product select options를 업데이트합니다 (HTML 기반)
 * @param {Array} productList - 상품 목록
 * @param {Element} productSelectElement - select DOM element
 * @param {number} totalStockWarningThreshold - 재고 경고 임계값
 */
export const updateSelectOptions = (
  productList,
  productSelectElement,
  totalStockWarningThreshold
) => {
  const totalStock = productList.reduce(
    (sum, product) => sum + product.quantity,
    0
  );

  const optionsHTML = productList
    .map(item => {
      const optionData = getOptionData(item);
      const disabledAttr = optionData.disabled ? " disabled" : "";
      const classAttr = optionData.className
        ? ` class="${optionData.className}"`
        : "";

      return `<option value="${item.id}"${disabledAttr}${classAttr}>${optionData.textContent}</option>`;
    })
    .join("");

  productSelectElement.innerHTML = optionsHTML;
  productSelectElement.style.borderColor =
    totalStock < totalStockWarningThreshold ? "orange" : "";
};
