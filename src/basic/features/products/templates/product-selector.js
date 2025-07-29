export const productSelectorTemplate = `
  <div class="bg-white border border-gray-200 p-8 overflow-y-auto">
    <div class="mb-6 pb-6 border-b border-gray-200">
      <select id="product-select" class="w-full p-3 border border-gray-300 rounded-lg text-base mb-3">
        <!-- Options will be populated by JavaScript -->
      </select>
      <button id="add-to-cart" class="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all">
        Add to Cart
      </button>
      <div id="stock-status" class="text-xs text-red-500 mt-3 whitespace-pre-line">
        <!-- Stock information will be populated by JavaScript -->
      </div>
    </div>
    <div id="cart-items">
      <!-- Cart items will be populated by JavaScript -->
    </div>
  </div>
`; 