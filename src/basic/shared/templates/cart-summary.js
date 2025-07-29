/**
 * 장바구니 요약 정보 템플릿 (동적 데이터 함수)
 */
export const cartSummaryTemplate = (summaryItems, subtotal) => `
${summaryItems}
<div class="border-t border-gray-200 my-2"></div>
<div class="flex justify-between text-sm font-medium">
  <span>소계</span>
  <span>₩${subtotal.toLocaleString()}</span>
</div>
`;

/**
 * 할인 정보 템플릿 (동적 데이터 함수)
 */
export const discountInfoTemplate = (discRate, savedAmount) => `
<div class="bg-green-500/20 rounded-lg p-3">
  <div class="flex justify-between items-center mb-1">
    <span class="text-xs uppercase tracking-wide text-green-400">총 할인율</span>
    <span class="text-sm font-medium text-green-400">${(discRate * 100).toFixed(1)}%</span>
  </div>
  <div class="text-2xs text-gray-300">₩${Math.round(savedAmount).toLocaleString()} 할인되었습니다</div>
</div>
`; 