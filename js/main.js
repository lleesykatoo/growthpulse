/* =========================================================
   main.js — інтерактивність сайту GrowthPulse
   (мобільне меню, перемикач UA/EN, фільтр кейсів,
   крокова форма брифу, календар бронювання, валідація форм)
   ========================================================= */
"use strict";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setStatus(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("is-error", type === "error");
  el.classList.toggle("is-success", type === "success");
}

/* ---------- Мобільне меню ---------- */
function initNav() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Відкрити меню" : "Закрити меню");
    nav.classList.toggle("is-open", !open);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

/* ---------- Перемикач мови UA / EN (US4, FR-5) ---------- */
function applyLang(lang) {
  document.documentElement.lang = lang === "en" ? "en" : "uk";
  document.querySelectorAll("[data-en]").forEach((el) => {
    if (!el.dataset.uk) el.dataset.uk = el.textContent.trim();
    el.textContent = lang === "en" ? el.dataset.en : el.dataset.uk;
  });
  document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });
}

function initLang() {
  let saved = "uk";
  try {
    saved = localStorage.getItem("gp-lang") || "uk";
  } catch (e) {
    /* сховище недоступне — лишаємо українську */
  }
  if (saved === "en") applyLang("en");

  document.querySelectorAll(".lang-switch__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang);
      try {
        localStorage.setItem("gp-lang", btn.dataset.lang);
      } catch (e) {
        /* ігноруємо */
      }
    });
  });
}

/* ---------- Фільтр кейсів (US1, FR-1) — компонент Chip ---------- */
function initCaseFilter() {
  const chips = document.querySelectorAll(".chip[data-filter]");
  const cards = document.querySelectorAll("#cases-list .card");
  const empty = document.getElementById("cases-empty");
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c === chip)));
      let visible = 0;
      cards.forEach((card) => {
        const show = f === "all" || card.dataset.category === f;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
    });
  });
}

/* ---------- Бриф із кроками (US2, FR-2) ---------- */
function initBrief() {
  const form = document.getElementById("brief-form");
  if (!form) return;

  const steps = [...form.querySelectorAll(".brief__step")];
  const bar = form.querySelector(".progress__bar");
  const progress = form.querySelector(".progress");
  const counter = form.querySelector("[data-step-current]");
  const prev = form.querySelector('[data-brief="prev"]');
  const next = form.querySelector('[data-brief="next"]');
  const submit = form.querySelector('[data-brief="submit"]');
  const status = form.querySelector(".form-status");
  let current = 0;

  function render() {
    steps.forEach((s, i) => {
      s.hidden = i !== current;
    });
    const n = current + 1;
    counter.textContent = n;
    bar.style.width = (n / steps.length) * 100 + "%";
    progress.setAttribute("aria-valuenow", n);
    prev.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    submit.hidden = current !== steps.length - 1;
    setStatus(status, "");
  }

  function stepValid(i) {
    const step = steps[i];
    const radios = step.querySelectorAll('input[type="radio"]');
    if (radios.length && ![...radios].some((r) => r.checked)) {
      setStatus(status, "Оберіть один із варіантів, щоб продовжити.", "error");
      return false;
    }
    let ok = true;
    step.querySelectorAll("input[required]:not([type='radio'])").forEach((inp) => {
      const bad = !inp.value.trim() || (inp.type === "email" && !EMAIL_RE.test(inp.value.trim()));
      inp.setAttribute("aria-invalid", String(bad));
      if (bad) ok = false;
    });
    if (!ok) setStatus(status, "Заповніть ім'я та коректний email.", "error");
    return ok;
  }

  next.addEventListener("click", () => {
    if (!stepValid(current)) return;
    current += 1;
    render();
    steps[current].querySelector("input")?.focus();
  });

  prev.addEventListener("click", () => {
    current -= 1;
    render();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!stepValid(current)) return;
    form.innerHTML =
      '<div class="brief__done"><h2 class="brief__title">Дякуємо!</h2>' +
      "<p>Бриф отримано. Менеджер зв'яжеться з вами протягом 1 робочого дня.</p>" +
      '<p><a class="btn btn--primary" href="index.html">На головну</a></p></div>';
  });

  render();
}

