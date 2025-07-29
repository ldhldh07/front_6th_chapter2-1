import * as constants from '../../../constants/index.js';

const { 
  SUPER_SALE_TEXT,
  LIGHTNING_SALE_TEXT,
  SUGGESTION_SALE_TEXT
} = constants;

/**
 * 상품 옵션의 표시 데이터를 생성합니다 (utils에서 이전)
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
export const getOptionData = (item) => {
  const discountText = (item.onSale ? " ⚡SALE" : "") + (item.suggestSale ? " 💝추천" : "");
  
  // 품절인 경우
  if (item.quantity === 0) {
    return {
      textContent: `${item.name} - ${item.price}원 (품절)${discountText}`,
      className: "text-gray-400",
      disabled: true
    };
  }
  
  // 경우별 매핑 객체
  const saleTypeMap = {
    bothSales: item.onSale && item.suggestSale,
    lightningOnly: item.onSale && !item.suggestSale, 
    suggestionOnly: !item.onSale && item.suggestSale,
    normal: !item.onSale && !item.suggestSale
  };
  
  const optionConfigs = {
    bothSales: {
      textContent: `⚡💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (${SUPER_SALE_TEXT})`,
      className: "text-purple-600 font-bold",
      disabled: false
    },
    lightningOnly: {
      textContent: `⚡${item.name} - ${item.originalPrice}원 → ${item.price}원 (${LIGHTNING_SALE_TEXT})`,
      className: "text-red-500 font-bold", 
      disabled: false
    },
    suggestionOnly: {
      textContent: `💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (${SUGGESTION_SALE_TEXT})`,
      className: "text-blue-500 font-bold",
      disabled: false
    },
    normal: {
      textContent: `${item.name} - ${item.price}원${discountText}`,
      className: "",
      disabled: false
    }
  };
  
  // 해당하는 경우 찾기
  const activeType = Object.keys(saleTypeMap).find(type => saleTypeMap[type]);
  return optionConfigs[activeType];
}; 