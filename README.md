# Omanovar Portfolio

Портфолио художника Екатерины Романовой — современный веб-сайт с галереей работ и информацией о выставках.

## 🏗️ Архитектура проекта

### Файловая структура

```
├── index.html              # Главная страница
├── css/                    # Стили (модульная архитектура)
│   ├── base.css           # Базовые стили и CSS переменные
│   ├── layout.css         # Компоненты макета (header, navigation, footer)
│   ├── components.css     # UI компоненты (gallery, lightbox, filters)
│   └── main.css          # Основной файл, импортирующий все модули
├── js/                    # JavaScript (модульная архитектура)
│   ├── modules/          # ES6 модули
│   │   ├── navigation.js # Навигация и мобильное меню
│   │   ├── gallery.js    # Галерея и фильтрация
│   │   └── lightbox.js   # Лайтбокс для просмотра изображений
│   └── app.js           # Основной файл приложения
├── src/                  # Ресурсы
│   └── img/             # Изображения
│       ├── gallery/     # Изображения галереи
│       ├── hero-image.jpg
│       └── logo.png
├── package.json         # Зависимости и скрипты сборки
├── .eslintrc.json      # Конфигурация ESLint
├── .stylelintrc.json   # Конфигурация Stylelint
└── README.md           # Документация
```

## 🚀 Запуск проекта

### Локальная разработка

```bash
# Запуск локального сервера (Python)
npm run dev
# или
npm run serve
# или
npm start

# Альтернативный сервер (Node.js)
npm run dev:node

# Ручной запуск
python3 -m http.server 8000
```

### Сборка для продакшена

```bash
# Установка зависимостей
npm install

# Сборка CSS и JS
npm run build

# Только CSS
npm run build:css

# Только JavaScript
npm run build:js
```

## 🛠️ Технологии

### Frontend
- **HTML5** — семантическая разметка
- **CSS3** — современные стили с CSS Custom Properties
- **JavaScript ES6+** — модульная архитектура
- **CSS Grid & Flexbox** — адаптивная верстка

### Инструменты разработки
- **ESLint** — линтинг JavaScript
- **Stylelint** — линтинг CSS
- **Clean-CSS** — минификация CSS
- **Terser** — минификация JavaScript

## 📱 Особенности

### Адаптивность
- Полностью адаптивный дизайн
- Оптимизация для мобильных устройств
- Touch-friendly интерфейс
- Responsive изображения с object-fit: cover
- Единообразное масштабирование галереи на всех устройствах

### Производительность
- Lazy loading изображений
- Минификация CSS и JavaScript
- Оптимизированные изображения
- Intersection Observer API

### Доступность
- Семантическая HTML разметка
- ARIA атрибуты
- Keyboard navigation
- Screen reader support
- Focus management

### SEO
- Оптимизированные мета-теги для поисковых систем
- Open Graph и Twitter Card разметка для социальных сетей
- JSON-LD структурированные данные для Schema.org
- Sitemap.xml для индексации изображений галереи
- Robots.txt для управления индексацией
- Canonical URL и правильные заголовки
- Семантическая HTML разметка с микроданными

## 🎨 CSS Архитектура

### Design System
Проект использует CSS Custom Properties для создания консистентной дизайн-системы:

```css
:root {
  /* Colors */
  --color-primary: #333;
  --color-accent: #4a90e2;
  
  /* Typography */
  --font-primary: 'Arial', sans-serif;
  --font-size-xl: 1.5rem;
  
  /* Spacing */
  --spacing-md: 1rem;
  --spacing-xl: 2rem;
  
  /* Transitions */
  --transition-base: 0.3s ease;
}
```

### Методология
- **BEM** — для именования CSS классов
- **Модульная архитектура** — разделение на логические блоки
- **Mobile-first** — подход к адаптивности

## 📄 JavaScript Архитектура

### ES6 Модули
Код разделен на логические модули:

- **Navigation** — управление навигацией
- **Gallery** — галерея и фильтрация
- **Lightbox** — просмотр изображений
- **App** — основной класс приложения

### Принципы
- **Separation of Concerns** — разделение ответственности
- **Event-driven architecture** — событийная архитектура
- **Error handling** — обработка ошибок
- **Progressive enhancement** — прогрессивное улучшение

## 🔧 Команды разработки

```bash
# Разработка
npm run dev            # Запуск Python сервера (порт 8000)
npm run dev:node       # Запуск Node.js сервера (порт 8000)
npm run serve          # Alias для npm run dev
npm start              # Alias для npm run dev
npm run stop           # Остановка сервера на порту 8000
npm run restart        # Перезапуск сервера
npm run port:check     # Проверка, свободен ли порт 8000

# Линтинг
npm run lint           # Проверка всего кода
npm run lint:css       # Проверка CSS
npm run lint:js        # Проверка JavaScript

# Сборка
npm run build          # Полная сборка проекта
npm run build:css      # Сборка только CSS
npm run build:js       # Сборка только JavaScript

# Оптимизация
npm run optimize:images # Оптимизация изображений с WebP
```

## 📋 TODO

### Ближайшие улучшения
- [ ] Добавить Service Worker для кэширования
- [x] Реализовать WebP формат изображений
- [x] Добавить JSON-LD разметку
- [ ] Интегрировать аналитику
- [ ] Добавить форму обратной связи
- [ ] Реализовать темную тему

### SEO оптимизация
- [x] Генерация sitemap.xml
- [x] Robots.txt
- [x] JSON-LD структурированные данные
- [x] Оптимизированные мета-теги
- [x] Open Graph разметка
- [ ] Breadcrumbs навигация
- [ ] Дополнительные микроданные для произведений

### Производительность
- [x] Lazy loading изображений с Intersection Observer
- [x] WebP поддержка с fallback через `<picture>` элементы
- [x] CSS и JS минификация
- [x] Оптимизация изображений (экономия до 86% размера)
- [x] Оптимизированные изображения используются на сайте
- [x] Responsive масштабирование изображений с фиксированной высотой
- [ ] Critical CSS
- [ ] Resource hints (preload, prefetch)
- [ ] CDN интеграция
- [ ] Service Worker для кэширования
