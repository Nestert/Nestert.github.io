/**
 * Navigation Module
 * Handles mobile menu toggle and smooth scrolling
 */

class Navigation {
  constructor() {
    this.hamburger = document.querySelector('.nav__toggle');
    this.navMenu = document.querySelector('.nav__menu');
    this.navLinks = document.querySelectorAll('.nav__menu-link');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupSmoothScrolling();
  }

  bindEvents() {
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav') && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });

    // Close mobile menu when window is resized to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.navMenu?.classList.contains('active')) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    this.hamburger?.classList.toggle('active');
    this.navMenu?.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    document.body.style.overflow = this.navMenu?.classList.contains('active') ? 'hidden' : '';
    
    // Update aria attributes
    const isExpanded = this.navMenu?.classList.contains('active');
    this.hamburger?.setAttribute('aria-expanded', isExpanded);
  }

  closeMobileMenu() {
    this.hamburger?.classList.remove('active');
    this.navMenu?.classList.remove('active');
    document.body.style.overflow = '';
    this.hamburger?.setAttribute('aria-expanded', 'false');
  }

  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      if (link.getAttribute('href')?.startsWith('#')) {
        link.addEventListener('click', (e) => this.handleSmoothScroll(e));
      }
    });
  }

  handleSmoothScroll(e) {
    e.preventDefault();
    
    // Close mobile menu if open
    if (this.navMenu?.classList.contains('active')) {
      this.closeMobileMenu();
    }
    
    const targetId = e.currentTarget.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
      const headerHeight = document.querySelector('.header')?.offsetHeight || 70;
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
}

export default Navigation; 