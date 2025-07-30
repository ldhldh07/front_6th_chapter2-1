// Product 관련 타입
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  quantity: number;
  onSale: boolean;
  suggestSale: boolean;
}

// Cart 관련 타입
export interface CartItem {
  id: string;
  quantity: number;
}

// App State 타입
export interface AppState {
  totalAmount: number;
  itemCount: number;
  lastSelectedItem: string | null;
  bonusPoints: number;
}

// ==================== Discount Types ====================

export type DiscountType = 'none' | 'product' | 'bulk' | 'tuesday' | 'combined';

export interface DiscountInfo {
  name: string;
  discount: number;
}

export interface DiscountResult {
  totalAmount: number;
  discRate: number;
  type: DiscountType;
  savedAmount: number;
  itemDiscounts: DiscountInfo[];
  isBulkDiscount: boolean;
  isTuesday: boolean;
}

export interface TuesdayDiscountResult {
  totalAmount: number;
  discRate: number;
  isTuesday: boolean;
  type: DiscountType;
} 