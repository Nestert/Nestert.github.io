/**
 * Main Application File
 * Initializes all modules and handles global functionality
 */

import Navigation from './modules/navigation.js';
import Gallery from './modules/gallery.js';
import Lightbox from './modules/lightbox.js';
import ImageOptimization from './modules/image-optimization.js';
import SEOEnhancement from './modules/seo-enhancement.js';
import { ServiceWorkerManager } from './modules/service-worker.js';
import ContactForm from './modules/contact-form.js';
import ThemeManager from './modules/theme-manager.js';
import AnimationsManager from './modules/animations.js';

class App {
  constructor() {
    this.navigation = null;
    this.gallery = null;
    this.lightbox = null;
    this.imageOptimization = null;
    this.seoEnhancement = null;
    this.serviceWorker = null;
    this.contactForm = null;
    this.themeManager = null;
    this.animationsManager = null;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    try {
      // Initialize modules
      this.navigation = new Navigation();
      this.gallery = new Gallery();
      this.lightbox = new Lightbox();
      this.imageOptimization = new ImageOptimization();
      this.seoEnhancement = new SEOEnhancement();
      
      // Initialize Service Worker
      this.serviceWorker = new ServiceWorkerManager();
      window.swManager = this.serviceWorker;
      
      // Initialize Contact Form
      this.contactForm = new ContactForm();
      
      // Initialize Theme Manager
      this.themeManager = new ThemeManager();
      
      // Initialize Animations Manager
      this.animationsManager = new AnimationsManager();
      
      // Setup performance optimizations
      this.setupIntersectionObserver();
      
      // Setup error handling
      this.setupErrorHandling();
      
      console.log('Omanovar Portfolio initialized successfully');
    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.handleInitializationError(error);
    }
  }

  setupImageLazyLoading() {
    // Enhanced lazy loading for images
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Create a new image to preload
          const newImg = new Image();
          newImg.onload = () => {
            img.src = img.dataset.src || img.src;
            img.classList.remove('loading');
            img.classList.add('loaded');
          };
          
          newImg.onerror = () => {
            img.classList.add('error');
            img.alt = 'Изображение не удалось загрузить';
          };
          
          // Start loading
          newImg.src = img.dataset.src || img.src;
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.1
    });

    // Observe all gallery images
    document.querySelectorAll('.gallery__image').forEach(img => {
      img.classList.add('loading');
      imageObserver.observe(img);
    });
  }

  setupIntersectionObserver() {
    // Animate elements when they come into view
    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe gallery items and sections
    document.querySelectorAll('.gallery__item, .section, .exhibitions__year').forEach(el => {
      animationObserver.observe(el);
    });
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.logError('JavaScript Error', event.error.message, event.error.stack);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.logError('Promise Rejection', event.reason);
    });

    // Image loading error handler
    document.addEventListener('error', (event) => {
      if (event.target.tagName === 'IMG') {
        console.warn('Image failed to load:', event.target.src);
        event.target.classList.add('image-error');
        event.target.alt = 'Изображение не удалось загрузить';
      }
    }, true);
  }

  logError(type, message, stack = '') {
    // In a real application, this would send errors to a logging service
    const errorData = {
      type,
      message,
      stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // For now, just log to console
    console.error('Error logged:', errorData);
    
    // Could implement analytics tracking here
    // gtag('event', 'exception', {
    //   description: message,
    //   fatal: false
    // });
  }

  handleInitializationError(error) {
    // Fallback functionality if modules fail to initialize
    console.error('Application initialization failed, enabling fallback mode');
    
    // Basic navigation fallback
    const hamburger = document.querySelector('.nav__toggle');
    const navMenu = document.querySelector('.nav__menu');
    
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });
    }

    // Basic smooth scrolling fallback
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Public methods for external access
  getNavigation() {
    return this.navigation;
  }

  getGallery() {
    return this.gallery;
  }

  getLightbox() {
    return this.lightbox;
  }

  // Method to refresh gallery (useful for dynamic content)
  refreshGallery() {
    if (this.gallery) {
      this.gallery.updateVisibleItems();
    }
  }
}

// Initialize the application
const app = new App();

// Make app instance available globally for debugging
window.OmanovarApp = app;

export default App; 