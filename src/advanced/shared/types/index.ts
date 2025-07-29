/**
 * Basic Types for React Migration
 */

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