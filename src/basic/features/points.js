/**
 * Points Feature - 통합 모듈
 * 포인트 계산 로직과 UI 관리
 */

// Constants import
import {
  POINTS_CALCULATION_BASE,
  COMBO_BONUS_POINTS,
  FULL_SET_BONUS_POINTS,
  SMALL_BULK_BONUS_POINTS,
  MEDIUM_BULK_BONUS_POINTS,
  LARGE_BULK_BONUS_POINTS,
  SMALL_BULK_THRESHOLD,
  MEDIUM_BULK_THRESHOLD,
  LARGE_BULK_THRESHOLD,
  TUESDAY_DAY_NUMBER,
} from "../constants.js";

// ==================== Points Calculators ====================

/**
 * 기본 포인트를 계산합니다
 * @param {number} totalAmount - 총 구매 금액
 * @returns {number} 기본 포인트
 */
export const calculateBasePoints = totalAmount => {
  return Math.floor(totalAmount / POINTS_CALCULATION_BASE);
};

/**
 * 화요일 보너스 포인트를 계산합니다
 * @param {number} basePoints - 기본 포인트
 * @returns {Object} 계산 결과
 */
export const calculateTuesdayBonus = basePoints => {
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
    description: null,
    applied: false,
  };
};

/**
 * 콤보 보너스 포인트를 계산합니다
 * @param {Object} productTypes - 상품 유형 정보
 * @returns {Array} 보너스 목록
 */
export const calculateComboBonuses = productTypes => {
  const bonuses = [];

  if (productTypes.hasKeyboard && productTypes.hasMouse) {
    bonuses.push({
      points: COMBO_BONUS_POINTS,
      description: `키보드+마우스 세트 +${COMBO_BONUS_POINTS}p`,
    });

    if (productTypes.hasMonitorArm) {
      bonuses.push({
        points: FULL_SET_BONUS_POINTS,
        description: `풀세트 구매 +${FULL_SET_BONUS_POINTS}p`,
      });
    }
  }

  return bonuses;
};

/**
 * 대량구매 보너스 포인트를 계산합니다
 * @param {number} itemCount - 총 아이템 수량
 * @returns {Object|null} 대량구매 보너스
 */
export const calculateBulkBonus = itemCount => {
  if (itemCount >= LARGE_BULK_THRESHOLD) {
    return {
      points: LARGE_BULK_BONUS_POINTS,
      description: `대량구매(${LARGE_BULK_THRESHOLD}개+) +${LARGE_BULK_BONUS_POINTS}p`,
    };
  }

  if (itemCount >= MEDIUM_BULK_THRESHOLD) {
    return {
      points: MEDIUM_BULK_BONUS_POINTS,
      description: `대량구매(${MEDIUM_BULK_THRESHOLD}개+) +${MEDIUM_BULK_BONUS_POINTS}p`,
    };
  }

  if (itemCount >= SMALL_BULK_THRESHOLD) {
    return {
      points: SMALL_BULK_BONUS_POINTS,
      description: `대량구매(${SMALL_BULK_THRESHOLD}개+) +${SMALL_BULK_BONUS_POINTS}p`,
    };
  }

  return null;
};

// ==================== Points Display UI ====================

/**
 * 포인트 정보를 UI에 표시합니다
 * @param {number} finalPoints - 최종 포인트
 * @param {Array} pointsDetail - 포인트 상세 내역
 */
export const displayPointsInfo = (
  finalPoints,
  pointsDetail,
  loyaltyPointsElement = null
) => {
  const pointsTag =
    loyaltyPointsElement || document.getElementById("loyalty-points");

  if (!pointsTag) return;

  if (finalPoints > 0) {
    pointsTag.innerHTML =
      '<div>적립 포인트: <span class="font-bold">' +
      finalPoints +
      "p</span></div>" +
      '<div class="text-2xs opacity-70 mt-1">' +
      pointsDetail.join(", ") +
      "</div>";
    pointsTag.style.display = "block";
    return;
  }

  pointsTag.textContent = "적립 포인트: 0p";
  pointsTag.style.display = "block";
};

/**
 * 장바구니가 비어있을 때 포인트 UI를 숨깁니다
 * @param {number} cartItemsLength - 장바구니 아이템 수
 */
export const hidePointsIfEmpty = (
  cartItemsLength,
  loyaltyPointsElement = null
) => {
  if (cartItemsLength !== 0) return;

  const pointsTag =
    loyaltyPointsElement || document.getElementById("loyalty-points");
  if (!pointsTag) return;

  pointsTag.style.display = "none";
};

/**
 * 보너스 포인트를 계산하고 렌더링합니다 (main.basic.js에서 이전)
 * @param {HTMLCollection} cartItems - 장바구니 DOM 요소들
 * @param {number} totalAmount - 총 금액
 * @param {number} itemCount - 아이템 개수
 * @param {Array} productList - 상품 목록
 * @param {Object} appState - 앱 상태 (bonusPoints 업데이트용)
 * @param {Function} calculateBasePoints - 기본 포인트 계산 함수
 * @param {Function} calculateTuesdayBonus - 화요일 보너스 계산 함수
 * @param {Function} calculateComboBonuses - 콤보 보너스 계산 함수
 * @param {Function} calculateBulkBonus - 대량구매 보너스 계산 함수
 * @param {Function} getCartProductTypes - 장바구니 상품 타입 조회 함수
 * @param {Object} domRefs - DOM 참조 객체
 */
export const renderBonusPoints = (
  cartItems,
  totalAmount,
  itemCount,
  productList,
  appState,
  calculateBasePoints,
  calculateTuesdayBonus,
  calculateComboBonuses,
  calculateBulkBonus,
  getCartProductTypes,
  domRefs
) => {
  const loyaltyPointsElement = domRefs?.loyaltyPointsElement || null;

  hidePointsIfEmpty(cartItems.length, loyaltyPointsElement);
  if (cartItems.length === 0) return;

  const basePoints = calculateBasePoints(totalAmount);
  const pointsDetail = [];

  const initialPoints =
    basePoints > 0
      ? (() => {
          pointsDetail.push("기본: " + basePoints + "p");
          return basePoints;
        })()
      : 0;

  const tuesdayBonus = calculateTuesdayBonus(basePoints);
  const tuesdayPoints = tuesdayBonus.applied
    ? (() => {
        pointsDetail.push(tuesdayBonus.description);
        return tuesdayBonus.points;
      })()
    : initialPoints;

  const productTypes = getCartProductTypes(cartItems, productList);
  const comboBonuses = calculateComboBonuses(productTypes);
  const comboPoints = comboBonuses.reduce((sum, bonus) => {
    pointsDetail.push(bonus.description);
    return sum + bonus.points;
  }, 0);

  const bulkBonus = calculateBulkBonus(itemCount);
  const bulkPoints = bulkBonus
    ? (() => {
        pointsDetail.push(bulkBonus.description);
        return bulkBonus.points;
      })()
    : 0;

  const finalPoints = tuesdayPoints + comboPoints + bulkPoints;

  appState.bonusPoints = finalPoints;
  displayPointsInfo(finalPoints, pointsDetail, loyaltyPointsElement);
};
