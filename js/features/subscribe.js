/* =========================================================
   features/subscribe.js — підписка на дайджест у футері.
   ========================================================= */
"use strict";

(function (GP) {
  const V = GP.validation;

  function init() {
    GP.utils.$$('[data-form="subscribe"]').forEach((form) => {
      const input = form.querySelector("input[type='email']");
      V.attachLive(form);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!V.validate(input)) {
          input.focus();
          return;
        }
        GP.toast.show(`Дякуємо! Дайджест надходитиме на ${input.value.trim()}`, "success");
        form.reset();
        V.reset(form);
      });
    });
  }

  GP.subscribe = { init };
})((window.GP = window.GP || {}));
