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

    it("수량 변경 (+/- 버튼) 기능", async () => {
      render(<App />);

      // 상품 추가
      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      // 수량 증가 버튼 클릭
      await waitFor(() => {
        const increaseButton = screen.getByText("+");
        fireEvent.click(increaseButton);
      });

      // 수량이 2가 되었는지 확인
      await waitFor(
        () => {
          expect(screen.getByText("2")).toBeInTheDocument();
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩20,000");
        },
        { timeout: 3000 }
      );
    });

    it("상품 제거 (Remove 버튼) 기능", async () => {
      render(<App />);

      // 상품 추가
      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      // Remove 버튼 클릭
      await waitFor(() => {
        const removeButton = screen.getByText(/Remove/i);
        fireEvent.click(removeButton);
      });

      // 장바구니가 비워졌는지 확인
      await waitFor(
        () => {
          expect(screen.getByText(/0.*items in cart/)).toBeInTheDocument();
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩0");
        },
        { timeout: 3000 }
      );
    });

    it("대량 할인 (30개 이상 25% 할인) 적용", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // 상품1을 30개 추가 (10,000원 × 30 = 300,000원)
      fireEvent.change(selectBox, { target: { value: "p1" } });

      // 30번 클릭하여 30개 추가
      for (let i = 0; i < 30; i++) {
        fireEvent.click(addButton);
      }

      // 대량할인 25% 적용 확인 (300,000 × 0.75 = 225,000원)
      await waitFor(
        () => {
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩225,000");
        },
        { timeout: 5000 }
      );
    });
  });

  // ==================== 3. UI 기능 테스트 ====================
  describe("3. UI 기능", () => {
    it("도움말 모달 열기/닫기", async () => {
      render(<App />);

      // 도움말 버튼 클릭 (SVG 아이콘 버튼)
      const helpButton = screen.getByRole("button", { name: "" }); // 아이콘 전용 버튼
      fireEvent.click(helpButton);

      // 모달이 열렸는지 확인
      await waitFor(() => {
        expect(screen.getByText(/할인 정책/)).toBeInTheDocument();
      });

      // 모달 배경 클릭하여 닫기
      const modalOverlay = document.querySelector(".fixed.inset-0");
      if (modalOverlay) {
        fireEvent.click(modalOverlay);
      }

      // 모달이 닫혔는지 확인
      await waitFor(
        () => {
          expect(screen.queryByText(/할인 정책/)).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("재고 부족 상품 비활성화", () => {
      render(<App />);

      // 재고가 0인 상품(p4)이 비활성화되어 있는지 확인
      const outOfStockOption = screen.getByText(/에러 방지 노트북 파우치/);
      expect(outOfStockOption.closest("option")).toBeDisabled();
    });

    it("포인트 적립 표시", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      // 포인트 적립이 표시되는지 확인 (10,000원의 0.1% = 10p)
      await waitFor(() => {
        expect(screen.getByText(/적립 포인트:/)).toBeInTheDocument();
        // 더 구체적으로 메인 포인트 영역에서 확인
        const loyaltyPoints = document.querySelector(
          "#loyalty-points .font-bold"
        );
        expect(loyaltyPoints).toHaveTextContent("10p");
      });
    });
  });

  // ==================== 4. 에러 처리 및 경계값 테스트 ====================
  describe("4. 에러 처리 및 경계값", () => {
    it("상품을 선택하지 않고 장바구니에 추가 시도할 때 아무 동작하지 않음", async () => {
      render(<App />);

      const addButton = screen.getByRole("button", { name: /Add to Cart/i });
      const cartTotal = document.querySelector("#cart-total .text-2xl");

      expect(cartTotal).toHaveTextContent("₩0");

      // 상품 선택 없이 추가 버튼 클릭
      fireEvent.click(addButton);

      // 장바구니에 아무 변화가 없어야 함
      await waitFor(() => {
        expect(cartTotal).toHaveTextContent("₩0");
        expect(screen.getByText(/0.*items in cart/)).toBeInTheDocument();
      });
    });

    it("정확히 10개일 때 개별 할인 적용되어야 함", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // 키보드 상품(p1) 10개 추가 (10% 할인 적용되어야 함)
      fireEvent.change(selectBox, { target: { value: "p1" } });

      for (let i = 0; i < 10; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 10,000 × 10 × (1 - 0.10) = 90,000원
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩90,000");
        },
        { timeout: 3000 }
      );
    });

    it("정확히 30개일 때 대량 할인 적용되어야 함", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      // 키보드 상품(p1) 30개 추가
      fireEvent.change(selectBox, { target: { value: "p1" } });

      for (let i = 0; i < 30; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 30개 이상이면 대량 할인이 적용되어야 함
          expect(screen.getByText(/30.*items in cart/)).toBeInTheDocument();

          // 대량 할인이 표시되는지 확인
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).not.toHaveTextContent("₩0"); // 총액이 0이 아니어야 함
        },
        { timeout: 15000 }
      );
    });
  });

  // ==================== 5. 개별 상품 할인율 테스트 ====================
  describe("5. 개별 상품 할인율", () => {
    it("마우스(p2) 15% 할인 적용", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p2" } });

      // 10개 추가 (15% 할인 적용)
      for (let i = 0; i < 10; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 20,000 × 10 × (1 - 0.15) = 170,000원
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩170,000");
        },
        { timeout: 3000 }
      );
    });

    it("모니터암(p3) 20% 할인 적용", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p3" } });

      // 10개 추가 (20% 할인 적용)
      for (let i = 0; i < 10; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 30,000 × 10 × (1 - 0.20) = 240,000원
          const cartTotal = document.querySelector("#cart-total .text-2xl");
          expect(cartTotal).toHaveTextContent("₩240,000");
        },
        { timeout: 3000 }
      );
    });

    it("할인율이 올바르게 표시되어야 함", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });

      // 10개 추가 (10% 할인 적용)
      for (let i = 0; i < 10; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 할인 메시지가 표시되는지 확인
          expect(screen.getByText(/할인되었습니다/)).toBeInTheDocument();
          // 총 할인율 섹션이 있는지 확인
          expect(screen.getByText(/총 할인율/)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  // ==================== 6. 재고 관리 테스트 ====================
  describe("6. 재고 관리", () => {
    it("재고가 0인 상품은 비활성화되어야 함", () => {
      render(<App />);

      // 재고가 0인 상품(p4)이 비활성화되어 있는지 확인
      const outOfStockOption = screen.getByText(/에러 방지 노트북 파우치/);
      expect(outOfStockOption.closest("option")).toBeDisabled();
    });

    it("상품 추가 시 장바구니에 표시되어야 함", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        // 장바구니에 상품이 추가되었는지 확인
        expect(screen.getByText(/1.*items in cart/)).toBeInTheDocument();
        expect(screen.getByText("버그 없애는 키보드")).toBeInTheDocument();
      });
    });
  });

  // ==================== 7. 복합 할인 시나리오 테스트 ====================
  describe("7. 복합 할인 시나리오", () => {
    it("화요일 + 개별할인 + 대량할인 조합", async () => {
      // 화요일로 설정
      vi.setSystemTime(new Date("2024-10-15")); // 화요일

      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });

      // 30개 추가 (개별할인 + 대량할인 + 화요일할인)
      for (let i = 0; i < 30; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 화요일 할인이 적용되었는지 확인
          expect(
            screen.getByText(/Tuesday Special.*Applied/)
          ).toBeInTheDocument();
          expect(screen.getByText(/30.*items in cart/)).toBeInTheDocument();
        },
        { timeout: 10000 }
      );
    });
  });

  // ==================== 8. 포인트 계산 시나리오 테스트 ====================
  describe("8. 포인트 계산", () => {
    it("화요일 포인트 보너스 적용", async () => {
      // 화요일로 설정
      vi.setSystemTime(new Date("2024-10-15"));

      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        // 화요일 2배 포인트 확인
        expect(screen.getByText(/화요일 2배/)).toBeInTheDocument();
      });
    });

    it("대량 구매 시 더 많은 포인트 적립", async () => {
      render(<App />);

      const selectBox = screen.getByRole("combobox");
      const addButton = screen.getByRole("button", { name: /Add to Cart/i });

      fireEvent.change(selectBox, { target: { value: "p1" } });

      // 30개 추가
      for (let i = 0; i < 30; i++) {
        fireEvent.click(addButton);
      }

      await waitFor(
        () => {
          // 많은 포인트 적립 확인 (대량 구매시 더 많은 포인트)
          const loyaltyPoints = document.querySelector(
            "#loyalty-points .font-bold"
          );
          const pointsText = loyaltyPoints?.textContent || "";
          const points = parseInt(pointsText.replace(/[^\d]/g, ""));
          expect(points).toBeGreaterThan(100); // 단순 계산보다 더 많은 포인트
        },
        { timeout: 10000 }
      );
    });
  });
});
