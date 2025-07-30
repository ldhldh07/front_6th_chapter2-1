import { useState } from 'react';
import type { Product, CartItem } from '../../shared/types';

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);



  const handleAddToCart = (selectedItemId: string, productList: Product[]) => {
    const selectedProduct = productList.find(product => product.id === selectedItemId);

    if (!selectedItemId || !selectedProduct) {
      return { success: false, reason: 'invalid_product' };
    }
    
    if (selectedProduct.quantity <= 0) {
      return { success: false, reason: 'out_of_stock' };
    }

    const existingItem = cartItems.find(item => item.id === selectedProduct.id);
    
    if (!existingItem) {
      setCartItems(prev => [...prev, { id: selectedProduct.id, quantity: 1 }]);
      setProducts(prev => prev.map(product => 
        product.id === selectedProduct.id 
          ? { ...product, quantity: product.quantity - 1 }
          : product
      ));
    } else {
      const newQuantity = existingItem.quantity + 1;
      
      if (newQuantity > selectedProduct.quantity + existingItem.quantity) {
        return { success: false, reason: 'out_of_stock' };
      }

      setCartItems(prev => prev.map(item =>
        item.id === selectedProduct.id 
          ? { ...item, quantity: newQuantity }
          : item
      ));
      setProducts(prev => prev.map(product => 
        product.id === selectedProduct.id 
          ? { ...product, quantity: product.quantity - 1 }
          : product
      ));
    }

    return { success: true };
  };



  const removeItemFromCart = (productId: string, cartItem: CartItem) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, quantity: product.quantity + cartItem.quantity }
        : product
    ));
    return { success: true };
  };

  const increaseCartItemQuantity = (productId: string, product: Product) => {
    if (product.quantity <= 0) {
      return { success: false, reason: 'out_of_stock' };
    }
    
    setCartItems(prev => prev.map(item =>
      item.id === productId 
        ? { ...item, quantity: item.quantity + 1 }
        : item
    ));
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, quantity: p.quantity - 1 }
        : p
    ));
    return { success: true };
  };

  const decreaseCartItemQuantity = (productId: string, cartItem: CartItem) => {
    const newQuantity = cartItem.quantity - 1;
    
    if (newQuantity <= 0) {
      return removeItemFromCart(productId, cartItem);
    }

    setCartItems(prev => prev.map(item =>
      item.id === productId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, quantity: product.quantity + 1 }
        : product
    ));
    return { success: true };
  };

  const handleCartActions = (action: 'increase' | 'decrease' | 'remove', productId: string, productList: Product[]) => {
    const product = productList.find(productItem => productItem.id === productId);
    if (!product) {
      return { success: false, reason: 'product_not_found' };
    }

    const cartItem = cartItems.find(item => item.id === productId);
    if (!cartItem) {
      return { success: false, reason: 'item_not_found' };
    }

    if (action === 'remove') return removeItemFromCart(productId, cartItem);
    if (action === 'increase') return increaseCartItemQuantity(productId, product);
    if (action === 'decrease') return decreaseCartItemQuantity(productId, cartItem);

    return { success: false, reason: 'invalid_action' };
  };

  return {
    cartItems,
    products,
    setProducts,
    handleAddToCart,
    handleCartActions
  };
}; 