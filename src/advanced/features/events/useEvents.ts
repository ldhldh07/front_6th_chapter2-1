import { useEffect, useCallback, useRef } from "react";
import { EVENT_CONFIG } from "../../shared/constants";
import type { Product } from "../../shared/types";

interface UseEventsProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cartItems: any[];
  lastSelectedItem: string | null;
}

/**
 * 이벤트 타이머 시스템을 담당하는 React Hook
 */
export const useEvents = ({
  products,
  setProducts,
  cartItems,
  lastSelectedItem,
}: UseEventsProps) => {
  const lightningTimerRef = useRef<number | null>(null);
  const suggestionTimerRef = useRef<number | null>(null);
  const lightningIntervalRef = useRef<number | null>(null);
  const suggestionIntervalRef = useRef<number | null>(null);

  // ==================== Event Handlers ====================

  /**
   * 번개세일을 실행합니다
   */
  const triggerLightningSale = useCallback(() => {
    const eligibleProducts = products.filter(
      product => product.quantity > 0 && !product.onSale
    );

    if (eligibleProducts.length === 0) return;

    const luckyIndex = Math.floor(Math.random() * eligibleProducts.length);
    const luckyProduct = eligibleProducts[luckyIndex];

    setProducts(currentProducts =>
      currentProducts.map(product =>
        product.id === luckyProduct.id
          ? {
              ...product,
              price: Math.round(
                product.originalPrice *
                  (1 - EVENT_CONFIG.LIGHTNING_SALE_DISCOUNT_RATE)
              ),
              onSale: true,
            }
          : product
      )
    );

    alert("⚡번개세일! " + luckyProduct.name + "이(가) 20% 할인 중입니다!");
  }, [products, setProducts]);

  /**
   * 추천상품 할인을 실행합니다
   */
  const triggerSuggestionSale = useCallback(() => {
    if (cartItems.length === 0 || !lastSelectedItem) return;

    const suggestedProduct = products.find(
      product =>
        product.id !== lastSelectedItem &&
        product.quantity > 0 &&
        !product.suggestSale
    );

    if (!suggestedProduct) return;

    setProducts(currentProducts =>
      currentProducts.map(product =>
        product.id === suggestedProduct.id
          ? {
              ...product,
              price: Math.round(
                product.price * (1 - EVENT_CONFIG.SUGGESTION_DISCOUNT_RATE)
              ),
              suggestSale: true,
            }
          : product
      )
    );

    alert(
      "💝 " +
        suggestedProduct.name +
        "은(는) 어떠세요? 지금 구매하시면 5% 추가 할인!"
    );
  }, [products, setProducts, cartItems.length, lastSelectedItem]);

  // ==================== Timer Setup ====================

  /**
   * 번개세일 타이머를 시작합니다
   */
  const startLightningSaleTimer = useCallback(() => {
    const delay = Math.random() * EVENT_CONFIG.LIGHTNING_SALE_MAX_DELAY;

    lightningTimerRef.current = window.setTimeout(() => {
      lightningIntervalRef.current = window.setInterval(() => {
        triggerLightningSale();
      }, EVENT_CONFIG.LIGHTNING_SALE_DURATION);
    }, delay);
  }, [triggerLightningSale]);

  /**
   * 추천상품 할인 타이머를 시작합니다
   */
  const startSuggestionSaleTimer = useCallback(() => {
    const delay = Math.random() * EVENT_CONFIG.SUGGESTION_SALE_MAX_DELAY;

    suggestionTimerRef.current = window.setTimeout(() => {
      suggestionIntervalRef.current = window.setInterval(() => {
        triggerSuggestionSale();
      }, EVENT_CONFIG.SUGGESTION_INTERVAL_MS);
    }, delay);
  }, [triggerSuggestionSale]);

  /**
   * 모든 타이머를 정리합니다
   */
  const cleanupTimers = useCallback(() => {
    try {
      if (lightningTimerRef.current) {
        clearTimeout(lightningTimerRef.current);
        lightningTimerRef.current = null;
      }
      if (suggestionTimerRef.current) {
        clearTimeout(suggestionTimerRef.current);
        suggestionTimerRef.current = null;
      }
      if (lightningIntervalRef.current) {
        clearInterval(lightningIntervalRef.current);
        lightningIntervalRef.current = null;
      }
      if (suggestionIntervalRef.current) {
        clearInterval(suggestionIntervalRef.current);
        suggestionIntervalRef.current = null;
      }
    } catch (error) {
      console.warn("타이머 정리 중 에러:", error);
    }
  }, []);

  // ==================== Effect ====================

  useEffect(() => {
    startLightningSaleTimer();
    startSuggestionSaleTimer();

    return cleanupTimers;
  }, [startLightningSaleTimer, startSuggestionSaleTimer, cleanupTimers]);

  return {
    triggerLightningSale,
    triggerSuggestionSale,
    cleanupTimers,
  };
};
