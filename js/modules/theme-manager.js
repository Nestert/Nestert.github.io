/**
 * Theme Manager
 * Управление светлой/темной темой
 */

export default class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.toggleButton = null;
    this.storageKey = 'omanovar-theme';
    
    this.init();
  }

  init() {
    this.detectSystemTheme();
    this.loadSavedTheme();
    this.createToggleButton();
    this.bindEvents();
    this.applyTheme();
    this.injectThemeStyles();
  }

  /**
   * Определение системной темы
   */
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.currentTheme = 'dark';
    }
  }

  /**
   * Загрузка сохраненной темы
   */
  loadSavedTheme() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    }
  }

  /**
   * Создание кнопки переключения темы
   */
  createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Переключить тему');
    this.toggleButton.setAttribute('title', 'Переключить тему');
    
    this.updateButtonContent();
    
    // Добавляем кнопку в навигацию
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.appendChild(this.toggleButton);
    }
  }

  /**
   * Обновление содержимого кнопки
   */
  updateButtonContent() {
    const sunIcon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
    `;

    const moonIcon = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;

    this.toggleButton.innerHTML = this.currentTheme === 'dark' ? sunIcon : moonIcon;
  }

  /**
   * Привязка событий
   */
  bindEvents() {
    // Клик по кнопке переключения
    this.toggleButton.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Слушатель изменения системной темы
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Применяем системную тему только если пользователь не выбрал явно
        if (!localStorage.getItem(this.storageKey)) {
          this.currentTheme = e.matches ? 'dark' : 'light';
          this.applyTheme();
          this.updateButtonContent();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + T
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
  }

  /**
   * Переключение темы
   */
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.saveTheme();
    this.updateButtonContent();
    
    // Анимация переключения
    this.animateThemeChange();
  }

  /**
   * Применение темы
   */
  applyTheme() {
    const root = document.documentElement;
    
    if (this.currentTheme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    // Обновляем мета-тег для браузера
    this.updateThemeColorMeta();
  }

  /**
   * Сохранение темы
   */
  saveTheme() {
    localStorage.setItem(this.storageKey, this.currentTheme);
  }

  /**
   * Анимация переключения темы
   */
  animateThemeChange() {
    this.toggleButton.style.transform = 'rotate(360deg)';
    
    setTimeout(() => {
      this.toggleButton.style.transform = '';
    }, 300);
  }

  /**
   * Обновление meta theme-color
   */
  updateThemeColorMeta() {
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      document.head.appendChild(themeColorMeta);
    }

    const themeColor = this.currentTheme === 'dark' ? '#1a1a1a' : '#ffffff';
    themeColorMeta.content = themeColor;
  }

  /**
   * Добавление CSS стилей для темной темы
   */
  injectThemeStyles() {
    if (document.querySelector('#theme-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'theme-styles';
    styles.textContent = `
      :root {
        /* Светлая тема (по умолчанию) */
        --color-background: #ffffff;
        --color-surface: #f8f9fa;
        --color-primary: #333333;
        --color-secondary: #666666;
        --color-border: #e0e0e0;
        --color-accent: #666;
        
        /* Переходы для смены темы */
        transition: background-color 0.3s ease, color 0.3s ease;
      }

      /* Темная тема */
      .dark-theme {
        --color-background: #1a1a1a;
        --color-surface: #2d2d2d;
        --color-primary: #e0e0e0;
        --color-secondary: #b0b0b0;
        --color-border: #404040;
        --color-accent: #888;
      }

      /* Плавные переходы для элементов */
      body,
      .header,
      .nav,
      .gallery__item,
      .gallery__info,
      .lightbox,
      .filter-container,
      .exhibitions,
      .contact,
      .contact-form {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
      }

      /* Кнопка переключения темы */
      .theme-toggle {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        color: var(--color-primary);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .theme-toggle:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        border-color: var(--color-primary);
      }

      .theme-toggle svg {
        transition: transform 0.3s ease;
      }

      /* Темная тема для изображений */
      .dark-theme .gallery__image {
        filter: brightness(0.9);
      }

      .dark-theme .gallery__item:hover .gallery__image {
        filter: brightness(1);
      }

      /* Темная тема для лайтбокса */
      .dark-theme .lightbox {
        background-color: rgb(0 0 0 / 95%);
      }

      /* Темная тема для форм */
      .dark-theme .contact-form__input,
      .dark-theme .contact-form__textarea {
        background: var(--color-surface);
        color: var(--color-primary);
      }

      .dark-theme .contact-form__input:focus,
      .dark-theme .contact-form__textarea:focus {
        border-color: var(--color-accent);
        box-shadow: 0 0 0 3px rgba(136, 136, 136, 0.2);
      }

      /* Адаптивность для мобильных */
      @media (max-width: 768px) {
        .theme-toggle {
          top: 15px;
          right: 15px;
          width: 40px;
          height: 40px;
        }
      }

      /* Анимация для системной темы */
      @media (prefers-reduced-motion: no-preference) {
        .theme-toggle {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
      }

      /* Скрытие кнопки при печати */
      @media print {
        .theme-toggle {
          display: none;
        }
      }

      /* Кастомные scroll bars для темной темы */
      .dark-theme::-webkit-scrollbar {
        width: 8px;
      }

      .dark-theme::-webkit-scrollbar-track {
        background: var(--color-surface);
      }

      .dark-theme::-webkit-scrollbar-thumb {
        background: var(--color-border);
        border-radius: 4px;
      }

      .dark-theme::-webkit-scrollbar-thumb:hover {
        background: var(--color-accent);
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Получение текущей темы
   */
  getCurrentTheme() {
    return this.currentTheme;
  }

  /**
   * Установка конкретной темы
   */
  setTheme(theme) {
    if (['light', 'dark'].includes(theme)) {
      this.currentTheme = theme;
      this.applyTheme();
      this.saveTheme();
      this.updateButtonContent();
    }
  }

  /**
   * Автоматическое переключение по времени (опционально)
   */
  enableAutoSwitch() {
    const checkTime = () => {
      const hour = new Date().getHours();
      const shouldBeDark = hour >= 20 || hour <= 7;
      const newTheme = shouldBeDark ? 'dark' : 'light';
      
      if (newTheme !== this.currentTheme) {
        this.setTheme(newTheme);
      }
    };

    // Проверяем каждый час
    setInterval(checkTime, 60 * 60 * 1000);
    checkTime(); // Сразу проверяем
  }
} 