/* =========================================================
   components/accordion.js — акордеон (розкривні відповіді).
   Розмітка: кнопка з aria-expanded/aria-controls + панель.
   Опція single: true — одночасно відкрита лише одна панель.
   Керування з клавіатури: ↑/↓ — сусідній заголовок,
   Home/End — перший/останній.
   ========================================================= */
"use strict";

(function (GP) {
  class Accordion {
    constructor(root, { single = true } = {}) {
      this.root = root;
      this.single = single;
      this.buttons = GP.utils.$$("[data-accordion-btn]", root);

      this.buttons.forEach((btn) => {
        btn.addEventListener("click", () => this.toggle(btn));
        btn.addEventListener("keydown", (e) => this.onKey(e, btn));
      });
    }

    panelOf(btn) {
      return document.getElementById(btn.getAttribute("aria-controls"));
    }

    toggle(btn, force) {
      const willOpen = force !== undefined ? force : btn.getAttribute("aria-expanded") !== "true";
      if (willOpen && this.single) {
        this.buttons.filter((b) => b !== btn).forEach((b) => this.setState(b, false));
      }
      this.setState(btn, willOpen);
    }

    setState(btn, open) {
      const panel = this.panelOf(btn);
      btn.setAttribute("aria-expanded", String(open));
      btn.closest("[data-accordion-item]").classList.toggle("is-open", open);
      if (open) {
        panel.hidden = false;
        panel.style.maxHeight = panel.scrollHeight + "px"; // плавне розкриття
      } else {
        panel.style.maxHeight = "0px";
        // приховуємо після завершення анімації, щоб вміст не потрапляв у Tab-навігацію
        const delay = GP.utils.prefersReducedMotion() ? 0 : 250;
        setTimeout(() => {
          if (btn.getAttribute("aria-expanded") === "false") panel.hidden = true;
        }, delay);
      }
    }

    onKey(event, btn) {
      const i = this.buttons.indexOf(btn);
      const last = this.buttons.length - 1;
      const moves = { ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last };
      if (event.key in moves) {
        event.preventDefault();
        this.buttons[moves[event.key]].focus();
      }
    }
  }

  GP.Accordion = Accordion;
})((window.GP = window.GP || {}));
