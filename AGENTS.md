# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

Всегда используй superpowers и применимые скиллы caveman в этом проекте.

## Добавление работ и фотографий

Перед добавлением или заменой работы прочитай [docs/adding-works.md](docs/adding-works.md). Это обязательный порядок работы для агентов.

- Сначала сопоставь фотографии с работами и проверь подписи. Не придумывай год, материалы, размеры или принадлежность к серии.
- Готовь сжатые веб-копии фотографий **до добавления в репозиторий**. Оригиналы пользователя сохраняй отдельно и не перезаписывай.
- Предел веб-копии: 2000 px по длинной стороне, без увеличения и обрезки. Для фотографий используй JPEG/WebP с качеством 82; проверяй цвет, ориентацию и детали.
- `npm run build` дополнительно сжимает опубликованные копии через `scripts/optimize-published-images.mjs`. Этот скрипт не уменьшает файлы в `src/`.
- Добавляй карточки в `src/content/<category>/`, фотографии — в `src/assets/images/<category>/`; в YAML указывай `/assets/images/<category>/...`.
- Учитывай `src/_data/work-order.json`, автоматические серии и настройки обложек. Сохраняй порядок существующих работ.
- Перед завершением выполни `npm run check`, проверь новые страницы и изображения. В отчёте укажи размеры и вес фотографий до/после.

## Commands

- **Dev server**: `npm run dev` — runs Sass watcher + Eleventy dev server at http://localhost:8080
- **Build**: `npm run build` — compiles Sass, builds Eleventy to `_site/`, optimizes published images, prepares `dist/` for Sites
- **Check**: `npm run check` — lint + full build
- **Deploy**: push to `main` triggers `.github/workflows/deploy-yandex.yml` (Yandex Object Storage). There is no `npm run deploy`; publish only when authorized by the user's task.
- **Lint**: `npm run lint` — ESLint on `src/assets/js/`

## Architecture

**Stack**: Eleventy (11ty) static site generator + Sass + Pages CMS (`.pages.yml`). `/admin/` links to the CMS and thumbnail editor.

**Source structure**:
- `src/content/[category]/` — Markdown files with frontmatter (title, year, series, description, image, gallery, thumbnail, order)
- `src/_includes/layouts/` — Nunjucks layouts: `base.njk` wraps everything; `category.njk` for listing pages; `work.njk` for detail pages
- `src/_includes/components/` — header, footer, lightbox partials
- `src/assets/scss/` — Sass with `@use` imports; `main.scss` is the entry point; BEM methodology
- `src/assets/js/` — Vanilla JS ES6+; `main.js` includes carousel and image zoom behavior
- `src/_data/site.js` — global site data (title, language, url, etc.)

**Content categories**: `projects`, `paintings`, `drawings`, `objects` — each has:
- A listing page `src/[category].njk` with `layout: layouts/category.njk` and `categoryKey: [category]`
- A content directory `src/content/[category]/` with individual `.md` files
- A directory data file `src/content/[category]/[category].11tydata.js` that sets `layout: layouts/work.njk` and the permalink for all items automatically

**Routing in category.njk**: The listing template iterates `collections[categoryKey]` where `categoryKey` comes from the page's own frontmatter (not derived from the title). Always set `categoryKey` explicitly in listing page frontmatter. Projects uses the combined `projectIndexItems` collection.

**Eleventy collections** are defined in `.eleventy.js` via `getFilteredByGlob`. `seriesProjects` groups paintings, drawings, and objects by `series` and includes matching manual projects. `projectIndexItems` combines generated series with standalone manual projects. Listings and adjacent-work navigation follow `src/_data/work-order.json`, with fallback sorting by `order`, year and title. Preserve these rules when adding content.

**CSS compilation**: Sass compiles `src/assets/scss/main.scss` → `src/assets/css/main.css`. Never edit `main.css` directly. `main.css` is gitignored.

**Rules**: No Bootstrap/Tailwind/CDN dependencies. BEM CSS. Conventional Commits.
