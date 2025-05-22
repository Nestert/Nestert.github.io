/**
 * Service Worker Manager
 * Управление регистрацией и обновлениями Service Worker
 */

export class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.init();
  }

  /**
   * Инициализация Service Worker
   */
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker не поддерживается');
      return;
    }

    try {
      await this.register();
      this.setupUpdateListener();
      this.setupMessageListener();
    } catch (error) {
      console.error('Ошибка инициализации Service Worker:', error);
    }
  }

  /**
   * Регистрация Service Worker
   */
  async register() {
    try {
      console.log('Регистрация Service Worker...');
      
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker зарегистрирован:', this.registration.scope);

      // Проверяем обновления при каждой загрузке страницы
      this.registration.addEventListener('updatefound', () => {
        console.log('Найдено обновление Service Worker');
        this.handleUpdateFound();
      });

      // Если SW уже активен, проверяем на обновления
      if (this.registration.active) {
        this.checkForUpdates();
      }

    } catch (error) {
      console.error('Ошибка регистрации Service Worker:', error);
    }
  }

  /**
   * Обработка найденного обновления
   */
  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('Новый Service Worker установлен');
        this.updateAvailable = true;
        this.showUpdateNotification();
      }
    });
  }

  /**
   * Показать уведомление об обновлении
   */
  showUpdateNotification() {
    // Создаем стильное уведомление
    const notification = document.createElement('div');
    notification.className = 'sw-update-notification';
    notification.innerHTML = `
      <div class="sw-update-content">
        <p><strong>Доступно обновление сайта</strong></p>
        <p>Обновите страницу для получения новой версии</p>
        <div class="sw-update-actions">
          <button class="sw-update-btn sw-update-btn--primary" onclick="window.swManager.activateUpdate()">
            Обновить
          </button>
          <button class="sw-update-btn sw-update-btn--secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Позже
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    // Добавляем стили для уведомления
    this.injectNotificationStyles();

    // Автоскрытие через 10 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Активация обновления
   */
  async activateUpdate() {
    if (!this.updateAvailable || !this.registration.waiting) {
      return;
    }

    // Отправляем сообщение новому SW для активации
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Перезагружаем страницу после активации
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  /**
   * Настройка слушателя обновлений
   */
  setupUpdateListener() {
    // Проверяем обновления каждые 5 минут
    setInterval(() => {
      this.checkForUpdates();
    }, 5 * 60 * 1000);

    // Проверяем при получении фокуса
    window.addEventListener('focus', () => {
      this.checkForUpdates();
    });
  }

  /**
   * Проверка обновлений
   */
  async checkForUpdates() {
    if (!this.registration) return;

    try {
      await this.registration.update();
      console.log('Проверка обновлений Service Worker завершена');
    } catch (error) {
      console.error('Ошибка проверки обновлений:', error);
    }
  }

  /**
   * Настройка слушателя сообщений
   */
  setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event;
      
      if (data.type === 'CACHE_UPDATED') {
        console.log('Кэш обновлен:', data.url);
      }
      
      if (data.type === 'SW_VERSION') {
        console.log('Версия Service Worker:', data.version);
      }
    });
  }

  /**
   * Добавление стилей для уведомлений
   */
  injectNotificationStyles() {
    if (document.querySelector('#sw-notification-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'sw-notification-styles';
    styles.textContent = `
      .sw-update-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 350px;
        animation: slideIn 0.3s ease;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .sw-update-content {
        padding: 16px;
      }

      .sw-update-content p {
        margin: 0 0 8px 0;
        color: #333;
        font-size: 14px;
        line-height: 1.4;
      }

      .sw-update-content p:last-of-type {
        margin-bottom: 16px;
        color: #666;
      }

      .sw-update-actions {
        display: flex;
        gap: 8px;
      }

      .sw-update-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .sw-update-btn--primary {
        background: #007bff;
        color: white;
      }

      .sw-update-btn--primary:hover {
        background: #0056b3;
      }

      .sw-update-btn--secondary {
        background: #f8f9fa;
        color: #666;
        border: 1px solid #e0e0e0;
      }

      .sw-update-btn--secondary:hover {
        background: #e9ecef;
      }

      @media (max-width: 480px) {
        .sw-update-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
        
        .sw-update-actions {
          flex-direction: column;
        }
        
        .sw-update-btn {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Получение информации о кэше
   */
  async getCacheInfo() {
    if (!('caches' in window)) return null;

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        cacheInfo[cacheName] = keys.length;
      }

      return cacheInfo;
    } catch (error) {
      console.error('Ошибка получения информации о кэше:', error);
      return null;
    }
  }

  /**
   * Очистка всех кэшей
   */
  async clearAllCaches() {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Все кэши очищены');
      
      // Перезагружаем страницу
      window.location.reload();
    } catch (error) {
      console.error('Ошибка очистки кэшей:', error);
    }
  }

  /**
   * Проверка статуса Service Worker
   */
  getStatus() {
    if (!('serviceWorker' in navigator)) {
      return 'unsupported';
    }

    if (!this.registration) {
      return 'not-registered';
    }

    if (this.registration.installing) {
      return 'installing';
    }

    if (this.registration.waiting) {
      return 'waiting';
    }

    if (this.registration.active) {
      return 'active';
    }

    return 'unknown';
  }
}

// Глобальная переменная для доступа из HTML
window.swManager = null; 