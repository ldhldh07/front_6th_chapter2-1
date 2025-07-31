import { useState } from "react";
import type { Product, CartItem } from "../../shared/types";
import { findProductById } from "../../shared/utils";

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const handleAddToCart = (selectedItemId: string, productList: Product[]) => {
    if (!selectedItemId)
      return { success: false, reason: "no_product_selected" };

    const selectedProduct = findProductById(productList, selectedItemId);
    if (!selectedProduct)
      return { success: false, reason: "product_not_found" };

    if (selectedProduct.quantity <= 0)
      return { success: false, reason: "out_of_stock" };

    const existingItem = findProductById(cartItems, selectedProduct.id);

    if (!existingItem) {
      setCartItems(currentCartItems => [
        ...currentCartItems,
        { id: selectedProduct.id, quantity: 1 },
      ]);
      setProducts(currentProducts =>
        currentProducts.map(currentProduct =>
          currentProduct.id === selectedProduct.id
            ? { ...currentProduct, quantity: currentProduct.quantity - 1 }
            : currentProduct
        )
      );
      return { success: true };
    }

    const newQuantity = existingItem.quantity + 1;

    if (newQuantity > selectedProduct.quantity + existingItem.quantity) {
      return { success: false, reason: "out_of_stock" };
    }

    setCartItems(currentCartItems =>
      currentCartItems.map(item =>
        item.id === selectedProduct.id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
    setProducts(currentProducts =>
      currentProducts.map(currentProduct =>
        currentProduct.id === selectedProduct.id
          ? { ...currentProduct, quantity: currentProduct.quantity - 1 }
          : currentProduct
      )
    );

    return { success: true };
  };

  const removeItemFromCart = (productId: string, cartItem: CartItem) => {
    setCartItems(currentCartItems =>
      currentCartItems.filter(item => item.id !== productId)
    );
    setProducts(currentProducts =>
      currentProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: product.quantity + cartItem.quantity }
          : product
      )
    );
    return { success: true };
  };

  const increaseCartItemQuantity = (productId: string, product: Product) => {
    if (product.quantity <= 0)
      return { success: false, reason: "out_of_stock" };

    setCartItems(currentCartItems =>
      currentCartItems.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
    setProducts(currentProducts =>
      currentProducts.map(productItem =>
        productItem.id === productId
          ? { ...productItem, quantity: productItem.quantity - 1 }
          : productItem
      )
    );
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
    setProducts(currentProducts =>
      currentProducts.map(product =>
        product.id === productId
          ? { ...product, quantity: product.quantity + 1 }
          : product
      )
    );
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
