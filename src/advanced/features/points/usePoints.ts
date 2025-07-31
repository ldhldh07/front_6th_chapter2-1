import { useCallback } from "react";
import {
  PRODUCT_IDS,
  POINTS,
  BULK_THRESHOLDS,
  TUESDAY_DAY_NUMBER,
} from "../../shared/constants";
import type {
  Product,
  CartItem,
  PointsResult,
  PointsBonus,
  TuesdayPointsBonus,
  ProductTypes,
} from "../../shared/types";
import { calculateTotalQuantity, findProductById } from "../../shared/utils";

/**
 * 포인트 계산을 담당하는 React Hook
 */
export const usePoints = () => {
  // ==================== Helper Functions ====================

  /**
   * 장바구니에서 상품 타입을 분석합니다
   */
  const getCartProductTypes = useCallback(
    (cartItems: CartItem[], products: Product[]): ProductTypes => {
      return cartItems.reduce<ProductTypes>(
        (types, cartItem) => {
          const product = findProductById(products, cartItem.id);
          if (!product) return types;

          return {
            ...types,
            hasKeyboard:
              types.hasKeyboard || product.id === PRODUCT_IDS.KEYBOARD,
            hasMouse: types.hasMouse || product.id === PRODUCT_IDS.MOUSE,
            hasMonitorArm:
              types.hasMonitorArm || product.id === PRODUCT_IDS.MONITOR_ARM,
          };
        },
        { hasKeyboard: false, hasMouse: false, hasMonitorArm: false }
      );
    },
    []
  );

  // ==================== Points Calculators ====================

  /**
   * 기본 포인트를 계산합니다
   */
  const calculateBasePoints = useCallback((totalAmount: number): number => {
    return Math.floor(totalAmount / POINTS.CALCULATION_BASE);
  }, []);

  /**
   * 화요일 보너스 포인트를 계산합니다
   */
  const calculateTuesdayBonus = useCallback(
    (basePoints: number): TuesdayPointsBonus => {
      const today = new Date();
      const isTuesday = today.getDay() === TUESDAY_DAY_NUMBER;

      if (isTuesday && basePoints > 0) {
        return {
          points: basePoints * 2,
          description: "화요일 2배",
          applied: true,
        };
      }

      return {
        points: basePoints,
        description: "",
        applied: false,
      };
    },
    []
  );

  /**
   * 콤보 보너스 포인트를 계산합니다
   */
  const calculateComboBonuses = useCallback(
    (productTypes: ProductTypes): PointsBonus[] => {
      const bonuses: PointsBonus[] = [];

      if (productTypes.hasKeyboard && productTypes.hasMouse) {
        bonuses.push({
          points: POINTS.COMBO_BONUS,
          description: `키보드+마우스 세트 +${POINTS.COMBO_BONUS}p`,
        });

        if (productTypes.hasMonitorArm) {
          bonuses.push({
            points: POINTS.FULL_SET_BONUS,
            description: `풀세트 구매 +${POINTS.FULL_SET_BONUS}p`,
          });
        }
      }

      return bonuses;
    },
    []
  );

  /**
   * 대량구매 보너스 포인트를 계산합니다
   */
  const calculateBulkBonus = useCallback(
    (itemCount: number): PointsBonus | null => {
      if (itemCount >= BULK_THRESHOLDS.LARGE) {
        return {
          points: POINTS.LARGE_BULK_BONUS,
          description: `대량구매(${BULK_THRESHOLDS.LARGE}개+) +${POINTS.LARGE_BULK_BONUS}p`,
        };
      }

      if (itemCount >= BULK_THRESHOLDS.MEDIUM) {
        return {
          points: POINTS.MEDIUM_BULK_BONUS,
          description: `대량구매(${BULK_THRESHOLDS.MEDIUM}개+) +${POINTS.MEDIUM_BULK_BONUS}p`,
        };
      }

      if (itemCount >= BULK_THRESHOLDS.SMALL) {
        return {
          points: POINTS.SMALL_BULK_BONUS,
          description: `대량구매(${BULK_THRESHOLDS.SMALL}개+) +${POINTS.SMALL_BULK_BONUS}p`,
        };
      }

      return null;
    },
    []
  );

  // ==================== Main Points Calculation ====================

  /**
   * 전체 포인트를 계산합니다
   */
  const calculatePoints = useCallback(
    (
      cartItems: CartItem[],
      products: Product[],
      totalAmount: number
    ): PointsResult => {
      if (cartItems.length === 0) {
        return {
          totalPoints: 0,
          basePoints: 0,
          bonusDetails: [],
          isTuesday: false,
        };
      }

      const itemCount = calculateTotalQuantity(cartItems);
      const basePoints = calculateBasePoints(totalAmount);

      // 1. 기본 포인트
      const basePointDetails = basePoints > 0 ? [`기본: ${basePoints}p`] : [];
      const initialPoints = basePoints;

      // 2. 화요일 보너스
      const tuesdayBonus = calculateTuesdayBonus(basePoints);
      const tuesdayDetails = tuesdayBonus.applied
        ? [tuesdayBonus.description]
        : [];
      const afterTuesdayPoints = tuesdayBonus.applied
        ? tuesdayBonus.points
        : initialPoints;

      // 3. 콤보 보너스
      const productTypes = getCartProductTypes(cartItems, products);
      const comboBonuses = calculateComboBonuses(productTypes);
      const comboDetails = comboBonuses.map(bonus => bonus.description);
      const comboPoints = comboBonuses.reduce(
        (sum, bonus) => sum + bonus.points,
        0
      );

      // 4. 대량구매 보너스
      const bulkBonus = calculateBulkBonus(itemCount);
      const bulkDetails = bulkBonus ? [bulkBonus.description] : [];
      const bulkPoints = bulkBonus ? bulkBonus.points : 0;

      // 최종 계산
      const bonusDetails = [
        ...basePointDetails,
        ...tuesdayDetails,
        ...comboDetails,
        ...bulkDetails,
      ];
      const finalPoints = afterTuesdayPoints + comboPoints + bulkPoints;

      return {
        totalPoints: finalPoints,
        basePoints,
        bonusDetails,
        isTuesday: tuesdayBonus.applied,
      };
    },
    [
      calculateBasePoints,
      calculateTuesdayBonus,
      calculateComboBonuses,
      calculateBulkBonus,
      getCartProductTypes,
    ]
  );

  return {
    calculatePoints,
    calculateBasePoints,
    calculateTuesdayBonus,
    calculateComboBonuses,
    calculateBulkBonus,
    getCartProductTypes,
  };
};
