/**
 * Lightbox Module
 * Handles image lightbox functionality with navigation and accessibility
 */

class Lightbox {
  constructor() {
    this.lightbox = document.getElementById('lightbox');
    this.lightboxImg = document.querySelector('.lightbox__image');
    this.caption = document.querySelector('.lightbox__caption');
    this.details = document.querySelector('.lightbox__details');
    this.counter = document.querySelector('.lightbox__counter');
    this.closeBtn = document.querySelector('.lightbox__close');
    this.prevBtn = document.querySelector('.lightbox__nav--prev');
    this.nextBtn = document.querySelector('.lightbox__nav--next');
    
    this.currentIndex = 0;
    this.visibleItems = [];
    this.isOpen = false;
    this.focusableElements = [];
    this.lastFocusedElement = null;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupKeyboardNavigation();
  }

  bindEvents() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Navigation buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.showPrevious());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.showNext());
    }

    // Close on background click
    if (this.lightbox) {
      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) {
          this.close();
        }
      });
    }

    // Listen for gallery open events
    document.addEventListener('gallery:openLightbox', (e) => {
      this.open(e.detail.item, e.detail.visibleItems);
    });

    // Handle swipe gestures on touch devices
    this.setupTouchEvents();
  }

  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;

      switch (e.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.showPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.showNext();
        break;
      case 'Tab':
        this.handleTabNavigation(e);
        break;
      default:
        // No action needed for other keys
        break;
      }
    });
  }

  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    if (this.lightbox) {
      this.lightbox.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
        startY = e.changedTouches[0].screenY;
      }, { passive: true });

      this.lightbox.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].screenX;
        endY = e.changedTouches[0].screenY;
        this.handleSwipe(startX, startY, endX, endY);
      }, { passive: true });
    }
  }

  handleSwipe(startX, startY, endX, endY) {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        this.showPrevious(); // Swipe right
      } else {
        this.showNext(); // Swipe left
      }
    }
  }

  open(item, visibleItems) {
    this.lastFocusedElement = document.activeElement;
    this.visibleItems = visibleItems;
    this.currentIndex = visibleItems.indexOf(item);
    
    this.displayImage(item);
    this.show();
    this.updateNavigation();
    this.trapFocus();
  }

  displayImage(item) {
    const img = item.querySelector('.gallery__image');
    const title = item.querySelector('.gallery__title')?.textContent || '';
    const detailsText = item.querySelector('.gallery__details')?.textContent || '';
    
    if (this.lightboxImg) {
      this.lightboxImg.src = img.src;
      this.lightboxImg.alt = img.alt;
      
      // Handle image load errors
      this.lightboxImg.onerror = () => {
        console.error('Failed to load image:', img.src);
        this.lightboxImg.alt = 'Изображение не удалось загрузить';
      };
    }
    
    if (this.caption) {
      this.caption.textContent = title;
    }
    
    if (this.details) {
      this.details.textContent = detailsText;
    }
    
    if (this.counter) {
      this.counter.textContent = `${this.currentIndex + 1} / ${this.visibleItems.length}`;
    }
  }

  show() {
    if (this.lightbox) {
      this.lightbox.style.display = 'flex';
      this.lightbox.setAttribute('aria-hidden', 'false');
      this.isOpen = true;
      document.body.style.overflow = 'hidden';
      
      // Focus the lightbox for screen readers
      this.lightbox.focus();
    }
  }

  close() {
    if (this.lightbox) {
      this.lightbox.style.display = 'none';
      this.lightbox.setAttribute('aria-hidden', 'true');
      this.isOpen = false;
      document.body.style.overflow = '';
      
      // Return focus to the last focused element
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
    }
  }

  showPrevious() {
    if (this.visibleItems.length <= 1) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.visibleItems.length) % this.visibleItems.length;
    const prevItem = this.visibleItems[this.currentIndex];
    
    if (prevItem) {
      this.displayImage(prevItem);
      this.updateNavigation();
    }
  }

  showNext() {
    if (this.visibleItems.length <= 1) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.visibleItems.length;
    const nextItem = this.visibleItems[this.currentIndex];
    
    if (nextItem) {
      this.displayImage(nextItem);
      this.updateNavigation();
    }
  }

  updateNavigation() {
    const hasMultipleImages = this.visibleItems.length > 1;
    
    if (this.prevBtn) {
      this.prevBtn.style.display = hasMultipleImages ? 'block' : 'none';
      this.prevBtn.setAttribute('aria-label', 
        `Предыдущее изображение (${this.currentIndex} из ${this.visibleItems.length})`
      );
    }
    
    if (this.nextBtn) {
      this.nextBtn.style.display = hasMultipleImages ? 'block' : 'none';
      this.nextBtn.setAttribute('aria-label', 
        `Следующее изображение (${this.currentIndex + 2} из ${this.visibleItems.length})`
      );
    }
  }

  trapFocus() {
    this.focusableElements = this.lightbox.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
  }

  handleTabNavigation(e) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  // Public method to get current state
  getCurrentIndex() {
    return this.currentIndex;
  }

  // Public method to check if lightbox is open
  isLightboxOpen() {
    return this.isOpen;
  }
}

export default Lightbox; 