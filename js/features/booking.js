/* =========================================================
   features/booking.js — бронювання консультації:
   календар, що будується з дати сьогодні (вихідні й минулі
   дні недоступні), слоти часу, перевірка форми та
   підтвердження. Також ініціалізує акордеон «Часті питання».
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$, createEl } = GP.utils;
  const V = GP.validation;

  const fmtMonth = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric" });
  const fmtDay = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long", weekday: "long" });

  const isWorkday = (d) => d.getDay() !== 0 && d.getDay() !== 6;
  const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  /** Об'єкт календаря: зберігає стан (місяць, вибрана дата) і малює сітку. */
  const Calendar = {
    init(root, onSelect) {
      this.grid = $("#calendar-grid", root);
      this.monthEl = $("#calendar-month", root);
      this.prevBtn = $('[data-cal="prev"]', root);
      this.nextBtn = $('[data-cal="next"]', root);
      this.weekdays = $$(".calendar__weekday", this.grid);
      this.onSelect = onSelect;
      this.selected = null;

      this.today = new Date();
      this.today.setHours(0, 0, 0, 0);
      this.view = new Date(this.today.getFullYear(), this.today.getMonth(), 1);

      // якщо до кінця місяця немає робочих днів — починаємо з наступного
      const last = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);
      let hasFree = false;
      for (let d = new Date(this.today); d <= last; d.setDate(d.getDate() + 1)) if (isWorkday(d)) hasFree = true;
      if (!hasFree) this.view.setMonth(this.view.getMonth() + 1);
      this.firstView = new Date(this.view);

      this.prevBtn.addEventListener("click", () => this.shift(-1));
      this.nextBtn.addEventListener("click", () => this.shift(1));
      this.grid.addEventListener("click", (e) => {
        const btn = e.target.closest(".calendar__day");
        if (btn && !btn.disabled) this.select(new Date(btn.dataset.date + "T00:00"));
      });
      this.render();
    },

    shift(delta) {
      this.view.setMonth(this.view.getMonth() + delta);
      this.render();
    },

    select(date) {
      this.selected = date;
      this.render();
      this.onSelect(date);
      const btn = $(`[data-date="${toISO(date)}"]`, this.grid);
      if (btn) btn.focus();
    },

    render() {
      const label = fmtMonth.format(this.view).replace(" р.", "");
      this.monthEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);

      const cells = [...this.weekdays];
      const offset = (this.view.getDay() + 6) % 7; // тиждень починається з понеділка
      for (let i = 0; i < offset; i += 1) cells.push(createEl("span"));

      const days = new Date(this.view.getFullYear(), this.view.getMonth() + 1, 0).getDate();
      for (let d = 1; d <= days; d += 1) {
        const date = new Date(this.view.getFullYear(), this.view.getMonth(), d);
        const selected = this.selected && +date === +this.selected;
        cells.push(createEl("button", {
          type: "button",
          class: "calendar__day" + (+date === +this.today ? " is-today" : ""),
          "data-date": toISO(date),
          "aria-label": fmtDay.format(date),
          "aria-pressed": selected ? "true" : "false",
          disabled: date < this.today || !isWorkday(date),
        }, d));
      }
      this.grid.replaceChildren(...cells);
      this.prevBtn.disabled = +this.view <= +this.firstView;
    },
  };

  function initBooking() {
    const form = $("#booking-form");
    if (!form) return;

    const dateInput = $("#booking-date");
    const picked = $("#calendar-picked");
    const dateError = $("#date-error");
    const slots = $("#slots");

    Calendar.init($("#calendar"), (date) => {
      dateInput.value = toISO(date);
      picked.textContent = fmtDay.format(date);
      dateError.textContent = "";
    });

    V.attachLive(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;
      if (!dateInput.value) {
        dateError.textContent = "Оберіть дату в календарі";
        ok = false;
      }
      // validateAll перевіряє групу слотів (fieldset) та поля контактів
      if (!V.validateAll(form)) ok = false;
      if (!dateInput.value) $(".calendar__day:not(:disabled)", form).focus();
      if (!ok) {
        GP.toast.show("Заповніть, будь ласка, усі обов'язкові поля", "error");
        return;
      }

      const time = $('input[name="time"]:checked', slots).value;
      const email = form.elements.email.value.trim();
      const status = $("#booking-status");
      status.textContent = `Зустріч заброньовано: ${fmtDay.format(Calendar.selected)}, ${time}. Запрошення надіслано на ${email}.`;
      status.className = "form-status is-success";
      GP.toast.show("Консультацію заброньовано", "success");
      form.reset();
      V.reset(form);
      Calendar.selected = null;
      Calendar.render();
      dateInput.value = "";
      picked.textContent = "—";
    });
  }

  function initFaq() {
    const faq = $("#faq");
    if (faq) new GP.Accordion(faq, { single: true });
  }

  GP.booking = {
    init() {
      initBooking();
      initFaq();
    },
  };
})((window.GP = window.GP || {}));
