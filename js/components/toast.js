/* =========================================================
   components/toast.js — спливні повідомлення (toast).
   Контейнер створюється динамічно під час першого показу.
   ========================================================= */
"use strict";

(function (GP) {
  let container = null;

  function getContainer() {
    if (!container) {
      container = GP.utils.createEl("div", { class: "toast-stack", "aria-live": "polite", "aria-atomic": "false" });
      document.body.append(container);
    }
    return container;
  }

  /**
   * Показує повідомлення і прибирає його через `duration` мс.
   * type: "success" | "error" | "info"
   */
  function show(message, type = "info", duration = 4000) {
    const { createEl } = GP.utils;
    const closeBtn = createEl("button", { class: "toast__close", type: "button", "aria-label": "Закрити повідомлення" }, "×");
    const toast = createEl("div", { class: `toast toast--${type}`, role: type === "error" ? "alert" : "status" },
      createEl("p", { class: "toast__text" }, message),
      closeBtn
    );

    const remove = () => {
      toast.classList.add("is-leaving");
      setTimeout(() => toast.remove(), 200);
    };
    closeBtn.addEventListener("click", remove);
    getContainer().append(toast);
    setTimeout(remove, duration);
    return toast;
  }

  GP.toast = { show };
})((window.GP = window.GP || {}));
