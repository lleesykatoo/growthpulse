/* =========================================================
   features/brief.js — бриф із 4 кроків.
   • перехід між кроками з перевіркою поточного кроку;
   • індикатор прогресу і номер кроку оновлюються динамічно;
   • чернетка зберігається в localStorage і відновлюється;
   • після надсилання показується підсумок обраних відповідей.
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$, createEl, storage } = GP.utils;
  const V = GP.validation;
  const DRAFT_KEY = "gp-brief-draft";

  function init() {
    const form = $("#brief-form");
    if (!form) return;

    const steps = $$(".brief__step", form);
    const bar = $(".progress__bar", form);
    const progress = $(".progress", form);
    const counter = $("[data-step-current]", form);
    const prev = $('[data-brief="prev"]', form);
    const next = $('[data-brief="next"]', form);
    const submit = $('[data-brief="submit"]', form);
    let current = 0;

    V.attachLive(form);
    $$("textarea[data-max]", form).forEach(V.attachCounter);

    function render(focus = true) {
      steps.forEach((s, i) => {
        s.hidden = i !== current;
      });
      const n = current + 1;
      counter.textContent = n;
      bar.style.width = `${(n / steps.length) * 100}%`;
      progress.setAttribute("aria-valuenow", n);
      prev.hidden = current === 0;
      next.hidden = current === steps.length - 1;
      submit.hidden = current !== steps.length - 1;
      if (focus) $("legend", steps[current]).focus();
    }

    // --- чернетка ---
    function saveDraft() {
      storage.set(DRAFT_KEY, JSON.stringify({ step: current, data: Object.fromEntries(new FormData(form)) }));
    }
    function restoreDraft() {
      let draft = null;
      try {
        draft = JSON.parse(storage.get(DRAFT_KEY, "null"));
      } catch (e) {
        draft = null;
      }
      if (!draft) return;
      Object.entries(draft.data || {}).forEach(([name, value]) => {
        const fields = form.elements[name];
        if (!fields) return;
        if (fields instanceof RadioNodeList) {
          fields.forEach((r) => {
            r.checked = r.value === value;
          });
        } else fields.value = value;
      });
      current = Math.min(draft.step || 0, steps.length - 1);
      $$("textarea[data-max]", form).forEach((t) => t.dispatchEvent(new Event("input")));
      GP.toast.show("Відновлено вашу незавершену чернетку брифу", "info");
    }
    form.addEventListener("change", saveDraft);
    form.addEventListener("input", GP.utils.debounce(saveDraft, 400));

    next.addEventListener("click", () => {
      if (!V.validateAll(steps[current])) return;
      current += 1;
      render();
      saveDraft();
    });

    prev.addEventListener("click", () => {
      current -= 1;
      render();
      saveDraft();
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!V.validateAll(steps[current])) {
        GP.toast.show("Перевірте виділені поля форми", "error");
        return;
      }
      const data = new FormData(form);
      const labelOf = (name) => {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        return checked ? $(`label[for="${checked.id}"]`).textContent : "—";
      };
      const rows = [
        ["Послуга", labelOf("service")],
        ["Бюджет", labelOf("budget")],
        ["Старт", labelOf("start")],
        ["Ім'я", data.get("name")],
        ["Email", data.get("email")],
        ["Телефон", data.get("phone") || "не вказано"],
      ];
      const summary = createEl("dl", { class: "summary" },
        rows.map(([k, v]) => [createEl("dt", {}, k), createEl("dd", {}, v)])
      );
      const done = createEl("div", { class: "brief__done", tabindex: "-1" },
        createEl("h2", { class: "brief__title" }, "Дякуємо, бриф отримано!"),
        createEl("p", {}, "Менеджер зв'яжеться з вами протягом 1 робочого дня. Ось що ви надіслали:"),
        summary,
        createEl("a", { class: "btn btn--primary", href: "index.html" }, "На головну")
      );
      storage.set(DRAFT_KEY, "null");
      form.replaceChildren(done);
      done.focus();
      GP.toast.show("Бриф успішно надіслано", "success");
    });

    restoreDraft();
    render(false);
  }

  GP.brief = { init };
})((window.GP = window.GP || {}));
