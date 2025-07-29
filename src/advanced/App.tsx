import { PRODUCT_IDS, INITIAL_PRODUCT_DATA } from './shared/constants';
import type { Product } from './shared/types';

function App() {
  // 타입 체크 테스트
  const products: Product[] = INITIAL_PRODUCT_DATA;
  
  return (
    <div>
      <h1>안녕월드</h1>
      <p>React + TypeScript 환경 성공!</p>
      <p>상품 개수: {products.length}</p>
      <p>첫 번째 상품: {products[0]?.name}</p>
    </div>
  );
}

export default App; 