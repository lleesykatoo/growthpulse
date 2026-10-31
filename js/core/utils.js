/* =========================================================
   core/utils.js — допоміжні функції, спільні для всіх модулів.
   Усі модулі сайту реєструються в одному глобальному об'єкті GP
   (патерн «простір імен»), щоб не засмічувати window і не
   конфліктувати іменами змінних.
   ========================================================= */
"use strict";

(function (GP) {
  /** Пошук одного елемента (скорочення querySelector). */
  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  /** Пошук усіх елементів — одразу повертає масив, а не NodeList. */
  function $$(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  /**
   * Створює DOM-елемент з атрибутами та дочірніми вузлами.
   * createEl("button", { class: "btn", type: "button" }, "Текст")
   */
  function createEl(tag, attrs = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value === false || value === null || value === undefined) return;
      if (key === "class") el.className = value;
      else if (key === "text") el.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else el.setAttribute(key, value === true ? "" : value);
    });
    children.flat(Infinity).forEach((child) => {
      if (child === null || child === undefined || child === false) return;
      el.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return el;
  }

  /** Відкладає виклик функції, поки користувач не перестане вводити (для пошуку). */
  function debounce(fn, delay = 250) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Безпечна робота з localStorage: у приватному режимі він може бути недоступний. */
  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        /* сховище недоступне — просто не зберігаємо */
      }
    },
  };

  /** Чи просив користувач зменшити анімації (налаштування ОС). */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Правильна форма слова для числа: plural(3, ["кейс", "кейси", "кейсів"]). */
  function plural(n, forms) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return forms[0];
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
    return forms[2];
  }

  GP.utils = { $, $$, createEl, debounce, storage, prefersReducedMotion, plural };
})((window.GP = window.GP || {}));