/* ---------- Календар бронювання (US3) ---------- */
function initCalendar() {
  const grid = document.getElementById("calendar-grid");
  const form = document.getElementById("booking-form");
  if (!grid || !form) return;

  const monthEl = document.getElementById("calendar-month");
  const pickedEl = document.getElementById("calendar-picked");
  const dateInput = document.getElementById("booking-date");
  const prevBtn = form.querySelector('[data-cal="prev"]');
  const nextBtn = form.querySelector('[data-cal="next"]');
  const status = form.querySelector(".form-status");
  const weekdays = [...grid.querySelectorAll(".calendar__weekday")];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selected = null;

  // якщо в поточному місяці не лишилось робочих днів — відкриваємо наступний
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  let hasFree = false;
  for (let d = new Date(today); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 0 && d.getDay() !== 6) hasFree = true;
  }
  if (!hasFree) view.setMonth(view.getMonth() + 1);
  const firstView = new Date(view);

  const fmtMonth = new Intl.DateTimeFormat("uk-UA", { month: "long", year: "numeric" });
  const fmtDay = new Intl.DateTimeFormat("uk-UA", { day: "numeric", month: "long" });

  function render() {
    grid.replaceChildren(...weekdays);
    const label = fmtMonth.format(view).replace(" р.", "");
    monthEl.textContent = label.charAt(0).toUpperCase() + label.slice(1);

    const offset = (view.getDay() + 6) % 7; // понеділок — перший день тижня
    for (let i = 0; i < offset; i += 1) grid.append(document.createElement("span"));

    const days = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= days; d += 1) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "calendar__day";
      btn.textContent = d;
      btn.setAttribute("aria-label", fmtDay.format(date));
      const weekend = date.getDay() === 0 || date.getDay() === 6;
      btn.disabled = date < today || weekend;
      if (+date === +today) btn.classList.add("is-today");
      btn.setAttribute("aria-pressed", String(selected !== null && +date === +selected));
      btn.addEventListener("click", () => {
        selected = date;
        dateInput.value = date.toISOString().slice(0, 10);
        pickedEl.textContent = fmtDay.format(date);
        render();
      });
      grid.append(btn);
    }
    prevBtn.disabled = +view <= +firstView;
  }

  prevBtn.addEventListener("click", () => {
    view.setMonth(view.getMonth() - 1);
    render();
  });
  nextBtn.addEventListener("click", () => {
    view.setMonth(view.getMonth() + 1);
    render();
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const time = form.querySelector('input[name="time"]:checked');
    const name = form.querySelector("#book-name");
    const email = form.querySelector("#book-email");
    const badName = !name.value.trim();
    const badEmail = !EMAIL_RE.test(email.value.trim());
    name.setAttribute("aria-invalid", String(badName));
    email.setAttribute("aria-invalid", String(badEmail));

    if (!selected) return setStatus(status, "Оберіть дату в календарі.", "error");
    if (!time) return setStatus(status, "Оберіть зручний час.", "error");
    if (badName || badEmail) return setStatus(status, "Вкажіть ім'я та коректний email.", "error");
    setStatus(
      status,
      `Зустріч заброньовано на ${fmtDay.format(selected)} о ${time.value}. Запрошення надіслано на ${email.value.trim()}.`,
      "success"
    );
  });

  render();
}

/* ---------- Підписка у футері (US5) ---------- */
function initSubscribe() {
  document.querySelectorAll('[data-form="subscribe"]').forEach((form) => {
    const input = form.querySelector("input[type='email']");
    const status = form.querySelector(".form-status");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = input.value.trim();
      if (!EMAIL_RE.test(value)) {
        input.setAttribute("aria-invalid", "true");
        setStatus(status, "Введіть коректний email, наприклад name@company.com", "error");
        input.focus();
        return;
      }
      input.setAttribute("aria-invalid", "false");
      setStatus(status, "Дякуємо! Ви підписані на дайджест.", "success");
      form.reset();
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initLang();
  initCaseFilter();
  initBrief();
  initCalendar();
  initSubscribe();
});
