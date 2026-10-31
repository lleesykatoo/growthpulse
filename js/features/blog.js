/* =========================================================
   features/blog.js — сторінка «Блог»:
   вкладки-категорії + пошук за назвою та описом статті.
   Обидва фільтри діють разом; збіги підсвічуються <mark>,
   кількість результатів оновлюється на льоту.
   ========================================================= */
"use strict";

(function (GP) {
  const { $, $$, debounce, plural } = GP.utils;

  /** Підсвічує збіги запиту в тексті (без innerHTML — захист від XSS). */
  function highlight(el, query) {
    const text = el.dataset.text || (el.dataset.text = el.textContent);
    if (!query) {
      el.textContent = text;
      return;
    }
    const lower = text.toLowerCase();
    const q = query.toLowerCase();
    const parts = [];
    let pos = 0;
    let idx;
    while ((idx = lower.indexOf(q, pos)) !== -1) {
      parts.push(text.slice(pos, idx));
      const mark = document.createElement("mark");
      mark.textContent = text.slice(idx, idx + q.length);
      parts.push(mark);
      pos = idx + q.length;
    }
    parts.push(text.slice(pos));
    el.replaceChildren(...parts);
  }

  function init() {
    const list = $("#posts-list");
    if (!list) return;

    const posts = $$(".post", list);
    const search = $("#blog-search");
    const counter = $("#posts-counter");
    const empty = $("#posts-empty");
    const resetBtn = $("#posts-reset");
    const state = { tag: "all", query: "" };

    function render() {
      const q = state.query.trim().toLowerCase();
      let visible = 0;
      posts.forEach((post) => {
        const title = $(".card__title", post);
        const text = $(".card__text", post);
        const matchTag = state.tag === "all" || post.dataset.tag === state.tag;
        const haystack = (title.dataset.text || title.textContent) + " " + (text.dataset.text || text.textContent);
        const matchQuery = !q || haystack.toLowerCase().includes(q);
        const show = matchTag && matchQuery;
        post.hidden = !show;
        highlight(title, q);
        highlight(text, q);
        if (show) visible += 1;
      });
      counter.textContent = `Знайдено ${visible} ${plural(visible, ["статтю", "статті", "статей"])}`;
      empty.hidden = visible > 0;
    }

    const tabs = new GP.Tabs($("#blog-tabs"), {
      onChange(value) {
        state.tag = value;
        render();
      },
    });

    search.addEventListener("input", debounce(() => {
      state.query = search.value;
      render();
    }, 200));

    resetBtn.addEventListener("click", () => {
      search.value = "";
      state.query = "";
      tabs.select(0);
      search.focus();
    });

    render();
  }

  GP.blog = { init, highlight };
})((window.GP = window.GP || {}));
