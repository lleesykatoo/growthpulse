/* =========================================================
   components/slider.js — слайдер (карусель).
   Можливості: кнопки «назад/вперед», крапки-індикатори,
   автопрокрутка з паузою при наведенні/фокусі, клавіші ←/→,
   свайп на сенсорних екранах, оголошення номера слайда
   для екранних читачів.
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$, createEl, prefersReducedMotion } = GP.utils;

  class Slider {
    constructor(root, { interval = 6000 } = {}) {
      this.root = root;
      this.track = $("[data-slider-track]", root);
      this.slides = $$("[data-slide]", root);
      this.prevBtn = $("[data-slider-prev]", root);
      this.nextBtn = $("[data-slider-next]", root);
      this.dotsBox = $("[data-slider-dots]", root);
      this.status = $("[data-slider-status]", root);
      this.index = 0;
      this.interval = interval;
      this.timer = null;

      this.buildDots();
      this.bindEvents();
      this.goTo(0, false);
      if (!prefersReducedMotion()) this.play();
    }

    buildDots() {
      this.dots = this.slides.map((slide, i) =>
        createEl("button", {
          class: "slider__dot",
          type: "button",
          "aria-label": `Слайд ${i + 1} з ${this.slides.length}`,
          onclick: () => this.goTo(i),
        })
      );
      this.dotsBox.replaceChildren(...this.dots);
    }

    bindEvents() {
      this.prevBtn.addEventListener("click", () => this.goTo(this.index - 1));
      this.nextBtn.addEventListener("click", () => this.goTo(this.index + 1));

      this.root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") this.goTo(this.index - 1);
        if (e.key === "ArrowRight") this.goTo(this.index + 1);
      });

      // пауза автопрокрутки, коли користувач взаємодіє зі слайдером
      ["mouseenter", "focusin"].forEach((ev) => this.root.addEventListener(ev, () => this.stop()));
      ["mouseleave", "focusout"].forEach((ev) =>
        this.root.addEventListener(ev, () => {
          if (!prefersReducedMotion()) this.play();
        })
      );

      // свайп пальцем (Pointer Events працюють і для миші, і для дотику)
      let startX = null;
      this.track.addEventListener("pointerdown", (e) => {
        startX = e.clientX;
      });
      this.track.addEventListener("pointerup", (e) => {
        if (startX === null) return;
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) this.goTo(this.index + (dx < 0 ? 1 : -1));
        startX = null;
      });
    }

    /** Перехід до слайда з номером i (по колу). */
    goTo(i, announce = true) {
      const n = this.slides.length;
      this.index = (i + n) % n;
      this.track.style.transform = `translateX(-${this.index * 100}%)`;

      this.slides.forEach((slide, k) => {
        const active = k === this.index;
        slide.setAttribute("aria-hidden", String(!active));
        slide.toggleAttribute("inert", !active); // неактивні слайди не фокусуються
      });
      this.dots.forEach((dot, k) => dot.setAttribute("aria-current", k === this.index ? "true" : "false"));
      if (announce && this.status) this.status.textContent = `Слайд ${this.index + 1} з ${n}`;
    }

    play() {
      this.stop();
      this.timer = setInterval(() => this.goTo(this.index + 1, false), this.interval);
    }

    stop() {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  GP.Slider = Slider;
})((window.GP = window.GP || {}));
