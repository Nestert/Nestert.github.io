# Artist Portfolio Website

Minimalist portfolio website for artists, built with 11ty and Decap CMS.

## Features

- Minimalist design inspired by alinabrovina.com
- Categories: Projects, Paintings, Drawings
- Lightbox gallery with keyboard navigation and touch swipe
- Mobile-responsive
- Admin panel for self-managed content
- GitHub Pages deployment

## Quick Start

### Development

```bash
npm install
npm run dev
```

Site will be available at `http://localhost:8080`

### Build

```bash
npm run build
```

Output is in `_site/` directory.

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Adding Content

### Manual (Markdown files)

Create `.md` files in `src/content/[category]/`:

```yaml
---
title: "Work Title"
year: 2024
description: "Description in Russian"
description_en: "Description in English"
image: "/assets/images/category/image.jpg"
thumbnail: "/assets/images/category/image-thumb.jpg"
order: 1
---
```

### Via Admin Panel

1. Go to `/admin/`
2. Authorize via GitHub
3. Create new works with image upload

## Project Structure

```
src/
├── _data/           # Global data
├── _includes/       # Templates & components
│   ├── layouts/     # Page layouts
│   └── components/  # Reusable components
├── admin/           # Decap CMS config
├── assets/
│   ├── css/         # Compiled styles
│   ├── js/          # JavaScript
│   └── scss/        # Source styles
├── content/         # Content files by category
│   ├── projects/
│   ├── paintings/
│   └── drawings/
└── index.njk        # Home page
```

## Adding New Categories

1. Create folder in `src/content/[category-name]/`
2. Add to `src/_includes/components/header.njk`
3. Create page `src/[category-name].njk`

## Tech Stack

- [Eleventy](https://www.11ty.dev/) - Static site generator
- [Decap CMS](https://decapcms.org/) - Git-based CMS
- Sass - CSS preprocessor
- GitHub Actions - CI/CD
