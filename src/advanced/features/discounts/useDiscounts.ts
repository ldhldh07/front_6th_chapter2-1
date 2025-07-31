import { useCallback } from "react";
import {
  PRODUCT_IDS,
  DISCOUNT_RATES,
  QUANTITY_DISCOUNT_THRESHOLD,
  BULK_DISCOUNT_THRESHOLD,
  TUESDAY_DAY_NUMBER,
  TUESDAY_ADDITIONAL_DISCOUNT_RATE,
} from "../../shared/constants";
import type {
  Product,
  CartItem,
  DiscountResult,
  DiscountInfo,
  TuesdayDiscountResult,
} from "../../shared/types";
import {
  calculateTotalQuantity,
  calculateItemTotal,
  findProductById,
} from "../../shared/utils";

/**
 * 할인 계산을 담당하는 React Hook
 */
export const useDiscounts = () => {
  // ==================== Product Discount Strategies ====================

  /**
   * 상품별 할인율 매핑
   */
  const PRODUCT_DISCOUNT_MAP = {
    [PRODUCT_IDS.KEYBOARD]: DISCOUNT_RATES.KEYBOARD,
    [PRODUCT_IDS.MOUSE]: DISCOUNT_RATES.MOUSE,
    [PRODUCT_IDS.MONITOR_ARM]: DISCOUNT_RATES.MONITOR_ARM,
    [PRODUCT_IDS.LAPTOP_POUCH]: DISCOUNT_RATES.SUGGESTION,
    [PRODUCT_IDS.SPEAKER]: DISCOUNT_RATES.SPEAKER,
  } as const;

  /**
   * 할인 타입을 결정합니다
   */
  const determineDiscountType = (
    isBulkDiscount: boolean,
    isTuesday: boolean,
    hasItemDiscounts: boolean
  ): DiscountResult["type"] => {
    if (isBulkDiscount && isTuesday) return "combined";
    if (isBulkDiscount) return "bulk";
    if (isTuesday) return "tuesday";
    if (hasItemDiscounts) return "product";
    return "none";
  };

  /**
   * 상품별 할인율을 반환합니다
   */
  const getProductDiscountRate = useCallback((productId: string): number => {
    return (
      PRODUCT_DISCOUNT_MAP[productId as keyof typeof PRODUCT_DISCOUNT_MAP] || 0
    );
  }, []);

  /**
   * 개별 상품 할인 전략을 적용합니다
   */
  const applyProductDiscount = useCallback(
    (product: Product, quantity: number, threshold: number): number => {
      if (quantity >= threshold) {
        return getProductDiscountRate(product.id);
      }
      return 0;
    },
    [getProductDiscountRate]
  );

  /**
   * 대량구매 할인 전략을 적용합니다
   */
  const applyBulkDiscount = useCallback(
    (itemCount: number, subtotal: number) => {
      if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
        return {
          totalAmount: subtotal * (1 - DISCOUNT_RATES.BULK),
          discRate: DISCOUNT_RATES.BULK,
          type: "bulk" as const,
        };
      }
      return null;
    },
    []
  );

  /**
   * 화요일 할인 전략을 적용합니다
   */
  const calculateTuesdayDiscount = useCallback(
    (totalAmount: number, originalTotal: number): TuesdayDiscountResult => {
      const today = new Date();
      const isTuesday = today.getDay() === TUESDAY_DAY_NUMBER;

      if (isTuesday && totalAmount > 0) {
        const discountedAmount =
          totalAmount * (1 - TUESDAY_ADDITIONAL_DISCOUNT_RATE);
        const discRate = 1 - discountedAmount / originalTotal;
        return {
          totalAmount: discountedAmount,
          discRate,
          isTuesday,
          type: "tuesday",
        };
      }

      return {
        totalAmount,
        discRate:
          totalAmount < originalTotal ? 1 - totalAmount / originalTotal : 0,
        isTuesday,
        type: "none",
      };
    },
    []
  );

  // ==================== Main Discount Calculation ====================

  /**
   * 전체 할인을 계산합니다
   */
  const calculateDiscounts = useCallback(
    (cartItems: CartItem[], products: Product[]): DiscountResult => {
      const itemCount = calculateTotalQuantity(cartItems);

      // 1. 개별 상품 할인 계산
      const { subtotal, totalAmount, itemDiscounts } = cartItems.reduce(
        (acc, cartItem) => {
          const product = findProductById(products, cartItem.id);
          if (!product) return acc;

          const itemTotal = calculateItemTotal(
            product.price,
            cartItem.quantity
          );
          const newSubtotal = acc.subtotal + itemTotal;

          const discountRate = applyProductDiscount(
            product,
            cartItem.quantity,
            QUANTITY_DISCOUNT_THRESHOLD
          );
          if (discountRate > 0) {
            return {
              subtotal: newSubtotal,
              totalAmount: acc.totalAmount + itemTotal * (1 - discountRate),
              itemDiscounts: [
                ...acc.itemDiscounts,
                {
                  name: product.name,
                  discount: discountRate * 100,
                },
              ],
            };
          }

          return {
            subtotal: newSubtotal,
            totalAmount: acc.totalAmount + itemTotal,
            itemDiscounts: acc.itemDiscounts,
          };
        },
        { subtotal: 0, totalAmount: 0, itemDiscounts: [] as DiscountInfo[] }
      );

      // 2. 대량구매 할인 확인
      const bulkDiscountResult = applyBulkDiscount(itemCount, subtotal);
      const isBulkDiscount = bulkDiscountResult !== null;

      const finalTotalAmount = isBulkDiscount
        ? bulkDiscountResult.totalAmount
        : totalAmount;
      const finalItemDiscounts = isBulkDiscount ? [] : itemDiscounts; // 대량구매 할인이 개별 할인보다 우선

      // 3. 화요일 할인 적용
      const tuesdayResult = calculateTuesdayDiscount(
        finalTotalAmount,
        subtotal
      );
      const finalAmount = tuesdayResult.totalAmount;

      // 4. 최종 할인율 계산
      const finalDiscRate = subtotal > 0 ? 1 - finalAmount / subtotal : 0;
      const savedAmount = subtotal - finalAmount;

      // 5. 할인 타입 결정
      const discountType = determineDiscountType(
        isBulkDiscount,
        tuesdayResult.isTuesday,
        finalItemDiscounts.length > 0
      );

      return {
        totalAmount: Math.round(finalAmount),
        discRate: finalDiscRate,
        type: discountType,
        savedAmount: Math.round(savedAmount),
        itemDiscounts: finalItemDiscounts,
        isBulkDiscount,
        isTuesday: tuesdayResult.isTuesday,
      };
    },
    [applyProductDiscount, applyBulkDiscount, calculateTuesdayDiscount]
  );

  return {
    calculateDiscounts,
    getProductDiscountRate,
    applyProductDiscount,
    applyBulkDiscount,
    calculateTuesdayDiscount,
  };
};
