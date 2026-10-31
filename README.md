# GrowthPulse — сайт маркетингової агенції

Виконала: Гумен Олеся, група 4-18 ФМТП.

- **ПР № 3** — верстка за прототипом Figma (HTML, CSS, Flexbox, Grid). Версія ПР3 збережена в релізі [`pr3`](../../tree/pr3).
- **ПР № 4** — удосконалення засобами JavaScript: інтерактивна навігація, динамічний вміст, компоненти, валідація форм.

Робоча версія: https://lleesykatoo.github.io/growthpulse/

## Сторінки
| Файл | Сторінка | JavaScript (ПР4) |
|---|---|---|
| `index.html` | Головна | слайдер «Як ми працюємо» |
| `cases.html` | Кейси | картки з даних, фільтр + лічильник, модальне вікно, стан в URL |
| `brief.html` | Бриф | 4 кроки, валідація, чернетка, підсумок |
| `consultation.html` | Консультація | календар, слоти, валідація, акордеон FAQ |
| `blog.html` | Блог | вкладки-категорії, пошук із підсвічуванням |
| `404.html` | Помилка на сайті | — |

## Структура JavaScript
```
js/
├── core/        utils.js (DOM-хелпери), validation.js (перевірка форм)
├── data/        content.js (дані кейсів)
├── components/  toast, modal, accordion, slider, tabs — повторно використовувані компоненти
├── features/    navigation, language, cases, blog, brief, booking, subscribe — логіка сторінок
└── main.js      точка входу: запускає модулі після DOMContentLoaded
```
Модулі підключаються звичайними `<script defer>` і реєструються в просторі імен `window.GP`,
тому сайт працює і з GitHub Pages, і при відкритті `index.html` з диска.

## Перевірка
- HTML: W3C Nu Html Checker — 0 помилок, 0 попереджень
- CSS: W3C CSS Validator (CSS level 3 + SVG) — помилок не знайдено
- Консоль браузера: без помилок під час усіх сценаріїв
