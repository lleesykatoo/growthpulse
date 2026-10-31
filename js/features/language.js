/* =========================================================
   features/language.js — перемикач мови UA / EN.
   Тексти мають атрибут data-en; оригінальний український
   текст зберігається в data-uk під час першого перемикання.
   Вибір запам'ятовується в localStorage між сторінками.
   ========================================================= */
"use strict";

(function (GP) {
  const { $$, storage } = GP.utils;
  const KEY = "gp-lang";

  function apply(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "uk";
    $$("[data-en]").forEach((el) => {
      if (!el.dataset.uk) el.dataset.uk = el.textContent.trim();
      el.textContent = lang === "en" ? el.dataset.en : el.dataset.uk;
    });
    $$(".lang-switch__btn").forEach((btn) => btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang)));
  }

  GP.language = {
    get current() {
      return storage.get(KEY, "uk");
    },
    apply,
    init() {
      if (this.current === "en") apply("en");
      $$(".lang-switch__btn").forEach((btn) =>
        btn.addEventListener("click", () => {
          apply(btn.dataset.lang);
          storage.set(KEY, btn.dataset.lang);
        })
      );
    },
  };
})((window.GP = window.GP || {}));
