(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initBackToTop();
  });

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
