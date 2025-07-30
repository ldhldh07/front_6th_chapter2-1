import { useState } from 'react';
import type { Product, CartItem } from '../../shared/types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const decreaseProductStock = (productId: string, decreaseAmount: number) => {
    setProducts(previousProducts => 
      previousProducts.map(product => 
        product.id === productId 
          ? { ...product, quantity: product.quantity - decreaseAmount }
          : product
      )
    );
  };

  const increaseProductStock = (productId: string, increaseAmount: number) => {
    setProducts(previousProducts => 
      previousProducts.map(product => 
        product.id === productId 
          ? { ...product, quantity: product.quantity + increaseAmount }
          : product
      )
    );
  };

  const updateCartItemQuantity = (cartItems: CartItem[], productId: string, newQuantity: number): CartItem[] => {
    return cartItems.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    );
  };

  const addNewCartItem = (cartItems: CartItem[], productId: string): CartItem[] => {
    return [...cartItems, { id: productId, quantity: 1 }];
  };

  const handleAddToCart = (selectedItemId: string, productList: Product[]) => {
    const selectedProduct = productList.find(product => product.id === selectedItemId);

    if (!selectedItemId || !selectedProduct) {
      return { success: false, reason: 'invalid_product' };
    }
    
    if (selectedProduct.quantity <= 0) {
      return { success: false, reason: 'out_of_stock' };
    }

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === selectedProduct.id);
      
      if (!existingItem) {
        decreaseProductStock(selectedProduct.id, 1);
        return addNewCartItem(prevItems, selectedProduct.id);
      }

      const currentQuantity = existingItem.quantity;
      const newQuantity = currentQuantity + 1;
      
      if (newQuantity > selectedProduct.quantity + currentQuantity) {
        return prevItems;
      }

      decreaseProductStock(selectedProduct.id, 1);
      return updateCartItemQuantity(prevItems, selectedProduct.id, newQuantity);
    });

    return { success: true };
  };

  const removeCartItem = (cartItems: CartItem[], productId: string): CartItem[] => {
    return cartItems.filter(item => item.id !== productId);
  };

  const handleRemoveAction = (cartItems: CartItem[], productId: string) => {
    const cartItem = cartItems.find(item => item.id === productId);
    if (!cartItem) return cartItems;

    increaseProductStock(productId, cartItem.quantity);
    return removeCartItem(cartItems, productId);
  };

  const handleIncreaseAction = (cartItems: CartItem[], productId: string, product: Product) => {
    const cartItem = cartItems.find(item => item.id === productId);
    if (!cartItem) return cartItems;

    const newQuantity = cartItem.quantity + 1;
    if (newQuantity > product.quantity + cartItem.quantity) {
      return cartItems;
    }

    decreaseProductStock(productId, 1);
    return updateCartItemQuantity(cartItems, productId, newQuantity);
  };

  const handleDecreaseAction = (cartItems: CartItem[], productId: string) => {
    const cartItem = cartItems.find(item => item.id === productId);
    if (!cartItem) return cartItems;

    const newQuantity = cartItem.quantity - 1;
    
    if (newQuantity <= 0) {
      increaseProductStock(productId, cartItem.quantity);
      return removeCartItem(cartItems, productId);
    }

    increaseProductStock(productId, 1);
    return updateCartItemQuantity(cartItems, productId, newQuantity);
  };

  const handleCartActions = (action: 'increase' | 'decrease' | 'remove', productId: string, productList: Product[]) => {
    const product = productList.find(productItem => productItem.id === productId);
    
    if (!product) {
      return { success: false, reason: 'product_not_found' };
    }

    setCartItems(prevItems => {
      const cartItem = prevItems.find(item => item.id === productId);
      if (!cartItem) return prevItems;

      if (action === 'remove') return handleRemoveAction(prevItems, productId);
      if (action === 'increase') return handleIncreaseAction(prevItems, productId, product);
      if (action === 'decrease') return handleDecreaseAction(prevItems, productId);

      return prevItems;
    });

    return { success: true };
  };

  return {
    cartItems,
    products,
    setProducts,
    handleAddToCart,
    handleCartActions
  };
}; 