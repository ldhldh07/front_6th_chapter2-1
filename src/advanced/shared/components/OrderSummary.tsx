import type { CartItem, Product, DiscountResult, PointsResult } from "../types";
import {
  formatPrice,
  calculateItemTotal,
  findProductById,
  calculateSubtotal,
} from "../utils";

interface OrderSummaryProps {
  cartItems: CartItem[];
  products: Product[];
  discountResult: DiscountResult;
  pointsResult: PointsResult;
}

export const OrderSummary = ({
  cartItems,
  products,
  discountResult,
  pointsResult,
}: OrderSummaryProps) => {
  const subtotal = calculateSubtotal(cartItems, products);

  return (
    <div className="bg-black text-white p-8 flex flex-col">
      <h2 className="text-xs font-medium mb-5 tracking-extra-wide uppercase">
        Order Summary
      </h2>
      <div className="flex-1 flex flex-col">
        <div id="summary-details" className="space-y-3">
          {/* 장바구니 상품별 요약 */}
          {cartItems.length > 0 && (
            <>
              {cartItems.map(item => {
                const product = findProductById(products, item.id);
                if (!product) return null;
                const itemTotal = calculateItemTotal(
                  product.price,
                  item.quantity
                );
                return (
                  <div
                    key={item.id}
                    className="flex justify-between text-xs tracking-wide text-gray-400"
                  >
                    <span>
                      {product.name} x {item.quantity}
                    </span>
                    <span>{formatPrice(itemTotal)}</span>
                  </div>
                );
              })}

              <div className="border-t border-white/10 my-3"></div>
              <div className="flex justify-between text-sm tracking-wide">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {/* 할인 정보 표시 */}
              {discountResult.isBulkDiscount && (
                <div className="flex justify-between text-sm tracking-wide text-green-400">
                  <span className="text-xs">🎉 대량구매 할인 (30개 이상)</span>
                  <span className="text-xs">-25%</span>
                </div>
              )}

              {!discountResult.isBulkDiscount &&
                discountResult.itemDiscounts.map(discount => (
                  <div
                    key={discount.name}
                    className="flex justify-between text-sm tracking-wide text-green-400"
                  >
                    <span className="text-xs">{discount.name} (10개↑)</span>
                    <span className="text-xs">-{discount.discount}%</span>
                  </div>
                ))}

              {discountResult.isTuesday && (
                <div className="flex justify-between text-sm tracking-wide text-purple-400">
                  <span className="text-xs">🌟 화요일 추가 할인</span>
                  <span className="text-xs">-10%</span>
                </div>
              )}

              <div className="flex justify-between text-sm tracking-wide text-gray-400">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </>
          )}
        </div>
        <div className="mt-auto">
          {/* 총 할인 정보 */}
          {discountResult.discRate > 0 && discountResult.totalAmount > 0 && (
            <div className="mb-4 bg-green-500/20 rounded-lg p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs uppercase tracking-wide text-green-400">
                  총 할인율
                </span>
                <span className="text-sm font-medium text-green-400">
                  {(discountResult.discRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-2xs text-gray-300">
                {formatPrice(discountResult.savedAmount)} 할인되었습니다
              </div>
            </div>
          )}

          <div id="cart-total" className="pt-5 border-t border-white/10">
            <div className="flex justify-between items-baseline">
              <span className="text-sm uppercase tracking-wider">Total</span>
              <div className="text-2xl tracking-tight">
                {formatPrice(discountResult.totalAmount)}
              </div>
            </div>
            <div
              id="loyalty-points"
              className="text-xs text-blue-400 mt-2 text-right"
            >
              {pointsResult.totalPoints > 0 ? (
                <div>
                  <div>
                    적립 포인트:{" "}
                    <span className="font-bold">
                      {pointsResult.totalPoints}p
                    </span>
                  </div>
                  {pointsResult.bonusDetails.length > 0 && (
                    <div className="text-2xs opacity-70 mt-1">
                      {pointsResult.bonusDetails.join(", ")}
                    </div>
                  )}
                </div>
              ) : (
                <div>적립 포인트: 0p</div>
              )}
            </div>
          </div>

          {/* 화요일 특별 할인 표시 */}
          {discountResult.isTuesday && cartItems.length > 0 && (
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xs">🎉</span>
                <span className="text-xs uppercase tracking-wide">
                  Tuesday Special 10% Applied
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <button className="w-full py-4 bg-white text-black text-sm font-normal uppercase tracking-super-wide cursor-pointer mt-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30">
        Proceed to Checkout
      </button>
      <p className="mt-4 text-2xs text-white/60 text-center leading-relaxed">
        Free shipping on all orders.
        <br />
        <span>Earn loyalty points with purchase.</span>
      </p>
    </div>
  );
};
