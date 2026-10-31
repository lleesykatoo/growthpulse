/* =========================================================
   components/modal.js — модальне вікно на основі <dialog>.
   Відкривається методом showModal(): браузер сам блокує фон,
   закриває вікно клавішею Esc і утримує фокус усередині.
   Компонент додає закриття кліком по фону, повернення фокусу
   на кнопку, що відкрила вікно, і подію закриття.
   ========================================================= */
"use strict";

(function (GP) {
  class Modal {
    /**
     * @param {HTMLDialogElement} dialog
     * @param {{ onClose?: Function }} options
     */
    constructor(dialog, options = {}) {
      this.dialog = dialog;
      this.body = dialog.querySelector("[data-modal-body]");
      this.title = dialog.querySelector("[data-modal-title]");
      this.onClose = options.onClose || null;
      this.opener = null;

      dialog.querySelectorAll("[data-modal-close]").forEach((btn) =>
        btn.addEventListener("click", () => this.close())
      );

      // Клік по затемненому фону (поза вмістом вікна) закриває модалку
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) this.close();
      });

      // Подія close спрацьовує і на Esc, і на виклик close()
      dialog.addEventListener("close", () => {
        document.body.classList.remove("has-modal");
        if (this.opener && document.contains(this.opener)) this.opener.focus();
        if (this.onClose) this.onClose();
      });
    }

    /** Заповнює вікно вмістом і відкриває його. */
    open({ title, content, opener }) {
      this.opener = opener || document.activeElement;
      if (this.title && title) this.title.textContent = title;
      if (this.body && content) this.body.replaceChildren(content);
      document.body.classList.add("has-modal");
      this.dialog.showModal();
    }

    close() {
      if (this.dialog.open) this.dialog.close();
    }

    get isOpen() {
      return this.dialog.open;
    }
  }

  GP.Modal = Modal;
})((window.GP = window.GP || {}));
