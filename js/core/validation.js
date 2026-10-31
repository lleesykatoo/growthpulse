/* =========================================================
   core/validation.js — перевірка даних форм на стороні клієнта.

   Правила зчитуються з атрибутів поля:
     required            — обов'язкове поле
     type="email"        — формат email
     type="tel"          — формат українського номера
     minlength="2"       — мінімальна довжина
     data-max="500"      — максимальна довжина (з лічильником)
     data-validate="name"— лише літери, пробіл, апостроф, дефіс
   Групи радіокнопок: <fieldset data-required-group>.

   Повідомлення виводяться під полем у <p class="field__error">,
   поле отримує aria-invalid="true", а екранний читач зачитує
   помилку завдяки aria-describedby.
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$ } = GP.utils;

  const PATTERNS = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    // +380 XX XXX XX XX, допускаються пробіли, дефіси, дужки; можна без «+38»
    phone: /^(\+?38)?0\d{9}$/,
    name: /^[A-Za-zА-ЩЬЮЯЄІЇҐа-щьюяєіїґ' ʼ-]+$/,
  };

  /** Тексти повідомлень зібрані в одному об'єкті — їх легко змінити або перекласти. */
  const MESSAGES = {
    required: (label) => `Поле «${label}» є обов'язковим`,
    requiredGroup: "Оберіть один із варіантів",
    email: "Email має бути у форматі name@company.com",
    phone: "Номер телефону має бути у форматі +380 XX XXX XX XX",
    name: "Ім'я може містити лише літери, пробіл, апостроф і дефіс",
    minLength: (n, cur) => `Мінімум ${n} символи (зараз ${cur})`,
    maxLength: (n, cur) => `Максимум ${n} символів (зараз ${cur})`,
  };

  /** Назва поля для повідомлення — текст його <label> без зірочки. */
  function getLabel(input) {
    const label = input.id ? $(`label[for="${input.id}"]`) : null;
    return label ? label.textContent.replace("*", "").trim() : input.name;
  }

  /**
   * Перевіряє одне поле і повертає текст помилки або порожній рядок.
   * Порядок перевірок: обов'язковість → довжина → формат.
   */
  function checkField(input) {
    const value = input.value.trim();
    const label = getLabel(input);

    if (input.required && !value) return MESSAGES.required(label);
    if (!value) return ""; // необов'язкове порожнє поле — без помилки

    const min = Number(input.getAttribute("minlength"));
    if (min && value.length < min) return MESSAGES.minLength(min, value.length);

    const max = Number(input.dataset.max);
    if (max && value.length > max) return MESSAGES.maxLength(max, value.length);

    if (input.type === "email" && !PATTERNS.email.test(value)) return MESSAGES.email;

    if (input.type === "tel") {
      const digits = value.replace(/[\s()-]/g, "");
      if (!PATTERNS.phone.test(digits)) return MESSAGES.phone;
    }

    if (input.dataset.validate === "name" && !PATTERNS.name.test(value)) return MESSAGES.name;

    return "";
  }

  /** Перевіряє групу радіокнопок у fieldset[data-required-group]. */
  function checkGroup(fieldset) {
    return $$('input[type="radio"]', fieldset).some((r) => r.checked) ? "" : MESSAGES.requiredGroup;
  }

  /** Знаходить (або створює) елемент для повідомлення про помилку. */
  function getErrorEl(target) {
    const id = target.getAttribute("aria-describedby");
    let el = id ? document.getElementById(id.split(" ")[0]) : null;
    if (!el) {
      el = document.createElement("p");
      el.className = "field__error";
      el.id = `${target.id || target.name || "group"}-error`;
      target.setAttribute("aria-describedby", el.id);
      target.after(el);
    }
    return el;
  }

  function showError(target, message) {
    const errorEl = getErrorEl(target);
    errorEl.textContent = message;
    target.setAttribute("aria-invalid", message ? "true" : "false");
    target.classList.toggle("is-invalid", Boolean(message));
    target.classList.toggle("is-valid", !message && Boolean(target.value && target.value.trim()));
  }

  /** Перевіряє поле або групу та одразу показує результат. Повертає true, якщо все гаразд. */
  function validate(target) {
    const message = target.matches("fieldset") ? checkGroup(target) : checkField(target);
    showError(target, message);
    return !message;
  }

  /** Елементи, які потрібно перевіряти всередині контейнера (форми або кроку). */
  function getTargets(root) {
    // querySelectorAll не враховує сам root, тому перевіряємо його окремо
    const groups = $$("fieldset[data-required-group]", root);
    if (root.matches("fieldset[data-required-group]")) groups.unshift(root);
    return [...groups, ...$$("input:not([type=radio]):not([type=hidden]), textarea", root)];
  }

  /**
   * Перевіряє всі поля контейнера. Фокусує перше некоректне поле,
   * щоб користувач одразу бачив, що виправити.
   */
  function validateAll(root) {
    const targets = getTargets(root);
    // після спроби надсилання всі поля перевіряються «на льоту», щоб помилка
    // зникала одразу під час введення, а не при втраті фокусу (інакше
    // верстка зсувається саме в момент кліку по кнопці й клік «губиться»)
    targets.forEach((t) => {
      t.dataset.touched = "true";
    });
    const invalid = targets.filter((t) => !validate(t));
    if (invalid.length) {
      const first = invalid[0];
      (first.matches("fieldset") ? $("input", first) : first).focus();
    }
    return invalid.length === 0;
  }

  /**
   * «Жива» перевірка: після першого виходу з поля (blur) воно
   * перевіряється при кожному введенні, щоб помилка зникала одразу
   * після виправлення, але не з'являлася, поки людина ще друкує.
   */
  function attachLive(form) {
    getTargets(form).forEach((target) => {
      if (target.matches("fieldset")) {
        target.addEventListener("change", () => validate(target));
        return;
      }
      target.addEventListener("blur", () => {
        target.dataset.touched = "true";
        validate(target);
      });
      target.addEventListener("input", () => {
        if (target.dataset.touched) validate(target);
      });
    });
  }

  /** Лічильник символів для textarea[data-max]. */
  function attachCounter(textarea) {
    const max = Number(textarea.dataset.max);
    const counter = document.createElement("p");
    counter.className = "field__counter";
    counter.setAttribute("aria-live", "polite");
    textarea.after(counter);
    const update = () => {
      const len = textarea.value.length;
      counter.textContent = `${len} / ${max}`;
      counter.classList.toggle("is-over", len > max);
    };
    textarea.addEventListener("input", update);
    update();
  }

  function reset(form) {
    getTargets(form).forEach((t) => {
      showError(t, "");
      t.classList.remove("is-valid");
      delete t.dataset.touched;
    });
  }

  GP.validation = { PATTERNS, MESSAGES, checkField, validate, validateAll, attachLive, attachCounter, reset };
})((window.GP = window.GP || {}));
