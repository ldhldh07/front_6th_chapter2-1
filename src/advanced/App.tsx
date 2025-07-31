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
  const [showManual, setShowManual] = useState(false);
  const [isManualClosing, setIsManualClosing] = useState(false);
  const [lastSelectedItem, setLastSelectedItem] = useState<string | null>(null);

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

  const totalStock = products.reduce(
    (sum, product) => sum + product.quantity,
    0
  );
  const lowStockProducts = getLowStockProducts(products, 5);

  const handleAddClick = () => {
    if (!selectedProductId) return;

    const result = handleAddToCart(selectedProductId, products);
    if (!result.success) {
      if (result.reason === "out_of_stock") {
        alert("재고가 부족합니다.");
      } else {
        alert("상품을 추가할 수 없습니다.");
      }
    } else {
      setLastSelectedItem(selectedProductId);
    }
    setSelectedProductId("");
  };

  const stockMessage = lowStockProducts
    .map(product =>
      product.quantity > 0
        ? `${product.name}: 재고 부족 (${product.quantity}개 남음)`
        : `${product.name}: 품절`
    )
    .join("\n");

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
        onClick={() => {
          if (showManual && !isManualClosing) {
            // 모달이 열려있으면 닫기
            setIsManualClosing(true);
            setTimeout(() => {
              setShowManual(false);
              setIsManualClosing(false);
            }, 300);
          } else {
            // 모달이 닫혀있으면 열기
            setShowManual(true);
          }
        }}
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
        onClose={() => {
          setIsManualClosing(true);
          setTimeout(() => {
            setShowManual(false);
            setIsManualClosing(false);
          }, 300);
        }}
      />

      {/* Event Notifications */}
    </div>
  );
}

export default App;
