import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "../App";

describe("React 장바구니 애플리케이션 테스트", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.setSystemTime(new Date("2024-10-14"));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== 1. 기본 렌더링 테스트 ====================
  describe("1. 기본 렌더링", () => {
    it("앱이 정상적으로 렌더링되어야 함", () => {
      render(<App />);

      // 기본 UI 요소들이 표시되는지 확인
      expect(screen.getByText("🛒 Hanghae Online Store")).toBeInTheDocument();
      expect(screen.getByText("Shopping Cart")).toBeInTheDocument();
      expect(screen.getByRole("combobox")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Add to Cart/i })
      ).toBeInTheDocument();
    });

    it("5개 상품이 올바른 정보로 표시되어야 함", () => {
      render(<App />);

      const options = screen.getAllByRole("option");
      // 기본 "상품을 선택하세요" 옵션 + 5개 상품 = 6개
      expect(options).toHaveLength(6);

      // 각 상품의 정보 검증 - 올바른 방식으로 수정
      expect(screen.getByText(/버그 없애는 키보드/)).toBeInTheDocument();
      expect(screen.getByText(/생산성 폭발 마우스/)).toBeInTheDocument();
      expect(screen.getByText(/거북목 탈출 모니터암/)).toBeInTheDocument();
      expect(screen.getByText(/에러 방지 노트북 파우치/)).toBeInTheDocument();
      expect(
        screen.getByText(/코딩할 때 듣는 Lo-Fi 스피커/)
      ).toBeInTheDocument();

      // 품절 상품 확인
      const outOfStockOption = screen.getByText(/에러 방지 노트북 파우치/);
      expect(outOfStockOption.closest("option")).toBeDisabled();
    });
  });

  // ==================== 2. 장바구니 기능 테스트 ====================
  describe("2. 장바구니 기능", () => {
    it("상품을 선택하고 장바구니에 추가할 수 있어야 함", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // fireEvent 사용으로 더 안정적인 테스트
      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      // 장바구니 아이템이 추가되었는지 확인 (더 구체적인 selector 사용)
      await waitFor(
        () => {
          // 텍스트가 여러 요소에 나뉘어져 있으므로 정규표현식 사용
          expect(screen.getByText(/1.*items in cart/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("총액이 실시간으로 업데이트되어야 함", async () => {
      render(<App />);

      // 초기 상태: ₩0 (cart-total에서)
      const cartTotal = document.querySelector("#cart-total .text-2xl");
      expect(cartTotal).toHaveTextContent("₩0");

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      // 상품 추가 후: ₩10,000 (cart-total의 total 부분에서만 확인)
      await waitFor(
        () => {
          const updatedCartTotal = document.querySelector(
            "#cart-total .text-2xl"
          );
          expect(updatedCartTotal).toHaveTextContent("₩10,000");
        },
        { timeout: 3000 }
      );
    });

    it("화요일에 추가 10% 할인 적용", async () => {
      // 화요일로 설정
      vi.setSystemTime(new Date("2024-10-15")); // 화요일

      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      // 10,000원 -> 9,000원 (화요일 10% 할인) - cart-total에서만 확인
      await waitFor(
        () => {
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩9,000");
        },
        { timeout: 3000 }
      );
    });
  });
});
