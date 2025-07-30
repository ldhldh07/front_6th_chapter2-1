interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300">
      <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform transition-transform duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
        
        <h2 className="text-xl font-bold mb-4">📖 이용 안내</h2>
        
        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">💰 할인 정책</h3>
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">개별 상품</p>
              <p className="text-gray-700 text-xs pl-2">
                • 키보드 10개↑: 10%<br />
                • 마우스 10개↑: 15%<br />
                • 모니터암 10개↑: 20%<br />
                • 스피커 10개↑: 25%
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">전체 수량</p>
              <p className="text-gray-700 text-xs pl-2">• 30개 이상: 25%</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">특별 할인</p>
              <p className="text-gray-700 text-xs pl-2">
                • 화요일: +10%<br />
                • ⚡번개세일: 20%<br />
                • 💝추천할인: 5%
              </p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-base font-bold mb-3">🎁 포인트 적립</h3>
          <div className="space-y-3">
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">기본</p>
              <p className="text-gray-700 text-xs pl-2">• 구매액의 0.1%</p>
            </div>
            <div className="bg-gray-100 rounded-lg p-3">
              <p className="font-semibold text-sm mb-1">추가</p>
              <p className="text-gray-700 text-xs pl-2">
                • 화요일: 2배<br />
                • 키보드+마우스: +50p<br />
                • 풀세트: +100p<br />
                • 10개↑: +20p / 20개↑: +50p / 30개↑: +100p
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-xs font-bold mb-1">💡 TIP</p>
          <p className="text-2xs text-gray-600 leading-relaxed">
            • 화요일 대량구매 = MAX 혜택<br />
            • ⚡+💝 중복 가능<br />
            • 상품4 = 품절
          </p>
        </div>
      </div>
    </div>
  );
}; 