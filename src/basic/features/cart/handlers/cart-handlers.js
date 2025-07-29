/**
 * 장바구니 아이템 추가 로직 (main.basic.js에서 분리)
 * @param {string} selectedItemId - 선택된 상품 ID
 * @param {Object} dependencies - 필요한 의존성들
 * @returns {Object} 처리 결과
 */
export const handleAddToCart = (selectedItemId, dependencies) => {
  const {
    productList,
    appState,
    domRefs,
    functions: { findProductById, createElement, calculateCartTotals },
    templates: { cartItemTemplate }
  } = dependencies;

  const selectedProduct = findProductById(selectedItemId, productList);

  if (!selectedItemId || !selectedProduct) {
    return { success: false, reason: 'invalid_product' };
  }
  
  if (selectedProduct.quantity <= 0) {
    return { success: false, reason: 'out_of_stock' };
  }

  const existingItem = document.getElementById(selectedProduct.id);
  
  if (existingItem) {
    // 기존 아이템 수량 증가
    const quantityElement = existingItem.querySelector(".quantity-number");
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + 1;
    
    if (newQuantity <= selectedProduct.quantity + currentQuantity) {
      quantityElement.textContent = newQuantity;
      selectedProduct.quantity--;
    } else {
      alert("재고가 부족합니다.");
      return { success: false, reason: 'insufficient_stock' };
    }
  } else {
    // 새 아이템 생성
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
  
  return { success: true, product: selectedProduct };
};

/**
 * 장바구니 액션 처리 로직 (main.basic.js에서 분리)
 * @param {Event} event - 클릭 이벤트
 * @param {Object} dependencies - 필요한 의존성들
 * @returns {Object} 처리 결과
 */
export const handleCartActions = (event, dependencies) => {
  const {
    productList,
    domRefs,
    constants: { TOTAL_STOCK_WARNING_THRESHOLD },
    functions: { findProductById, calculateCartTotals, updateSelectOptions, createElement }
  } = dependencies;

  const target = event.target;
  const isQuantityButton = target.classList.contains("quantity-change");
  const isRemoveButton = target.classList.contains("remove-item");
  
  if (!isQuantityButton && !isRemoveButton) {
    return { success: false, reason: 'invalid_target' };
  }
  
  const productId = target.dataset.productId;
  const cartItemElement = document.getElementById(productId);
  const product = findProductById(productId, productList);
  
  if (!product) {
    return { success: false, reason: 'product_not_found' };
  }
  
  if (isQuantityButton) {
    const quantityChange = parseInt(target.dataset.change);
    const quantityElement = cartItemElement.querySelector(".quantity-number");
    const currentQuantity = parseInt(quantityElement.textContent);
    const newQuantity = currentQuantity + quantityChange;
    
    if (newQuantity > 0 && newQuantity <= product.quantity + currentQuantity) {
      quantityElement.textContent = newQuantity;
      product.quantity -= quantityChange;
    } else if (newQuantity <= 0) {
      product.quantity += currentQuantity;
      cartItemElement.remove();
    } else {
      alert("재고가 부족합니다.");
      return { success: false, reason: 'insufficient_stock' };
    }
  } else if (isRemoveButton) {
    const quantityElement = cartItemElement.querySelector(".quantity-number");
    const removedQuantity = parseInt(quantityElement.textContent);
    product.quantity += removedQuantity;
    cartItemElement.remove();
  }

  calculateCartTotals();
  updateSelectOptions(productList, domRefs.productSelect, createElement, TOTAL_STOCK_WARNING_THRESHOLD);
  
  return { success: true, action: isQuantityButton ? 'quantity_change' : 'remove', product };
}; 