import { useState } from 'react';
import { INITIAL_PRODUCT_DATA } from '../../shared/constants';
import type { Product } from '../../shared/types';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const initializeProducts = (): Product[] => {
    return [...INITIAL_PRODUCT_DATA];
  };

  const findProductById = (productId: string, productList: Product[]): Product | undefined => {
    return productList.find(product => product.id === productId);
  };

  const getLowStockProducts = (productList: Product[], threshold: number): Product[] => {
    return productList.filter(product => 
      product.quantity > 0 && product.quantity < threshold
    );
  };

  const getOptionData = (item: Product) => {
    const displayName = item.onSale && item.suggestSale
      ? `⚡💝${item.name} - ${item.price.toLocaleString()}원`
      : item.onSale
      ? `⚡${item.name} - ${item.price.toLocaleString()}원`
      : item.suggestSale
      ? `💝${item.name} - ${item.price.toLocaleString()}원`
      : `${item.name} - ${item.price.toLocaleString()}원`;

    return {
      value: item.id,
      text: displayName,
      disabled: item.quantity <= 0
    };
  };

  const getProductDisplayInfo = (product: Product) => {
    const basePrice = product.originalPrice;
    const currentPrice = product.price;
    const hasDiscount = currentPrice < basePrice;

    let priceDisplay = `${currentPrice.toLocaleString()}원`;
    
    if (hasDiscount) {
      const discountRate = Math.round(((basePrice - currentPrice) / basePrice) * 100);
      priceDisplay = `<span class="line-through text-gray-400">${basePrice.toLocaleString()}원</span> → <span class="text-red-600 font-semibold">${currentPrice.toLocaleString()}원 (${discountRate}% 할인)</span>`;
    }

    return {
      id: product.id,
      name: product.name,
      priceDisplay,
      hasDiscount,
      isOutOfStock: product.quantity <= 0,
      isLowStock: product.quantity > 0 && product.quantity < 5,
      stockCount: product.quantity
    };
  };



  return {
    products,
    setProducts,
    initializeProducts,
    findProductById,
    getLowStockProducts,
    getOptionData,
    getProductDisplayInfo
  };
}; 