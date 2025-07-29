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