/* =========================================================
   main.js — точка входу.
   Підключається останнім і запускає модулі, коли DOM готовий.
   Кожен модуль сам перевіряє, чи є на сторінці потрібні
   елементи, тому той самий набір скриптів працює на всіх
   сторінках без помилок у консолі.
   ========================================================= */
"use strict";

(function (GP) {
  function initHomeSlider() {
    const root = document.getElementById("process-slider");
    if (root) new GP.Slider(root, { interval: 6000 });
  }

  const modules = [
    ["navigation", () => GP.navigation.init()],
    ["cases", () => GP.cases.init()],
    ["blog", () => GP.blog.init()],
    ["brief", () => GP.brief.init()],
    ["booking", () => GP.booking.init()],
    ["subscribe", () => GP.subscribe.init()],
    ["slider", initHomeSlider],
    ["language", () => GP.language.init()], // останнім — щоб перекласти і згенерований вміст
  ];

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.classList.replace("no-js", "js");
    modules.forEach(([name, init]) => {
      try {
        init();
      } catch (error) {
        // помилка одного модуля не ламає решту сайту
        console.error(`[GrowthPulse] модуль «${name}» не запустився:`, error);
      }
    });
  });
})((window.GP = window.GP || {}));
