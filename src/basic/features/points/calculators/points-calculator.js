import * as constants from '../../../constants/index.js';

const {
  POINTS_CALCULATION_BASE, COMBO_BONUS_POINTS, FULL_SET_BONUS_POINTS,
  SMALL_BULK_BONUS_POINTS, MEDIUM_BULK_BONUS_POINTS, LARGE_BULK_BONUS_POINTS,
  SMALL_BULK_THRESHOLD, MEDIUM_BULK_THRESHOLD, LARGE_BULK_THRESHOLD,
  TUESDAY_DAY_NUMBER
} = constants;

/**
 * 기본 포인트를 계산합니다
 * @param {number} totalAmount - 총 구매 금액
 * @returns {number} 기본 포인트
 */
export const calculateBasePoints = (totalAmount) => {
  return Math.floor(totalAmount / POINTS_CALCULATION_BASE);
};

/**
 * 화요일 보너스 포인트를 계산합니다
 * @param {number} basePoints - 기본 포인트
 * @returns {Object} 계산 결과
 */
export const calculateTuesdayBonus = (basePoints) => {
  const today = new Date();
  const isTuesday = today.getDay() === TUESDAY_DAY_NUMBER;
  
  if (isTuesday && basePoints > 0) {
    return {
      points: basePoints * 2,
      description: "화요일 2배",
      applied: true
    };
  }
  
  return {
    points: basePoints,
    description: null,
    applied: false
  };
};

/**
 * 콤보 보너스 포인트를 계산합니다
 * @param {Object} productTypes - 상품 유형 정보
 * @returns {Array} 보너스 목록
 */
export const calculateComboBonuses = (productTypes) => {
  const bonuses = [];
  
  if (productTypes.hasKeyboard && productTypes.hasMouse) {
    bonuses.push({
      points: COMBO_BONUS_POINTS,
      description: `키보드+마우스 세트 +${COMBO_BONUS_POINTS}p`
    });
    
    if (productTypes.hasMonitorArm) {
      bonuses.push({
        points: FULL_SET_BONUS_POINTS,
        description: `풀세트 구매 +${FULL_SET_BONUS_POINTS}p`
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
export const calculateBulkBonus = (itemCount) => {
  if (itemCount >= LARGE_BULK_THRESHOLD) {
    return {
      points: LARGE_BULK_BONUS_POINTS,
      description: `대량구매(${LARGE_BULK_THRESHOLD}개+) +${LARGE_BULK_BONUS_POINTS}p`
    };
  }
  
  if (itemCount >= MEDIUM_BULK_THRESHOLD) {
    return {
      points: MEDIUM_BULK_BONUS_POINTS,
      description: `대량구매(${MEDIUM_BULK_THRESHOLD}개+) +${MEDIUM_BULK_BONUS_POINTS}p`
    };
  }
  
  if (itemCount >= SMALL_BULK_THRESHOLD) {
    return {
      points: SMALL_BULK_BONUS_POINTS,
      description: `대량구매(${SMALL_BULK_THRESHOLD}개+) +${SMALL_BULK_BONUS_POINTS}p`
    };
  }
  
  return null;
}; 