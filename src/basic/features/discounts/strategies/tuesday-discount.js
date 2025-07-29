/**
 * 화요일 할인 전략을 적용합니다
 * @param {number} totalAmount - 현재 총액
 * @param {number} originalTotal - 원래 총액  
 * @param {number} tuesdayDayNumber - 화요일 요일 번호 (0-6)
 * @param {number} discountRate - 화요일 할인율 (0.0 ~ 1.0)
 * @returns {Object} 할인 계산 결과
 */
export const calculateTuesdayDiscount = (totalAmount, originalTotal, tuesdayDayNumber, discountRate) => {
  const today = new Date();
  const isTuesday = today.getDay() === tuesdayDayNumber;
  
  if (isTuesday && totalAmount > 0) {
    const discountedAmount = totalAmount * (1 - discountRate);
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
    discRate: 1 - totalAmount / originalTotal,
    isTuesday,
    type: 'none'
  };
}; 