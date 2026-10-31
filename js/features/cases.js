/* =========================================================
   features/cases.js — сторінка «Кейси».
   • картки генеруються з GP.data.cases (динамічний вміст);
   • фільтрація чипами + лічильник «Показано N з M»;
   • стан фільтра зберігається в адресі (?filter=pr), тому
     працюють кнопки «Назад/Вперед» браузера і посилання;
   • кнопка «Детальніше» відкриває модальне вікно з описом
     кейсу; адреса отримує #id, тож кейс можна відкрити
     за прямим посиланням (наприклад, cases.html#freshbox).
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$, createEl, plural } = GP.utils;

  /** Картка кейсу у списку. */
  function renderCard(item) {
    const btn = createEl("button", {
      class: "card__more",
      type: "button",
      "data-case": item.id,
      "aria-haspopup": "dialog",
      "data-en": "Read more →",
    }, "Детальніше →");

    return createEl("li", { class: "card", "data-category": item.category, id: `case-${item.id}` },
      createEl("div", { class: "card__cover", "aria-hidden": "true" }),
      createEl("p", { class: "card__meta" }, `${GP.data.categories[item.category].uk} · ${item.industry}`),
      createEl("h3", { class: "card__title" }, item.name),
      createEl("p", { class: "case-result" }, createEl("strong", { class: "case-result__value" }, item.value)),
      createEl("p", { class: "case-result__label", "data-en": `*${item.labelEn}` }, `*${item.label}`),
      btn
    );
  }

  /** Вміст модального вікна для одного кейсу. */
  function renderDetails(item) {
    return createEl("div", { class: "case-details" },
      createEl("p", { class: "card__meta" }, `${GP.data.categories[item.category].uk} · ${item.industry} · ${item.duration}`),
      createEl("p", { class: "case-details__value" }, createEl("strong", {}, item.value), ` ${item.label}`),
      createEl("h3", {}, "Завдання"),
      createEl("p", {}, item.task),
      createEl("h3", {}, "Що ми зробили"),
      createEl("p", {}, item.solution),
      createEl("h3", {}, "Результати"),
      createEl("ul", { class: "check-list" }, item.results.map((r) => createEl("li", {}, r))),
      createEl("a", { class: "btn btn--primary btn--lg", href: "brief.html" }, "Хочу так само — заповнити бриф")
    );
  }

  function init() {
    const list = $("#cases-list");
    if (!list) return;

    const chips = $$(".chip[data-filter]");
    const counter = $("#cases-counter");
    const empty = $("#cases-empty");
    const items = GP.data.cases;

    list.replaceChildren(...items.map(renderCard));
    const cards = $$(".card", list);

    function applyFilter(filter, push = true) {
      if (!GP.data.categories[filter]) filter = "all";
      chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === filter)));

      let visible = 0;
      cards.forEach((card) => {
        const show = filter === "all" || card.dataset.category === filter;
        card.hidden = !show;
        if (show) visible += 1;
      });

      counter.textContent = `Показано ${visible} з ${cards.length} ${plural(cards.length, ["кейса", "кейсів", "кейсів"])}`;
      empty.hidden = visible > 0;

      if (push) {
        const url = new URL(location.href);
        if (filter === "all") url.searchParams.delete("filter");
        else url.searchParams.set("filter", filter);
        url.hash = "";
        history.pushState({ filter }, "", url);
      }
    }

    chips.forEach((chip) => chip.addEventListener("click", () => applyFilter(chip.dataset.filter)));

    // --- модальне вікно ---
    const modal = new GP.Modal($("#case-modal"), {
      onClose() {
        if (location.hash) history.replaceState(history.state, "", location.pathname + location.search);
      },
    });

    function openCase(id, opener) {
      const item = items.find((c) => c.id === id);
      if (!item) return;
      modal.open({ title: item.name, content: renderDetails(item), opener });
      if (location.hash !== `#${id}`) history.replaceState(history.state, "", `#${id}`);
    }

    // делегування подій: один обробник на весь список замість обробника на кожну кнопку
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-case]");
      if (btn) openCase(btn.dataset.case, btn);
    });

    // «Назад/Вперед» у браузері відновлює фільтр
    window.addEventListener("popstate", () => {
      applyFilter(new URLSearchParams(location.search).get("filter") || "all", false);
    });

    applyFilter(new URLSearchParams(location.search).get("filter") || "all", false);
    if (location.hash) openCase(location.hash.slice(1), $(`[data-case="${location.hash.slice(1)}"]`));
  }

  GP.cases = { init, renderDetails };
})((window.GP = window.GP || {}));
