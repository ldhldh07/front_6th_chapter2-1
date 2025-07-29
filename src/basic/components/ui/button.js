/**
 * 버튼 컴포넌트 (Virtual DOM 방식 예시)
 */
import { h } from '../../shared/utils/virtual-dom.js';

/**
 * 기본 버튼 컴포넌트
 * @param {Object} props - { text, className, onclick, disabled, etc. }
 * @returns {Object} Virtual Node
 */
export const Button = (props) => {
  const { text, className = "", onclick, disabled = false, ...otherProps } = props;
  
  return h("button", {
    className: `btn ${className}`.trim(),
    onclick: onclick,
    disabled: disabled,
    ...otherProps
  }, text);
};

/**
 * 장바구니 추가 버튼 (특화된 컴포넌트)
 * @param {Object} props - { onclick, disabled }
 * @returns {Object} Virtual Node
 */
export const AddToCartButton = (props) => {
  return Button({
    text: "Add to Cart",
    className: "w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all",
    ...props
  });
};

/**
 * 수량 조절 버튼
 * @param {Object} props - { change, productId, symbol }
 * @returns {Object} Virtual Node  
 */
export const QuantityButton = (props) => {
  const { change, productId, symbol } = props;
  
  return Button({
    text: symbol,
    className: "quantity-change w-6 h-6 border border-black bg-white text-sm flex items-center justify-center transition-all hover:bg-black hover:text-white",
    onclick: props.onclick,
    "data-product-id": productId,
    "data-change": change
  });
}; 