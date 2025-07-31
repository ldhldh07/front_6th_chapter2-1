import {
  DISCOUNT_RATES,
  QUANTITY_DISCOUNT_THRESHOLD,
  BULK_DISCOUNT_THRESHOLD,
  POINTS,
  BULK_THRESHOLDS,
  TUESDAY_ADDITIONAL_DISCOUNT_RATE,
} from "../constants";

interface HelpModalProps {
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
}

export const HelpModal = ({
  isOpen,
  isClosing = false,
  onClose,
}: HelpModalProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleOverlayClick}
    >
      <div
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform transition-transform duration-300 ${isClosing ? "translate-x-full" : "translate-x-0"}`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <h2 className="text-xl font-bold mb-4">📖 이용 안내</h2>

        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">💰 할인 정책</h3>
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">개별 상품</p>
              <p className="text-gray-700 text-xs pl-2">
                • 키보드 {QUANTITY_DISCOUNT_THRESHOLD}개↑:{" "}
                {DISCOUNT_RATES.KEYBOARD * 100}%
                <br />• 마우스 {QUANTITY_DISCOUNT_THRESHOLD}개↑:{" "}
                {DISCOUNT_RATES.MOUSE * 100}%
                <br />• 모니터암 {QUANTITY_DISCOUNT_THRESHOLD}개↑:{" "}
                {DISCOUNT_RATES.MONITOR_ARM * 100}%
                <br />• 스피커 {QUANTITY_DISCOUNT_THRESHOLD}개↑:{" "}
                {DISCOUNT_RATES.SPEAKER * 100}%
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">전체 수량</p>
              <p className="text-gray-700 text-xs pl-2">
                • {BULK_DISCOUNT_THRESHOLD}개 이상: {DISCOUNT_RATES.BULK * 100}%
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">특별 할인</p>
              <p className="text-gray-700 text-xs pl-2">
                • 화요일: +{TUESDAY_ADDITIONAL_DISCOUNT_RATE * 100}%
                <br />• ⚡번개세일: {DISCOUNT_RATES.LIGHTNING_SALE * 100}%
                <br />• 💝추천할인: {DISCOUNT_RATES.SUGGESTION * 100}%
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">🎁 포인트 적립</h3>
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">기본</p>
              <p className="text-gray-700 text-xs pl-2">
                • 구매액의 {(1 / POINTS.CALCULATION_BASE) * 100}%
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">추가</p>
              <p className="text-gray-700 text-xs pl-2">
                • 화요일: 2배
                <br />• 키보드+마우스: +{POINTS.COMBO_BONUS}p
                <br />• 풀세트: +{POINTS.FULL_SET_BONUS}p
                <br />• {BULK_THRESHOLDS.SMALL}개↑: +{POINTS.SMALL_BULK_BONUS}p
                / {BULK_THRESHOLDS.MEDIUM}개↑: +{POINTS.MEDIUM_BULK_BONUS}p /{" "}
                {BULK_THRESHOLDS.LARGE}개↑: +{POINTS.LARGE_BULK_BONUS}p
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs font-bold mb-1">💡 TIP</p>
          <p className="text-2xs text-gray-600 leading-relaxed">
            • 화요일 대량구매 = MAX 혜택
            <br />
            • ⚡+💝 중복 가능
            <br />• 상품4 = 품절
          </p>
        </div>
      </div>
    </div>
  );
};
