/* =========================================================
   features/navigation.js — інтерактивна навігація:
   • мобільне меню (кнопка-«бургер», Esc, клік поза меню,
     закриття після вибору пункту, повернення фокусу);
   • тінь шапки під час прокрутки;
   • кнопка «Нагору», що з'являється після прокрутки.
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$ } = GP.utils;

  function initMenu() {
    const toggle = $(".nav-toggle");
    const nav = $("#site-nav");
    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
      nav.classList.toggle("is-open", open);
    };
    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

    toggle.addEventListener("click", () => {
      setOpen(!isOpen());
      if (isOpen()) $("a", nav).focus();
    });

    // Esc закриває меню і повертає фокус на кнопку
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    // клік поза меню (делегування на document)
    document.addEventListener("click", (e) => {
      if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    // вибір пункту меню закриває панель
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });

    // якщо вікно розширили до десктопа — скидаємо стан мобільного меню
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (mq) => {
      if (mq.matches) setOpen(false);
    });
  }

  function initScrollUi() {
    const header = $(".site-header");
    const toTop = $(".to-top");

    const onScroll = () => {
      const y = window.scrollY;
      if (header) header.classList.toggle("is-scrolled", y > 8);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: GP.utils.prefersReducedMotion() ? "auto" : "smooth" });
        $("#main").focus({ preventScroll: true });
      });
    }
  }

  /** Плавна прокрутка до якорів на тій самій сторінці (наприклад, «Перейти до вмісту»). */
  function initAnchors() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = document.getElementById(link.getAttribute("href").slice(1));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: GP.utils.prefersReducedMotion() ? "auto" : "smooth" });
        target.focus({ preventScroll: true });
      });
    });
  }

  GP.navigation = {
    init() {
      initMenu();
      initScrollUi();
      initAnchors();
    },
  };
})((window.GP = window.GP || {}));
