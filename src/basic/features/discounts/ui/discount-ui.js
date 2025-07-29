/**
 * 화요일 특별 할인 UI를 업데이트합니다 (utils에서 이전)
 * @param {boolean} isTuesday - 오늘이 화요일인지 여부
 */
export const updateTuesdayUI = (isTuesday) => {
  const tuesdaySpecial = document.getElementById("tuesday-special");
  if (tuesdaySpecial) {
    if (isTuesday) {
      tuesdaySpecial.classList.remove("hidden");
    } else {
      tuesdaySpecial.classList.add("hidden");
    }
  }
}; 