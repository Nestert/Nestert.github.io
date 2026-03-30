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
- `src/_includes/layouts/` — Nunjucks layouts: `base.njk` wraps everything; `gallery.njk`, `category.njk`, `work.njk` for content pages
- `src/_includes/components/` — header, footer, lightbox partials
- `src/assets/scss/` — Sass with `@use` imports; `main.scss` is the entry point; BEM methodology
- `src/assets/js/` — Vanilla JS ES6+; `main.js` and `lightbox.js` loaded on every page
- `src/_data/site.json` — global site data (title, language, etc.)

**Content categories**: `projects`, `paintings`, `drawings` — each has a corresponding `.njk` listing page and `content/[category]/` directory.

**CSS compilation**: Sass compiles `src/assets/scss/main.scss` → `src/assets/css/main.css`. Never edit `main.css` directly.

**Rules**: No Bootstrap/Tailwind/CDN dependencies. BEM CSS. Conventional Commits.
