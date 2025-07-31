import { useState } from "react";
import type { Product, CartItem } from "../../shared/types";
import { findProductById } from "../../shared/utils";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  /**
   * 장바구니 추가 입력값을 검증합니다
   */
  const validateAddToCartInput = (
    selectedItemId: string,
    productList: Product[]
  ) => {
    if (typeof selectedItemId !== "string" || !selectedItemId.trim()) {
      return { isValid: false, reason: "no_product_selected" };
    }

    if (!Array.isArray(productList)) {
      console.warn("validateAddToCartInput: productList가 배열이 아닙니다");
      return { isValid: false, reason: "invalid_product_list" };
    }

    const selectedProduct = findProductById(productList, selectedItemId);
    if (!selectedProduct) {
      return { isValid: false, reason: "product_not_found" };
    }

    if (
      typeof selectedProduct.quantity !== "number" ||
      selectedProduct.quantity < 0
    ) {
      console.warn(
        "validateAddToCartInput: 상품 수량이 잘못되었습니다",
        selectedProduct
      );
      return { isValid: false, reason: "invalid_product_data" };
    }

    if (selectedProduct.quantity <= 0) {
      return { isValid: false, reason: "out_of_stock" };
    }

    return { isValid: true, product: selectedProduct };
  };

  /**
   * 상품 재고를 1개 감소시킵니다
   */
  const decreaseProductStock = (productId: string) => {
    setProducts(currentProducts =>
      currentProducts.map(currentProduct =>
        currentProduct.id === productId
          ? { ...currentProduct, quantity: currentProduct.quantity - 1 }
          : currentProduct
      )
    );
  };

  /**
   * 상품 재고를 지정된 수량만큼 증가시킵니다
   */
  const increaseProductStock = (productId: string, quantity: number) => {
    setProducts(currentProducts =>
      currentProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: product.quantity + quantity }
          : product
      )
    );
  };

  /**
   * 장바구니에 새 아이템을 추가합니다
   */
  const addNewItemToCart = (product: Product) => {
    setCartItems(currentCartItems => [
      ...currentCartItems,
      { id: product.id, quantity: 1 },
    ]);
    decreaseProductStock(product.id);
  };

  /**
   * 기존 장바구니 아이템의 수량을 1개 증가시킵니다
   */
  const increaseExistingItemQuantity = (
    product: Product,
    existingItem: CartItem
  ) => {
    const newQuantity = existingItem.quantity + 1;

    if (newQuantity > product.quantity + existingItem.quantity) {
      return { success: false, reason: "out_of_stock" };
    }

    setCartItems(currentCartItems =>
      currentCartItems.map(item =>
        item.id === product.id ? { ...item, quantity: newQuantity } : item
      )
    );
    decreaseProductStock(product.id);

    return { success: true };
  };

  const handleAddToCart = (selectedItemId: string, productList: Product[]) => {
    const validation = validateAddToCartInput(selectedItemId, productList);
    if (!validation.isValid) {
      return { success: false, reason: validation.reason };
    }

    const selectedProduct = validation.product!;
    const existingItem = findProductById(cartItems, selectedProduct.id);

    if (!existingItem) {
      // 새로운 상품이면 새 아이템으로 추가
      addNewItemToCart(selectedProduct);
      return { success: true };
    }

    // 기존 상품이면 수량 증가
    return increaseExistingItemQuantity(selectedProduct, existingItem);
  };

  const removeItemFromCart = (productId: string, cartItem: CartItem) => {
    setCartItems(currentCartItems =>
      currentCartItems.filter(item => item.id !== productId)
    );
    increaseProductStock(productId, cartItem.quantity);
    return { success: true };
  };

  const increaseCartItemQuantity = (productId: string, product: Product) => {
    if (product.quantity <= 0) {
      return { success: false, reason: "out_of_stock" };
    }

    setCartItems(currentCartItems =>
      currentCartItems.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    decreaseProductStock(productId);
    return { success: true };
  };

  const decreaseCartItemQuantity = (productId: string, cartItem: CartItem) => {
    const newQuantity = cartItem.quantity - 1;

    if (newQuantity <= 0) return removeItemFromCart(productId, cartItem);

    setCartItems(currentCartItems =>
      currentCartItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
    increaseProductStock(productId, 1);
    return { success: true };
  };

  const handleCartActions = (
    action: "increase" | "decrease" | "remove",
    productId: string,
    productList: Product[]
  ) => {
    const product = findProductById(productList, productId);

    if (!product) return { success: false, reason: "product_not_found" };

    const cartItem = findProductById(cartItems, productId);

    if (!cartItem) return { success: false, reason: "item_not_found" };

    if (action === "remove") return removeItemFromCart(productId, cartItem);
    if (action === "increase")
      return increaseCartItemQuantity(productId, product);
    if (action === "decrease")
      return decreaseCartItemQuantity(productId, cartItem);

    return { success: false, reason: "invalid_action" };
  };

  return {
    cartItems,
    products,
    setProducts,
    handleAddToCart,
    handleCartActions,
  };
};
