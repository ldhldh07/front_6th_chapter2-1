import type { Product } from '../types';

interface ProductSelectorProps {
  products: Product[];
  selectedProductId: string;
  onProductSelect: (productId: string) => void;
  onAddToCart: () => void;
  stockMessage: string;
  totalStock: number;
  stockWarningThreshold: number;
  getOptionData: (product: Product) => { text: string };
}

export const ProductSelector = ({
  products,
  selectedProductId,
  onProductSelect,
  onAddToCart,
  stockMessage,
  totalStock,
  stockWarningThreshold,
  getOptionData
}: ProductSelectorProps) => {
  return (
    <div className="mb-6 pb-6 border-b border-gray-200">
      <select
        id="product-select"
        value={selectedProductId}
        onChange={(e) => onProductSelect(e.target.value)}
        className={`w-full p-3 border rounded-lg text-base mb-3 ${
          totalStock < stockWarningThreshold ? 'border-orange-500' : 'border-gray-300'
        }`}
      >
        <option value="">상품을 선택하세요</option>
        {products.map(product => {
          const optionData = getOptionData(product);
          return (
            <option
              key={product.id}
              value={product.id}
              disabled={product.quantity <= 0}
              className={
                product.onSale && product.suggestSale
                  ? 'text-purple-600 font-bold'
                  : product.onSale
                  ? 'text-red-500 font-bold'
                  : product.suggestSale
                  ? 'text-blue-500 font-bold'
                  : ''
              }
            >
              {optionData.text}
            </option>
          );
        })}
      </select>

      <button
        onClick={onAddToCart}
        className="w-full py-3 bg-black text-white text-sm font-medium uppercase tracking-wider hover:bg-gray-800 transition-all"
      >
        Add to Cart
      </button>

      <div className="text-xs text-red-500 mt-3 whitespace-pre-line">
        {stockMessage}
      </div>
    </div>
  );
}; 