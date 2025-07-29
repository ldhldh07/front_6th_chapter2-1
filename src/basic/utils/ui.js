import * as constants from '../constants/index.js';

const { QUANTITY_DISCOUNT_THRESHOLD } = constants;

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
      textContent: `⚡💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (25% SUPER SALE!)`,
      className: "text-purple-600 font-bold",
      disabled: false
    },
    lightningOnly: {
      textContent: `⚡${item.name} - ${item.originalPrice}원 → ${item.price}원 (20% SALE!)`,
      className: "text-red-500 font-bold", 
      disabled: false
    },
    suggestionOnly: {
      textContent: `💝${item.name} - ${item.originalPrice}원 → ${item.price}원 (5% 추천할인!)`,
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

export const updateItemStyles = (cartItem, quantity) => {
  const priceElements = cartItem.querySelectorAll(".text-lg, .text-xs");
  priceElements.forEach(function (elem) {
    if (elem.classList.contains("text-lg")) {
      elem.style.fontWeight = quantity >= QUANTITY_DISCOUNT_THRESHOLD ? "bold" : "normal";
    }
  });
}; 