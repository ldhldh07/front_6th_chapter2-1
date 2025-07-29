/**
 * 장바구니 아이템 템플릿 (동적 데이터 함수)
 */
export const cartItemTemplate = (selectedProduct) => {
  const saleIcon = selectedProduct.onSale && selectedProduct.suggestSale ? "⚡💝" : 
                   selectedProduct.onSale ? "⚡" : 
                   selectedProduct.suggestSale ? "💝" : "";
  
  const priceDisplay = selectedProduct.onSale || selectedProduct.suggestSale ? 
    `<span class="line-through text-gray-400">₩${selectedProduct.originalPrice.toLocaleString()}</span> <span class="${selectedProduct.onSale && selectedProduct.suggestSale ? "text-purple-600" : selectedProduct.onSale ? "text-red-500" : "text-blue-500"}">₩${selectedProduct.price.toLocaleString()}</span>` : 
    `₩${selectedProduct.price.toLocaleString()}`;

  return `
<div class="w-20 h-20 bg-gradient-black relative overflow-hidden">
  <div class="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
</div>
<div>
  <h3 class="text-base font-normal mb-1 tracking-tight">${saleIcon}${selectedProduct.name}</h3>
  <p class="text-xs text-gray-500 mb-0.5 tracking-wide">PRODUCT</p>
  <p class="text-xs text-black mb-3">${priceDisplay}</p>
  <div class="flex items-center gap-4">
    <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${selectedProduct.id}" data-change="-1">−</button>
    <span class="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">1</span>
    <button class="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white" data-product-id="${selectedProduct.id}" data-change="1">+</button>
  </div>
</div>
<div class="text-right">
  <div class="text-lg mb-2 tracking-tight tabular-nums">${priceDisplay}</div>
  <a class="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black" data-product-id="${selectedProduct.id}">Remove</a>
</div>
`;
}; 