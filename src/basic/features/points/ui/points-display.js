/**
 * 포인트 정보를 UI에 표시합니다
 * @param {number} finalPoints - 최종 포인트
 * @param {Array} pointsDetail - 포인트 상세 내역
 */
export const displayPointsInfo = (finalPoints, pointsDetail) => {
  const pointsTag = document.getElementById("loyalty-points");
  
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
  } else {
    pointsTag.textContent = "적립 포인트: 0p";
    pointsTag.style.display = "block";
  }
};

/**
 * 장바구니가 비어있을 때 포인트 UI를 숨깁니다
 * @param {number} cartItemsLength - 장바구니 아이템 수
 */
export const hidePointsIfEmpty = (cartItemsLength) => {
  if (cartItemsLength === 0) {
    const pointsTag = document.getElementById("loyalty-points");
    if (pointsTag) {
      pointsTag.style.display = "none";
    }
  }
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
  getCartProductTypes
) => {
  hidePointsIfEmpty(cartItems.length);
  if (cartItems.length === 0) return;
  
  const basePoints = calculateBasePoints(totalAmount);
  const pointsDetail = [];

  const initialPoints = basePoints > 0 ? (() => {
    pointsDetail.push("기본: " + basePoints + "p");
    return basePoints;
  })() : 0;
  
  const tuesdayBonus = calculateTuesdayBonus(basePoints);
  const tuesdayPoints = tuesdayBonus.applied ? (() => {
    pointsDetail.push(tuesdayBonus.description);
    return tuesdayBonus.points;
  })() : initialPoints;
  
  const productTypes = getCartProductTypes(cartItems, productList);
  const comboBonuses = calculateComboBonuses(productTypes);
  const comboPoints = comboBonuses.reduce((sum, bonus) => {
    pointsDetail.push(bonus.description);
    return sum + bonus.points;
  }, 0);
  
  const bulkBonus = calculateBulkBonus(itemCount);
  const bulkPoints = bulkBonus ? (() => {
    pointsDetail.push(bulkBonus.description);
    return bulkBonus.points;
  })() : 0;
  
  const finalPoints = tuesdayPoints + comboPoints + bulkPoints;
  
  appState.bonusPoints = finalPoints;
  displayPointsInfo(finalPoints, pointsDetail);
}; 