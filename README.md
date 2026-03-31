# Artist Portfolio Website

Портфолио художницы на Eleventy, Sass и Decap CMS. Основной production-поток рассчитан на Netlify: сборка статики, Git Gateway и Netlify Identity для `/admin/`.

## Команды

```bash
npm install
npm run dev
npm run lint
npm run build
npm run check
```

- `npm run dev` запускает Sass watcher и локальный Eleventy server на `http://localhost:8080`
- `npm run lint` проверяет `src/assets/js/**/*.js`
- `npm run build` собирает CSS и сайт в `_site/`
- `npm run check` запускает обязательную проверку `lint + build`

## Деплой

- Netlify должен использовать команду `npm run check`
- publish directory: `_site`
- Node version: `20`
- Для Decap CMS нужен Netlify Identity + Git Gateway

`site.url` берется из `SITE_URL`, `URL`, `DEPLOY_PRIME_URL` или `DEPLOY_URL`. Локально используется `http://localhost:8080`.

## Контент

Работы хранятся в `src/content/[category]/` и автоматически публикуются по URL:

- `/projects/[slug]/`
- `/paintings/[slug]/`
- `/drawings/[slug]/`

Минимальный frontmatter:

```yaml
---
title: "Название работы"
year: 2024
description: "Основное описание для страницы работы и SEO"
description_en: "Optional English description"
image: "/assets/images/category/image.jpg"
thumbnail: "/assets/images/category/image-thumb.jpg"
order: 1
---
```

- `description` выводится на странице работы даже если markdown-body пустой
- markdown-body используется как дополнительный длинный текст
- `description_en` сохраняется в данных, но пока не рендерится

## CMS

Панель доступна по `/admin/`.

- `description` используется как основное описание
- `body` в CMS доступен как необязательный markdown-блок для длинного текста
- изображения загружаются в `src/assets/images/[category]/`

## Стек

- [Eleventy](https://www.11ty.dev/)
- [@11ty/eleventy-img](https://www.11ty.dev/docs/plugins/image/)
- [Decap CMS](https://decapcms.org/)
- Sass
- Netlify
