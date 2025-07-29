/**
 * 매뉴얼 시스템 컴포넌트 (main.basic.js에서 분리)
 * @param {Object} dependencies - 필요한 의존성들
 * @returns {Object} 매뉴얼 시스템 요소들
 */
export const createManualSystem = (dependencies) => {
  const { createElement, manualGuideTemplate, helpToggleTemplate } = dependencies;

  const manualColumn = createElement("div", {
    className: "fixed right-0 top-0 h-full w-80 bg-white shadow-2xl p-6 overflow-y-auto z-50 transform translate-x-full transition-transform duration-300",
    innerHTML: manualGuideTemplate
  });

  const manualOverlay = createElement("div", {
    className: "fixed inset-0 bg-black/50 z-40 hidden transition-opacity duration-300",
    onclick: (event) => {
      if (event.target === manualOverlay) {
        manualOverlay.classList.add("hidden");
        manualColumn.classList.add("translate-x-full");
      }
    }
  }, [manualColumn]);

  const manualToggle = createElement("button", {
    className: "fixed top-4 right-4 bg-black text-white p-3 rounded-full hover:bg-gray-900 transition-colors z-50",
    innerHTML: helpToggleTemplate,
    onclick: () => {
      manualOverlay.classList.toggle("hidden");
      manualColumn.classList.toggle("translate-x-full");
    }
  });

  return { manualToggle, manualOverlay };
}; 