/**
 * 가격 포맷팅 유틸리티 함수들
 */

/**
 * 숫자를 한국 통화 형식으로 포맷팅합니다
 */
export const formatPrice = (price: number): string => {
  return `₩${price.toLocaleString()}`;
};

/**
 * 숫자를 원 단위로 포맷팅합니다 (한국어)
 */
export const formatPriceKorean = (price: number): string => {
  return `${price.toLocaleString()}원`;
};

/**
 * 상품 관련 유틸리티 함수들
 */

/**
 * ID로 상품을 찾습니다
 */
export const findProductById = <T extends { id: string }>(
  products: T[],
  productId: string
): T | undefined => {
  return products.find(product => product.id === productId);
};

/**
 * 장바구니 아이템의 총액을 계산합니다
 */
export const calculateItemTotal = (price: number, quantity: number): number => {
  return price * quantity;
};

/**
 * 장바구니 아이템들의 총 수량을 계산합니다
 */
export const calculateTotalQuantity = (
  cartItems: { quantity: number }[]
): number => {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
};

/**
 * 장바구니 아이템들의 소계를 계산합니다
 */
export const calculateSubtotal = <T extends { id: string; price: number }>(
  cartItems: { id: string; quantity: number }[],
  products: T[]
): number => {
  if (!Array.isArray(cartItems) || !Array.isArray(products)) {
    console.warn("calculateSubtotal: 잘못된 입력값", { cartItems, products });
    return 0;
  }

  return cartItems.reduce((total, item) => {
    if (!item || typeof item.quantity !== "number" || item.quantity < 0) {
      console.warn("calculateSubtotal: 잘못된 아이템", item);
      return total;
    }

    const product = findProductById(products, item.id);
    if (!product) {
      return total;
    }

    if (typeof product.price !== "number" || product.price < 0) {
      console.warn("calculateSubtotal: 잘못된 상품 가격", product);
      return total;
    }

    return total + calculateItemTotal(product.price, item.quantity);
  }, 0);
};
