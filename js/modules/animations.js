/**
 * Animations Manager
 * Управление анимациями и UX эффектами
 */

export default class AnimationsManager {
  constructor() {
    this.observers = [];
    this.animatedElements = new Set();
    this.isReducedMotion = false;
    
    this.init();
  }

  init() {
    this.checkReducedMotion();
    this.injectAnimationStyles();
    
    if (!this.isReducedMotion) {
      this.setupScrollAnimations();
      this.setupHoverEffects();
      this.setupLoadingAnimations();
      this.setupSmoothScrolling();
    }
  }

  /**
   * Проверка настроек пользователя для анимаций
   */
  checkReducedMotion() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Слушаем изменения настроек
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.isReducedMotion = e.matches;
      if (this.isReducedMotion) {
        this.disableAnimations();
      } else {
        this.enableAnimations();
      }
    });
  }

  /**
   * Настройка анимаций при скролле
   */
  setupScrollAnimations() {
    // Intersection Observer для анимаций появления
    const fadeInObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          this.animateElement(entry.target, 'fade-in');
          this.animatedElements.add(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Анимация элементов галереи
    const galleryObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
          // Задержка для последовательного появления
          setTimeout(() => {
            this.animateElement(entry.target, 'slide-up');
            this.animatedElements.add(entry.target);
          }, index * 100);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    // Применяем наблюдателей
    document.querySelectorAll('.section__header, .exhibitions__item').forEach(el => {
      fadeInObserver.observe(el);
    });

    document.querySelectorAll('.gallery__item').forEach(el => {
      galleryObserver.observe(el);
    });

    this.observers.push(fadeInObserver, galleryObserver);
  }

  /**
   * Анимация элемента
   */
  animateElement(element, animationType) {
    element.classList.add('animate', `animate--${animationType}`);
    
    // Удаляем класс анимации после завершения
    element.addEventListener('animationend', () => {
      element.classList.remove('animate', `animate--${animationType}`);
      element.classList.add('animated');
    }, { once: true });
  }

  /**
   * Настройка hover эффектов
   */
  setupHoverEffects() {
    // Эффект параллакса для изображений
    document.querySelectorAll('.gallery__item').forEach(item => {
      const image = item.querySelector('.gallery__image');
      
      item.addEventListener('mouseenter', () => {
        if (!this.isReducedMotion) {
          image.style.transform = 'scale(1.05)';
        }
      });

      item.addEventListener('mouseleave', () => {
        image.style.transform = 'scale(1)';
      });

      // Эффект наклона при движении мыши (упрощенный)
      item.addEventListener('mousemove', (e) => {
        if (this.isReducedMotion) return;

        const rect = item.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / centerY * -2;
        const rotateY = (x - centerX) / centerX * 2;
        
        item.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        item.style.willChange = 'transform';
      });

      item.addEventListener('mouseleave', () => {
        item.style.transform = '';
        item.style.willChange = 'auto';
      });
    });

    // Анимированные кнопки
    document.querySelectorAll('button, .filter__button').forEach(button => {
      button.addEventListener('click', (e) => {
        if (this.isReducedMotion) return;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });
    });
  }

  /**
   * Анимации загрузки
   */
  setupLoadingAnimations() {
    // Анимация загрузки изображений
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.classList.add('loading');
          
          const newImg = new Image();
          newImg.onload = () => {
            img.src = newImg.src;
            img.classList.remove('loading');
            img.classList.add('loaded');
          };
          
          newImg.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px'
    });

    document.querySelectorAll('.gallery__image').forEach(img => {
      imageObserver.observe(img);
    });

    this.observers.push(imageObserver);
  }

  /**
   * Плавная прокрутка
   */
  setupSmoothScrolling() {
    // Прокрутка к секциям
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          this.smoothScrollTo(target);
        }
      });
    });

    // Прокрутка к началу при двойном клике по header
    const header = document.querySelector('.header');
    if (header) {
      header.addEventListener('dblclick', () => {
        this.smoothScrollTo(document.body);
      });
    }
  }

  /**
   * Плавная прокрутка к элементу
   */
  smoothScrollTo(element, offset = 80) {
    const elementPosition = element.offsetTop - offset;
    
    if (!this.isReducedMotion) {
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, elementPosition);
    }
  }

  /**
   * Добавление CSS стилей для анимаций
   */
  injectAnimationStyles() {
    if (document.querySelector('#animation-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'animation-styles';
    styles.textContent = `
      /* Базовые анимации */
      .animate {
        animation-duration: 0.6s;
        animation-fill-mode: both;
        animation-timing-function: ease-out;
      }

      .animate--fade-in {
        animation-name: fadeIn;
      }

      .animate--slide-up {
        animation-name: slideUp;
      }

      .animate--slide-down {
        animation-name: slideDown;
      }

      .animate--scale-in {
        animation-name: scaleIn;
      }

      /* Keyframes */
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes scaleIn {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      /* Эффект волны для кнопок */
      .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
      }

      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }

      /* Состояния загрузки изображений */
      .gallery__image.loading {
        opacity: 0.3;
        filter: blur(2px);
        transition: all 0.3s ease;
      }

      .gallery__image.loaded {
        opacity: 1;
        filter: blur(0);
      }

      /* Hover эффекты */
      .gallery__item {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        transform-origin: center;
      }

      .gallery__image {
        transition: transform 0.3s ease;
      }

      /* Анимация появления секций */
      .section__header {
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.6s ease;
      }

      .section__header.animated {
        opacity: 1;
        transform: translateY(0);
      }

      /* Анимация элементов галереи */
      .gallery__item {
        opacity: 0;
        transform: translateY(40px);
        transition: all 0.6s ease;
      }

      .gallery__item.animated {
        opacity: 1;
        transform: translateY(0);
      }

      /* Анимация выставок */
      .exhibitions__item {
        opacity: 0;
        transform: translateX(-20px);
        transition: all 0.6s ease;
      }

      .exhibitions__item.animated {
        opacity: 1;
        transform: translateX(0);
      }

      /* Стили для пользователей с ограниченной анимацией */
      @media (prefers-reduced-motion: reduce) {
        .animate,
        .gallery__item,
        .section__header,
        .exhibitions__item {
          animation: none !important;
          transition: none !important;
          transform: none !important;
          opacity: 1 !important;
        }

        .ripple-effect {
          display: none;
        }
      }

      /* Анимация прокрутки */
      html {
        scroll-behavior: smooth;
      }

      @media (prefers-reduced-motion: reduce) {
        html {
          scroll-behavior: auto;
        }
      }

      /* Эффект параллакса для hero секции */
      .hero {
        transform: translateY(0);
        transition: transform 0.1s ease-out;
      }

      /* Анимация навигации */
      .nav__menu-link {
        position: relative;
        transition: color 0.3s ease;
      }

      .nav__menu-link::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 0;
        height: 2px;
        background: var(--color-primary);
        transition: width 0.3s ease;
      }

      .nav__menu-link:hover::after,
      .nav__menu-link.active::after {
        width: 100%;
      }

      /* Анимация фильтров */
      .filter__button {
        transform: scale(1);
        transition: all 0.2s ease;
      }

      .filter__button:hover {
        transform: scale(1.05);
      }

      .filter__button:active {
        transform: scale(0.95);
      }

      /* Анимация счетчика в lightbox */
      .lightbox__counter {
        animation: fadeIn 0.3s ease 0.5s both;
      }

      /* Стили для анимации загрузки страницы */
      .page-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--color-background);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }

      .page-loader.hidden {
        opacity: 0;
        pointer-events: none;
      }

      .loader-spinner {
        width: 50px;
        height: 50px;
        border: 3px solid var(--color-border);
        border-top: 3px solid var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Добавление анимации параллакса для hero секции
   */
  setupParallaxEffect() {
    if (this.isReducedMotion) return;

    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      
      hero.style.transform = `translateY(${rate}px)`;
    });
  }

  /**
   * Отключение анимаций
   */
  disableAnimations() {
    document.documentElement.style.setProperty('--animation-duration', '0s');
    document.documentElement.style.setProperty('--transition-duration', '0s');
  }

  /**
   * Включение анимаций
   */
  enableAnimations() {
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.style.removeProperty('--transition-duration');
  }

  /**
   * Очистка observers при уничтожении
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.animatedElements.clear();
  }

  /**
   * Анимация появления нового контента
   */
  animateNewContent(element) {
    if (this.isReducedMotion) return;

    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    // Плавное появление
    requestAnimationFrame(() => {
      element.style.transition = 'all 0.6s ease';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }
} 