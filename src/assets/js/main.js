(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initImageReveal();
    initWorkCarousels();
    initMobileMenu();
    initBackToTop();
  });

  function initImageReveal() {
    const images = document.querySelectorAll('.project-card__image, .work-detail__image, .cv img');

    if (!images.length) return;

    images.forEach(function(image) {
      image.classList.add('image-reveal');
    });
    document.documentElement.classList.add('image-reveal-enabled');

    images.forEach(function(image) {
      function reveal() {
        image.classList.add('is-loaded');
      }

      if (image.complete && image.naturalWidth > 0) {
        window.requestAnimationFrame(reveal);
      } else {
        image.addEventListener('load', reveal, { once: true });
        image.addEventListener('error', reveal, { once: true });
      }
    });
  }

  function initWorkCarousels() {
    document.querySelectorAll('[data-work-carousel]').forEach(function(carousel) {
      const viewport = carousel.querySelector('[data-carousel-viewport]');
      const track = carousel.querySelector('[data-carousel-track]');
      const slides = Array.from(carousel.querySelectorAll('[data-carousel-slide]'));
      const previousButton = carousel.querySelector('[data-carousel-previous]');
      const nextButton = carousel.querySelector('[data-carousel-next]');
      const currentCounter = carousel.querySelector('[data-carousel-current]');

      if (!viewport || !track || slides.length < 2 || !previousButton || !nextButton) return;

      let currentIndex = 0;
      let touchStartX = null;

      function showSlide(nextIndex) {
        currentIndex = (nextIndex + slides.length) % slides.length;
        track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

        slides.forEach(function(slide, index) {
          slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');
        });

        if (currentCounter) {
          currentCounter.textContent = String(currentIndex + 1);
        }
      }

      carousel.classList.add('is-enabled');
      showSlide(0);

      previousButton.addEventListener('click', function() {
        showSlide(currentIndex - 1);
      });

      nextButton.addEventListener('click', function() {
        showSlide(currentIndex + 1);
      });

      carousel.addEventListener('keydown', function(event) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showSlide(currentIndex - 1);
        }

        if (event.key === 'ArrowRight') {
          event.preventDefault();
          showSlide(currentIndex + 1);
        }
      });

      viewport.addEventListener('touchstart', function(event) {
        if (event.touches.length === 1) {
          touchStartX = event.touches[0].clientX;
        }
      }, { passive: true });

      viewport.addEventListener('touchend', function(event) {
        if (touchStartX === null || !event.changedTouches.length) return;

        const distance = event.changedTouches[0].clientX - touchStartX;
        touchStartX = null;

        if (Math.abs(distance) < 50) return;

        if (distance > 0) {
          showSlide(currentIndex - 1);
        } else {
          showSlide(currentIndex + 1);
        }
      }, { passive: true });
    });
  }

  function initMobileMenu() {
    const toggle = document.querySelector('.nav__toggle');
    const menu = document.querySelector('.nav__menu');
    const nav = toggle && toggle.closest('.nav');

    if (!toggle || !menu || !nav) return;

    function openMenu() {
      nav.classList.add('nav--open');
      menu.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      nav.classList.remove('nav--open');
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function() {
      if (menu.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll('.nav__link').forEach(function(link) {
      link.addEventListener('click', function() {
        closeMenu();
      });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        closeMenu();
      }
    });

    window.matchMedia('(min-width: 768px)').addEventListener('change', function(e) {
      if (e.matches) {
        closeMenu();
      }
    });
  }

  function initBackToTop() {
    const backToTop = document.querySelector('.footer__back-to-top');

    if (!backToTop) return;

    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
