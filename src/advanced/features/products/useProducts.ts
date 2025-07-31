import { useState } from "react";
import { INITIAL_PRODUCT_DATA } from "../../shared/constants";
import type { Product } from "../../shared/types";
import { formatPriceKorean, findProductById } from "../../shared/utils";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const initializeProducts = (): Product[] => {
    return [...INITIAL_PRODUCT_DATA];
  };

  const getLowStockProducts = (
    productList: Product[],
    threshold: number
  ): Product[] => {
    return productList.filter(
      product => product.quantity > 0 && product.quantity < threshold
    );
  };

  const getOptionData = (item: Product) => {
    const saleIcon = (item.onSale ? "⚡" : "") + (item.suggestSale ? "💝" : "");
    const displayName = `${saleIcon}${item.name} - ${formatPriceKorean(item.price)}`;

    return {
      value: item.id,
      text: displayName,
      disabled: item.quantity <= 0,
    };
  };

  const formatPriceDisplay = (
    basePrice: number,
    currentPrice: number,
    hasDiscount: boolean
  ) => {
    if (!hasDiscount) return formatPriceKorean(currentPrice);

    if (basePrice <= 0) {
      console.warn("basePrice가 0 이하입니다:", basePrice);
      return formatPriceKorean(currentPrice);
    }

    const discountRate = Math.round(
      ((basePrice - currentPrice) / basePrice) * 100
    );
    return `<span class="line-through text-gray-400">${formatPriceKorean(basePrice)}</span> → <span class="text-red-600 font-semibold">${formatPriceKorean(currentPrice)} (${discountRate}% 할인)</span>`;
  };

  const getProductDisplayInfo = (product: Product) => {
    const basePrice = product.originalPrice;
    const currentPrice = product.price;
    const hasDiscount = currentPrice < basePrice;
    const priceDisplay = formatPriceDisplay(
      basePrice,
      currentPrice,
      hasDiscount
    );

    return {
      id: product.id,
      name: product.name,
      priceDisplay,
      hasDiscount,
      isOutOfStock: product.quantity <= 0,
      isLowStock: product.quantity > 0 && product.quantity < 5,
      stockCount: product.quantity,
    };
  };

  return {
    products,
    setProducts,
    initializeProducts,
    findProductById: (productId: string, productList: Product[]) =>
      findProductById(productList, productId),
    getLowStockProducts,
    getOptionData,
    getProductDisplayInfo,
  };
};
