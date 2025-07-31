import { useEffect, useState, useMemo } from "react";
import {
  INITIAL_PRODUCT_DATA,
  TOTAL_STOCK_WARNING_THRESHOLD,
} from "./shared/constants";
import type { Product } from "./shared/types";
import { useCart, CartItems } from "./features/cart";
import { useProducts, ProductSelector } from "./features/products";
import { useDiscounts } from "./features/discounts";
import { usePoints } from "./features/points";
import { useEvents } from "./features/events";
import { calculateTotalQuantity } from "./shared/utils";
import { Header, OrderSummary, HelpModal } from "./shared/components";

/**
 * 모달 애니메이션 상태를 관리하는 커스텀 훅
 */
const useModalAnimation = (animationDuration = 300) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const closeModal = () => {
    if (!isOpen || isClosing) return;

    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, animationDuration);
  };

  const toggleModal = () => {
    if (isOpen && !isClosing) {
      closeModal();
    } else if (!isOpen) {
      openModal();
    }
  };

  return { isOpen, isClosing, openModal, closeModal, toggleModal };
};

/**
 * 메시지 처리 유틸리티
 */
const getErrorMessage = (reason: string | undefined): string => {
  const errorMessages = {
    out_of_stock: "재고가 부족합니다.",
    invalid_product: "유효하지 않은 상품입니다.",
    default: "상품을 추가할 수 없습니다.",
  } as const;

  return (
    errorMessages[reason as keyof typeof errorMessages] || errorMessages.default
  );
};

/**
 * 재고 관련 UI 데이터를 계산하는 커스텀 훅
 */
const useStockDisplayData = (
  products: Product[],
  getLowStockProducts: (products: Product[], threshold: number) => Product[]
) => {
  const totalStock = useMemo(() => {
    return products.reduce((sum, product) => sum + product.quantity, 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return getLowStockProducts(products, 5);
  }, [getLowStockProducts, products]);

  const stockMessage = useMemo(() => {
    return lowStockProducts
      .map((product: Product) =>
        product.quantity > 0
          ? `${product.name}: 재고 부족 (${product.quantity}개 남음)`
          : `${product.name}: 품절`
      )
      .join("\n");
  }, [lowStockProducts]);

  return { totalStock, lowStockProducts, stockMessage };
};

function App() {
  const {
    cartItems,
    products,
    setProducts,
    handleAddToCart,
    handleCartActions,
  } = useCart();
  const { getOptionData, getLowStockProducts } = useProducts();
  const { calculateDiscounts } = useDiscounts();
  const { calculatePoints } = usePoints();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [lastSelectedItem, setLastSelectedItem] = useState<string | null>(null);

  const {
    isOpen: showManual,
    isClosing: isManualClosing,
    toggleModal,
  } = useModalAnimation(300);

  // 할인 계산
  const discountResult = useMemo(() => {
    return calculateDiscounts(cartItems, products);
  }, [calculateDiscounts, cartItems, products]);

  // 포인트 계산
  const pointsResult = useMemo(() => {
    return calculatePoints(cartItems, products, discountResult.totalAmount);
  }, [calculatePoints, cartItems, products, discountResult.totalAmount]);

  // 이벤트 시스템
  useEvents({
    products,
    setProducts,
    cartItems,
    lastSelectedItem,
  });

  useEffect(() => {
    setProducts([...INITIAL_PRODUCT_DATA]);
  }, []);

  const { totalStock, stockMessage } = useStockDisplayData(
    products,
    getLowStockProducts
  );

  const handleAddClick = () => {
    if (!selectedProductId) return;

    const result = handleAddToCart(selectedProductId, products);
    if (!result.success) {
      alert(getErrorMessage(result.reason));
    } else {
      setLastSelectedItem(selectedProductId);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header itemCount={calculateTotalQuantity(cartItems)} />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 flex-1 overflow-hidden">
        {/* Left Column */}
        <div className="bg-white border border-gray-200 p-8 overflow-y-auto">
          <ProductSelector
            products={products}
            selectedProductId={selectedProductId}
            onProductSelect={setSelectedProductId}
            onAddToCart={handleAddClick}
            stockMessage={stockMessage}
            totalStock={totalStock}
            stockWarningThreshold={TOTAL_STOCK_WARNING_THRESHOLD}
            getOptionData={getOptionData}
          />

          <CartItems
            cartItems={cartItems}
            products={products}
            onCartAction={handleCartActions}
          />
        </div>

        {/* Right Column - Order Summary */}
        <OrderSummary
          cartItems={cartItems}
          products={products}
          discountResult={discountResult}
          pointsResult={pointsResult}
        />
      </div>

      {/* Help Button */}
      <button
        onClick={toggleModal}
        className="fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
      </button>

      {/* Help Modal */}
      <HelpModal
        isOpen={showManual}
        isClosing={isManualClosing}
        onClose={toggleModal}
      />

      {/* Event Notifications */}
    </div>
  );
}

export default App;
