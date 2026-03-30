# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server**: `npm run dev` — runs Sass watcher + Eleventy dev server at http://localhost:8080
- **Build**: `npm run build` — compiles Sass then builds Eleventy static site to `_site/`
- **Deploy**: `npm run deploy` — publishes `_site/` to GitHub Pages via gh-pages
- **Lint**: `npm run lint` — ESLint on `src/js/`

## Architecture

**Stack**: Eleventy (11ty) static site generator + Sass + Decap CMS (admin panel at `/admin/`)

**Source structure**:
- `src/content/[category]/` — Markdown files with frontmatter (title, year, description, description_en, image, thumbnail, order)
- `src/_includes/layouts/` — Nunjucks layouts: `base.njk` wraps everything; `category.njk` for listing pages; `work.njk` for detail pages
- `src/_includes/components/` — header, footer, lightbox partials
- `src/assets/scss/` — Sass with `@use` imports; `main.scss` is the entry point; BEM methodology
- `src/assets/js/` — Vanilla JS ES6+; `main.js` and `lightbox.js` loaded on every page
- `src/_data/site.json` — global site data (title, language, url, etc.)

**Content categories**: `projects`, `paintings`, `drawings` — each has:
- A listing page `src/[category].njk` with `layout: layouts/category.njk` and `categoryKey: [category]`
- A content directory `src/content/[category]/` with individual `.md` files
- A directory data file `src/content/[category]/[category].json` that sets `layout: layouts/work.njk` for all items automatically

**Routing in category.njk**: The listing template iterates `collections[categoryKey]` where `categoryKey` comes from the page's own frontmatter (not derived from the title). Always set `categoryKey` explicitly in listing page frontmatter.

**Eleventy collections** are defined in `.eleventy.js` via `getFilteredByGlob`. Custom filters available: `getCategoryItems(collection, category)` and `sortByOrder(items)`.

**CSS compilation**: Sass compiles `src/assets/scss/main.scss` → `src/assets/css/main.css`. Never edit `main.css` directly. `main.css` is gitignored.

**Rules**: No Bootstrap/Tailwind/CDN dependencies. BEM CSS. Conventional Commits.
