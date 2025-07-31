import { useMemo } from "react";
import type { CartItem, Product } from "../../shared/types";
import { formatPrice, findProductById } from "../../shared/utils";

interface CartItemsProps {
  cartItems: CartItem[];
  products: Product[];
  onCartAction: (
    action: "increase" | "decrease" | "remove",
    productId: string,
    products: Product[]
  ) => void;
}

export const CartItems = ({
  cartItems,
  products,
  onCartAction,
}: CartItemsProps) => {
  const productsMap = useMemo(() => {
    return new Map(products.map(product => [product.id, product]));
  }, [products]);

  return (
    <div>
      {cartItems.map(item => {
        const product = productsMap.get(item.id);
        if (!product) return null;

        const saleIcon =
          (product.onSale ? "⚡" : "") + (product.suggestSale ? "💝" : "");

        const priceDisplay =
          product.onSale || product.suggestSale
            ? formatPrice(product.originalPrice)
            : formatPrice(product.price);

        const priceTextColor =
          product.onSale || product.suggestSale
            ? product.onSale && product.suggestSale
              ? "text-purple-600"
              : product.onSale
                ? "text-red-500"
                : "text-blue-500"
            : "";

        return (
          <div
            key={item.id}
            className="grid grid-cols-[80px_1fr_auto] gap-5 py-5 border-b border-gray-100 first:pt-0 last:border-b-0 last:pb-0"
          >
            <div className="w-20 h-20 bg-gradient-black relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 w-[60%] h-[60%] bg-white/10 -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
            </div>

            <div>
              <h3 className="text-base font-normal mb-1 tracking-tight">
                {saleIcon}
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 mb-0.5 tracking-wide">
                PRODUCT
              </p>
              <p className="text-xs text-black mb-3">
                {product.onSale || product.suggestSale ? (
                  <>
                    <span className="line-through text-gray-400">
                      {priceDisplay}
                    </span>{" "}
                    <span className={priceTextColor}>
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  priceDisplay
                )}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onCartAction("decrease", item.id, products)}
                  className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                >
                  −
                </button>
                <span className="quantity-number text-sm font-normal min-w-[20px] text-center tabular-nums">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onCartAction("increase", item.id, products)}
                  className="quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg mb-2 tracking-tight tabular-nums">
                {product.onSale || product.suggestSale ? (
                  <>
                    <span className="line-through text-gray-400">
                      {formatPrice(product.originalPrice)}
                    </span>{" "}
                    <span className={priceTextColor}>
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  formatPrice(product.price)
                )}
              </div>
              <button
                onClick={() => onCartAction("remove", item.id, products)}
                className="remove-item text-2xs text-gray-500 uppercase tracking-wider cursor-pointer transition-colors border-b border-transparent hover:text-black hover:border-black"
              >
                Remove
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
