import { useCallback } from 'react';
import { 
  PRODUCT_IDS, 
  DISCOUNT_RATES, 
  QUANTITY_DISCOUNT_THRESHOLD,
  BULK_DISCOUNT_THRESHOLD,
  TUESDAY_DAY_NUMBER,
  TUESDAY_ADDITIONAL_DISCOUNT_RATE
} from '../../shared/constants';
import type { Product, CartItem, DiscountResult, DiscountInfo, TuesdayDiscountResult } from '../../shared/types';

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
    [PRODUCT_IDS.SPEAKER]: DISCOUNT_RATES.SPEAKER
  } as const;

  /**
   * 상품별 할인율을 반환합니다
   */
  const getProductDiscountRate = useCallback((productId: string): number => {
    return PRODUCT_DISCOUNT_MAP[productId as keyof typeof PRODUCT_DISCOUNT_MAP] || 0;
  }, []);

  /**
   * 개별 상품 할인 전략을 적용합니다
   */
  const applyProductDiscount = useCallback((product: Product, quantity: number, threshold: number): number => {
    if (quantity >= threshold) {
      return getProductDiscountRate(product.id);
    }
    return 0;
  }, [getProductDiscountRate]);

  /**
   * 대량구매 할인 전략을 적용합니다
   */
  const applyBulkDiscount = useCallback((itemCount: number, subtotal: number) => {
    if (itemCount >= BULK_DISCOUNT_THRESHOLD) {
      return {
        totalAmount: subtotal * (1 - DISCOUNT_RATES.BULK),
        discRate: DISCOUNT_RATES.BULK,
        type: 'bulk' as const
      };
    }
    return null;
  }, []);

  /**
   * 화요일 할인 전략을 적용합니다
   */
  const calculateTuesdayDiscount = useCallback((
    totalAmount: number, 
    originalTotal: number
  ): TuesdayDiscountResult => {
    const today = new Date();
    const isTuesday = today.getDay() === TUESDAY_DAY_NUMBER;
    
    if (isTuesday && totalAmount > 0) {
      const discountedAmount = totalAmount * (1 - TUESDAY_ADDITIONAL_DISCOUNT_RATE);
      const discRate = 1 - discountedAmount / originalTotal;
      return {
        totalAmount: discountedAmount,
        discRate,
        isTuesday,
        type: 'tuesday'
      };
    }
    
    return {
      totalAmount,
      discRate: totalAmount < originalTotal ? 1 - totalAmount / originalTotal : 0,
      isTuesday,
      type: 'none'
    };
  }, []);

  // ==================== Main Discount Calculation ====================

  /**
   * 전체 할인을 계산합니다
   */
  const calculateDiscounts = useCallback((
    cartItems: CartItem[], 
    products: Product[]
  ): DiscountResult => {
    let subtotal = 0;
    let totalAmount = 0;
    let itemDiscounts: DiscountInfo[] = [];
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    // 1. 개별 상품 할인 계산
    cartItems.forEach(cartItem => {
      const product = products.find(p => p.id === cartItem.id);
      if (!product) return;

      const itemTotal = product.price * cartItem.quantity;
      subtotal += itemTotal;

      const discountRate = applyProductDiscount(product, cartItem.quantity, QUANTITY_DISCOUNT_THRESHOLD);
      if (discountRate > 0) {
        itemDiscounts.push({
          name: product.name,
          discount: discountRate * 100
        });
        totalAmount += itemTotal * (1 - discountRate);
      } else {
        totalAmount += itemTotal;
      }
    });

    // 2. 대량구매 할인 확인
    const bulkDiscountResult = applyBulkDiscount(itemCount, subtotal);
    const isBulkDiscount = bulkDiscountResult !== null;
    
    if (isBulkDiscount) {
      totalAmount = bulkDiscountResult.totalAmount;
      itemDiscounts = []; // 대량구매 할인이 개별 할인보다 우선
    }

    // 3. 화요일 할인 적용
    const tuesdayResult = calculateTuesdayDiscount(totalAmount, subtotal);
    totalAmount = tuesdayResult.totalAmount;

    // 4. 최종 할인율 계산
    const finalDiscRate = subtotal > 0 ? 1 - totalAmount / subtotal : 0;
    const savedAmount = subtotal - totalAmount;

    // 5. 할인 타입 결정
    let discountType: DiscountResult['type'] = 'none';
    if (isBulkDiscount && tuesdayResult.isTuesday) {
      discountType = 'combined';
    } else if (isBulkDiscount) {
      discountType = 'bulk';
    } else if (tuesdayResult.isTuesday) {
      discountType = 'tuesday';
    } else if (itemDiscounts.length > 0) {
      discountType = 'product';
    }

    return {
      totalAmount: Math.round(totalAmount),
      discRate: finalDiscRate,
      type: discountType,
      savedAmount: Math.round(savedAmount),
      itemDiscounts,
      isBulkDiscount,
      isTuesday: tuesdayResult.isTuesday
    };
  }, [applyProductDiscount, applyBulkDiscount, calculateTuesdayDiscount]);

  return {
    calculateDiscounts,
    getProductDiscountRate,
    applyProductDiscount,
    applyBulkDiscount,
    calculateTuesdayDiscount
  };
}; 