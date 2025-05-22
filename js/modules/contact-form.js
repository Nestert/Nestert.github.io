/**
 * Contact Form Manager
 * Управление формой обратной связи с валидацией
 */

export default class ContactForm {
  constructor() {
    this.form = null;
    this.isSubmitting = false;
    this.init();
  }

  init() {
    this.form = document.querySelector('.contact-form');
    if (!this.form) return;

    this.bindEvents();
    this.setupValidation();
  }

  bindEvents() {
    this.form.addEventListener('submit', this.handleSubmit.bind(this));
    
    // Валидация в реальном времени
    const inputs = this.form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  setupValidation() {
    // Добавляем стили для валидации
    this.injectValidationStyles();
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (this.isSubmitting) return;
    
    const formData = new FormData(this.form);
    const data = Object.fromEntries(formData);
    
    // Валидация всех полей
    if (!this.validateForm(data)) {
      this.showNotification('Пожалуйста, исправьте ошибки в форме', 'error');
      return;
    }

    this.isSubmitting = true;
    this.setSubmitState(true);

    try {
      // Имитация отправки формы (замените на реальный endpoint)
      await this.submitForm(data);
      
      this.showNotification('Сообщение успешно отправлено!', 'success');
      this.form.reset();
      
    } catch (error) {
      console.error('Ошибка отправки формы:', error);
      this.showNotification('Произошла ошибка при отправке. Попробуйте позже.', 'error');
    } finally {
      this.isSubmitting = false;
      this.setSubmitState(false);
    }
  }

  async submitForm(data) {
    // Симуляция отправки на сервер
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) { // 90% успешных отправок
          resolve({ success: true, message: 'Email sent' });
        } else {
          reject(new Error('Server error'));
        }
      }, 2000);
    });

    // Реальная реализация:
    // const response = await fetch('/api/contact', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data)
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Network response was not ok');
    // }
    // 
    // return response.json();
  }

  validateForm(data) {
    let isValid = true;
    
    // Валидация имени
    if (!data.name || data.name.trim().length < 2) {
      this.showFieldError('name', 'Имя должно содержать минимум 2 символа');
      isValid = false;
    }

    // Валидация email
    if (!data.email || !this.isValidEmail(data.email)) {
      this.showFieldError('email', 'Введите корректный email адрес');
      isValid = false;
    }

    // Валидация сообщения
    if (!data.message || data.message.trim().length < 10) {
      this.showFieldError('message', 'Сообщение должно содержать минимум 10 символов');
      isValid = false;
    }

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const name = field.name;

    switch (name) {
      case 'name':
        if (value.length < 2) {
          this.showFieldError(name, 'Имя должно содержать минимум 2 символа');
          return false;
        }
        break;
      
      case 'email':
        if (!this.isValidEmail(value)) {
          this.showFieldError(name, 'Введите корректный email адрес');
          return false;
        }
        break;
      
      case 'message':
        if (value.length < 10) {
          this.showFieldError(name, 'Сообщение должно содержать минимум 10 символов');
          return false;
        }
        break;
    }

    this.clearFieldError(field);
    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(fieldName, message) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);
    const errorElement = field.parentElement.querySelector('.field-error');
    
    field.classList.add('error');
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearFieldError(field) {
    const errorElement = field.parentElement.querySelector('.field-error');
    
    field.classList.remove('error');
    
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  setSubmitState(isSubmitting) {
    const submitBtn = this.form.querySelector('.contact-form__submit');
    const spinner = submitBtn.querySelector('.submit-spinner');
    const text = submitBtn.querySelector('.submit-text');

    if (isSubmitting) {
      submitBtn.disabled = true;
      submitBtn.classList.add('submitting');
      if (spinner) spinner.style.display = 'inline-block';
      if (text) text.textContent = 'Отправка...';
    } else {
      submitBtn.disabled = false;
      submitBtn.classList.remove('submitting');
      if (spinner) spinner.style.display = 'none';
      if (text) text.textContent = 'Отправить сообщение';
    }
  }

  showNotification(message, type = 'info') {
    // Удаляем предыдущие уведомления
    const existingNotifications = document.querySelectorAll('.contact-notification');
    existingNotifications.forEach(notif => notif.remove());

    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `contact-notification contact-notification--${type}`;
    notification.innerHTML = `
      <div class="contact-notification__content">
        <div class="contact-notification__icon">
          ${type === 'success' ? 
            '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/></svg>' :
            '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/></svg>'
          }
        </div>
        <span class="contact-notification__message">${message}</span>
        <button class="contact-notification__close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Автоскрытие через 5 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  injectValidationStyles() {
    if (document.querySelector('#contact-form-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'contact-form-styles';
    styles.textContent = `
      .contact-form__field {
        position: relative;
        margin-bottom: var(--spacing-lg);
      }

      .contact-form__input,
      .contact-form__textarea {
        width: 100%;
        padding: var(--spacing-md);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-family: inherit;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
        background: var(--color-background);
      }

      .contact-form__input:focus,
      .contact-form__textarea:focus {
        outline: none;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
      }

      .contact-form__input.error,
      .contact-form__textarea.error {
        border-color: #dc3545;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
      }

      .contact-form__label {
        display: block;
        margin-bottom: var(--spacing-xs);
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-primary);
      }

      .field-error {
        display: none;
        margin-top: var(--spacing-xs);
        font-size: 0.75rem;
        color: #dc3545;
      }

      .contact-form__submit {
        background: var(--color-primary);
        color: white;
        border: none;
        padding: var(--spacing-md) var(--spacing-xl);
        border-radius: var(--radius-sm);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .contact-form__submit:hover:not(:disabled) {
        background: #222;
        transform: translateY(-1px);
      }

      .contact-form__submit:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }

      .submit-spinner {
        display: none;
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .contact-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        border-radius: var(--radius-md);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
      }

      .contact-notification--success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
      }

      .contact-notification--error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
      }

      .contact-notification__content {
        padding: var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
      }

      .contact-notification__icon {
        flex-shrink: 0;
      }

      .contact-notification__message {
        flex: 1;
        font-size: 0.875rem;
      }

      .contact-notification__close {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: currentColor;
        opacity: 0.7;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .contact-notification__close:hover {
        opacity: 1;
      }

      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        .contact-notification {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }
      }
    `;

    document.head.appendChild(styles);
  }
} 