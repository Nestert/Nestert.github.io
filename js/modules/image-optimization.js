/**
 * Image Optimization Module
 * Handles WebP support detection, lazy loading, and progressive image enhancement
 */

class ImageOptimization {
  constructor() {
    this.supportsWebP = false;
    this.imageObserver = null;
    this.init();
  }

  async init() {
    await this.detectWebPSupport();
    this.setupLazyLoading();
    this.setupProgressiveEnhancement();
  }

  /**
   * Detect WebP support
   */
  async detectWebPSupport() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        this.supportsWebP = webP.height === 2;
        document.documentElement.classList.toggle('webp', this.supportsWebP);
        document.documentElement.classList.toggle('no-webp', !this.supportsWebP);
        resolve(this.supportsWebP);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }

  /**
   * Setup enhanced lazy loading with intersection observer
   */
  setupLazyLoading() {
    // Only proceed if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      this.fallbackLazyLoading();
      return;
    }

    const options = {
      rootMargin: '50px 0px',
      threshold: 0.1
    };

    this.imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          this.imageObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      this.imageObserver.observe(img);
    });

    // Observe all pictures with lazy loading
    document.querySelectorAll('picture').forEach(picture => {
      const img = picture.querySelector('img');
      if (img && img.hasAttribute('data-src')) {
        this.imageObserver.observe(picture);
      }
    });
  }

  /**
   * Load image with error handling
   */
  loadImage(element) {
    const isImage = element.tagName === 'IMG';
    const img = isImage ? element : element.querySelector('img');
    
    if (!img) return;

    // Add loading class
    img.classList.add('loading');
    element.classList.add('loading');

    // Handle picture elements with WebP
    if (!isImage && element.tagName === 'PICTURE') {
      this.loadPictureElement(element);
    } else {
      this.loadSingleImage(img);
    }
  }

  /**
   * Load picture element with source selection
   */
  loadPictureElement(picture) {
    const sources = picture.querySelectorAll('source');
    const img = picture.querySelector('img');
    
    if (!img) return;

    // Select appropriate source based on WebP support
    let selectedSource = null;
    
    for (const source of sources) {
      const type = source.getAttribute('type');
      if (type === 'image/webp' && this.supportsWebP) {
        selectedSource = source;
        break;
      } else if (!type || type !== 'image/webp') {
        selectedSource = source;
      }
    }

    // Use data-src if available, otherwise src
    const srcset = selectedSource ? 
      (selectedSource.getAttribute('data-srcset') || selectedSource.getAttribute('srcset')) :
      (img.getAttribute('data-src') || img.getAttribute('src'));

    if (srcset) {
      img.src = srcset.split(',')[0].trim().split(' ')[0]; // Get first URL from srcset
    }

    this.handleImageLoad(img, picture);
  }

  /**
   * Load single image
   */
  loadSingleImage(img) {
    const src = img.getAttribute('data-src') || img.getAttribute('src');
    
    if (src) {
      img.src = src;
    }

    this.handleImageLoad(img);
  }

  /**
   * Handle image load events
   */
  handleImageLoad(img, container = null) {
    const handleLoad = () => {
      img.classList.remove('loading');
      img.classList.add('loaded');
      
      if (container) {
        container.classList.remove('loading');
        container.classList.add('loaded');
      }

      // Remove data-src after successful load
      img.removeAttribute('data-src');
      
      // Trigger custom event
      img.dispatchEvent(new CustomEvent('imageLoaded', {
        bubbles: true,
        detail: { img, container }
      }));
    };

    const handleError = () => {
      img.classList.remove('loading');
      img.classList.add('error');
      
      if (container) {
        container.classList.remove('loading');
        container.classList.add('error');
      }

      // Set fallback alt text
      img.alt = img.alt || 'Изображение не удалось загрузить';
      
      console.warn('Failed to load image:', img.src);
    };

    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });
  }

  /**
   * Fallback lazy loading for older browsers
   */
  fallbackLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const loadImagesInViewport = () => {
      images.forEach(img => {
        if (this.isInViewport(img)) {
          this.loadSingleImage(img);
        }
      });
    };

    // Load immediately and on scroll
    loadImagesInViewport();
    window.addEventListener('scroll', this.throttle(loadImagesInViewport, 200));
    window.addEventListener('resize', this.throttle(loadImagesInViewport, 200));
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Throttle function
   */
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Progressive enhancement for existing images
   */
  setupProgressiveEnhancement() {
    // Convert existing img elements to use optimized versions if available
    document.querySelectorAll('img[src*="src/img/"]').forEach(img => {
      const src = img.getAttribute('src');
      const optimizedSrc = this.getOptimizedImagePath(src);
      
      if (optimizedSrc !== src) {
        // Create a new image to test if optimized version exists
        const testImg = new Image();
        testImg.onload = () => {
          img.src = optimizedSrc;
        };
        testImg.src = optimizedSrc;
      }
    });
  }

  /**
   * Get optimized image path
   */
  getOptimizedImagePath(originalPath) {
    if (originalPath.includes('/optimized/')) {
      return originalPath;
    }

    // Convert to optimized path
    let optimizedPath = originalPath.replace('src/img/', 'src/img/optimized/');
    
    // Use WebP if supported
    if (this.supportsWebP) {
      optimizedPath = optimizedPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    } else {
      // Convert PNG to JPG for better compression
      optimizedPath = optimizedPath.replace(/\.png$/i, '.jpg');
    }

    return optimizedPath;
  }

  /**
   * Create picture element with WebP fallback
   */
  createPictureElement(imagePath, alt, className = '', width = '', height = '') {
    const picture = document.createElement('picture');
    
    // WebP source
    const webpSource = document.createElement('source');
    const webpPath = this.getOptimizedImagePath(imagePath).replace(/\.(jpg|jpeg|png)$/i, '.webp');
    webpSource.setAttribute('srcset', webpPath);
    webpSource.setAttribute('type', 'image/webp');
    
    // Fallback image
    const img = document.createElement('img');
    const fallbackPath = this.getOptimizedImagePath(imagePath);
    img.setAttribute('src', fallbackPath);
    img.setAttribute('alt', alt);
    
    if (className) img.className = className;
    if (width) img.setAttribute('width', width);
    if (height) img.setAttribute('height', height);
    
    picture.appendChild(webpSource);
    picture.appendChild(img);
    
    return picture;
  }

  /**
   * Public method to check WebP support
   */
  hasWebPSupport() {
    return this.supportsWebP;
  }

  /**
   * Public method to manually load image
   */
  forceLoadImage(element) {
    this.loadImage(element);
  }
}

export default ImageOptimization; 