import * as constants from '../constants/index.js';
import { getProductDiscountRate } from './calculations.js';

const { QUANTITY_DISCOUNT_THRESHOLD, PRODUCT_ONE, PRODUCT_TWO, PRODUCT_THREE } = constants;

export const findProductById = (productId, productList) => {
  return productList.find(product => product.id === productId);
};

export const calculateItemData = (cartItem, productList) => {
  const product = findProductById(cartItem.id, productList);
  const quantityElement = cartItem.querySelector(".quantity-number");
  const quantity = parseInt(quantityElement.textContent);
  const itemTotal = product.price * quantity;
  const discount = quantity >= QUANTITY_DISCOUNT_THRESHOLD 
    ? getProductDiscountRate(product.id) 
    : 0;
  
  return {
    product,
    quantity,
    itemTotal,
    discount,
    cartItem
  };
};

export const getCartProductTypes = (cartItems, productList) => {
  return Array.from(cartItems).reduce((types, node) => {
    const product = findProductById(node.id, productList);
    if (!product) return types;
    
    if (product.id === PRODUCT_ONE) types.hasKeyboard = true;
    if (product.id === PRODUCT_TWO) types.hasMouse = true;
    if (product.id === PRODUCT_THREE) types.hasMonitorArm = true;
    
    return types;
  }, { hasKeyboard: false, hasMouse: false, hasMonitorArm: false });
}; 