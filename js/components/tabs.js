/* =========================================================
   components/tabs.js — вкладки (role="tablist").
   Активна вкладка має aria-selected="true" і tabindex="0",
   інші — tabindex="-1" (патерн «roving tabindex»):
   Tab переходить до списку вкладок одним кроком, а між
   вкладками рухаються стрілками ←/→, Home, End.
   ========================================================= */
"use strict";

(function (GP) {
  class Tabs {
    /**
     * @param {HTMLElement} tablist
     * @param {{ onChange?: (value: string) => void }} options
     */
    constructor(tablist, { onChange } = {}) {
      this.tabs = GP.utils.$$('[role="tab"]', tablist);
      this.onChange = onChange || (() => {});

      this.tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => this.select(i));
        tab.addEventListener("keydown", (e) => this.onKey(e, i));
      });
      const initial = this.tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      this.select(initial < 0 ? 0 : initial, false);
    }

    select(i, notify = true) {
      this.tabs.forEach((tab, k) => {
        const active = k === i;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      this.current = this.tabs[i].dataset.value;
      if (notify) this.onChange(this.current);
    }

    onKey(event, i) {
      const last = this.tabs.length - 1;
      const moves = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last };
      if (!(event.key in moves)) return;
      event.preventDefault();
      const target = moves[event.key];
      this.tabs[target].focus();
      this.select(target);
    }
  }

  GP.Tabs = Tabs;
})((window.GP = window.GP || {}));
