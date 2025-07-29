/**
 * DOM 헬퍼 함수들
 */

const specialProperties = ["checked", "selected", "disabled", "readOnly"];

/**
 * DOM 요소 생성 헬퍼
 * @param {string} tagName - 태그명
 * @param {Object} props - 속성 객체
 * @param {...any} children - 자식 요소들
 * @returns {Element} DOM 요소
 */
export const createElement = (tagName, props = {}, ...children) => {
  const element = document.createElement(tagName);

  if (props) {
    applyProps(element, props);
  }

  if (children && children.length > 0) {
    appendChildren(element, children);
  }

  return element;
};

/**
 * 요소에 props 적용
 */
const applyProps = (element, props) => {
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith("on") && typeof value === "function") {
      const eventType = key.slice(2).toLowerCase();
      element.addEventListener(eventType, value);
    } else if (key === "className") {
      element.className = value;
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key === "textContent") {
      element.textContent = value;
    } else if (specialProperties.includes(key)) {
      element[key] = value;
    } else {
      element.setAttribute(key, value);
    }
  });
};

/**
 * 자식 요소들 추가
 */
const appendChildren = (element, children) => {
  children.forEach(child => {
    if (child === null || child === undefined) return;
    
    if (typeof child === "string" || typeof child === "number") {
      element.appendChild(document.createTextNode(String(child)));
    } else if (Array.isArray(child)) {
      appendChildren(element, child);
    } else if (child && child.nodeType === 1) {
      element.appendChild(child);
    }
  });
};

/**
 * DOM 참조 설정 헬퍼
 */
export const setDOMRefs = (target, selectors) => {
  Object.entries(selectors).forEach(([key, config]) => {
    if (config.container && config.selector) {
      target[key] = config.container.querySelector(config.selector);
    } else if (typeof config === "string") {
      target[key] = document.querySelector(config);
    }
  });
};

/**
 * 컨테이너 기반 DOM 참조 설정
 */
export const setDOMRefsFromContainer = (target, container, selectors) => {
  Object.entries(selectors).forEach(([key, selector]) => {
    target[key] = container.querySelector(selector);
  });
};

/**
 * 이벤트 리스너 일괄 등록
 */
export const addEventListeners = (element, events) => {
  Object.entries(events).forEach(([eventType, handler]) => {
    element.addEventListener(eventType, handler);
  });
}; 