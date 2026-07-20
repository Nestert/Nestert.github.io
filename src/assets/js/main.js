(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    initImageReveal();
    initWorkCarousels();
    initImageZoom();
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
      const captions = Array.from(carousel.querySelectorAll('[data-carousel-caption]'));

      if (!viewport || !track || slides.length < 2 || !previousButton || !nextButton) return;

      let currentIndex = 0;
      let touchStartX = null;

      function showSlide(nextIndex) {
        currentIndex = (nextIndex + slides.length) % slides.length;
        track.style.transform = `translate3d(-${currentIndex * 100}%, 0, 0)`;

        slides.forEach(function(slide, index) {
          slide.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');

          slide.querySelectorAll('[data-image-zoom-trigger]').forEach(function(trigger) {
            trigger.tabIndex = index === currentIndex ? 0 : -1;
          });
        });

        captions.forEach(function(caption, index) {
          caption.setAttribute('aria-hidden', index === currentIndex ? 'false' : 'true');
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

        carousel.dataset.suppressZoom = 'true';
        window.setTimeout(function() {
          delete carousel.dataset.suppressZoom;
        }, 0);

        if (distance > 0) {
          showSlide(currentIndex - 1);
        } else {
          showSlide(currentIndex + 1);
        }
      }, { passive: true });
    });
  }

  function initImageZoom() {
    const dialog = document.querySelector('[data-image-zoom]');
    const triggers = Array.from(document.querySelectorAll('[data-image-zoom-trigger]'));

    if (!dialog || !triggers.length) return;

    const viewport = dialog.querySelector('[data-image-zoom-viewport]');
    const zoomImage = dialog.querySelector('[data-image-zoom-image]');
    const closeButton = dialog.querySelector('[data-image-zoom-close]');
    const zoomOutButton = dialog.querySelector('[data-image-zoom-out]');
    const zoomInButton = dialog.querySelector('[data-image-zoom-in]');
    const resetButton = dialog.querySelector('[data-image-zoom-reset]');
    const levelOutput = dialog.querySelector('[data-image-zoom-level]');

    if (!viewport || !zoomImage || !closeButton || !zoomOutButton || !zoomInButton || !resetButton) return;

    const minimumScale = 1;
    const maximumScale = 5;
    const scaleStep = 0.5;
    const pointers = new Map();
    let scale = minimumScale;
    let translateX = 0;
    let translateY = 0;
    let pinchStartDistance = 0;
    let pinchStartScale = minimumScale;
    let activeTrigger = null;
    let ignoreNextViewportClick = false;

    function clamp(value, minimum, maximum) {
      return Math.min(maximum, Math.max(minimum, value));
    }

    function clampTranslation() {
      if (scale <= minimumScale) {
        translateX = 0;
        translateY = 0;
        return;
      }

      const maximumX = Math.max(0, ((zoomImage.clientWidth * scale) - viewport.clientWidth) / 2);
      const maximumY = Math.max(0, ((zoomImage.clientHeight * scale) - viewport.clientHeight) / 2);
      translateX = clamp(translateX, -maximumX, maximumX);
      translateY = clamp(translateY, -maximumY, maximumY);
    }

    function renderTransform() {
      zoomImage.style.transform = `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
      viewport.classList.toggle('is-zoomed', scale > minimumScale);
      zoomOutButton.disabled = scale <= minimumScale;
      zoomInButton.disabled = scale >= maximumScale;
      resetButton.disabled = scale <= minimumScale && translateX === 0 && translateY === 0;

      if (levelOutput) {
        levelOutput.textContent = `${Math.round(scale * 100)}%`;
      }
    }

    function setScale(nextScale) {
      const previousScale = scale;
      scale = clamp(nextScale, minimumScale, maximumScale);

      if (scale === minimumScale) {
        translateX = 0;
        translateY = 0;
      } else if (previousScale > 0 && previousScale !== scale) {
        const ratio = scale / previousScale;
        translateX *= ratio;
        translateY *= ratio;
      }

      clampTranslation();
      renderTransform();
    }

    function resetTransform() {
      scale = minimumScale;
      translateX = 0;
      translateY = 0;
      pointers.clear();
      viewport.classList.remove('is-dragging', 'is-interacting');
      renderTransform();
    }

    function cleanUpDialog() {
      document.body.classList.remove('image-zoom-open');
      resetTransform();
      zoomImage.removeAttribute('src');
      zoomImage.alt = '';
      zoomImage.classList.remove('is-loading');
      delete zoomImage.dataset.fallbackSource;

      if (activeTrigger) {
        activeTrigger.focus({ preventScroll: true });
        activeTrigger = null;
      }
    }

    function closeZoom() {
      if (typeof dialog.close === 'function' && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        cleanUpDialog();
      }
    }

    function openZoom(trigger, event) {
      event.preventDefault();

      const carousel = trigger.closest('[data-work-carousel]');
      if (carousel && carousel.dataset.suppressZoom === 'true') return;

      const sourceImage = trigger.querySelector('img');
      activeTrigger = trigger;
      resetTransform();
      zoomImage.alt = sourceImage ? sourceImage.alt : '';
      zoomImage.dataset.fallbackSource = sourceImage ? (sourceImage.currentSrc || sourceImage.src) : '';
      zoomImage.classList.add('is-loading');
      zoomImage.src = trigger.href;
      document.body.classList.add('image-zoom-open');

      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }

      closeButton.focus();
    }

    function getPointerDistance() {
      const positions = Array.from(pointers.values());
      if (positions.length < 2) return 0;

      return Math.hypot(positions[0].x - positions[1].x, positions[0].y - positions[1].y);
    }

    triggers.forEach(function(trigger) {
      trigger.addEventListener('click', function(event) {
        openZoom(trigger, event);
      });
    });

    zoomImage.addEventListener('load', function() {
      zoomImage.classList.remove('is-loading');
      clampTranslation();
      renderTransform();
    });

    zoomImage.addEventListener('error', function() {
      const fallbackSource = zoomImage.dataset.fallbackSource;

      if (fallbackSource && zoomImage.src !== fallbackSource) {
        delete zoomImage.dataset.fallbackSource;
        zoomImage.src = fallbackSource;
        return;
      }

      zoomImage.classList.remove('is-loading');
    });

    closeButton.addEventListener('click', closeZoom);
    zoomOutButton.addEventListener('click', function() {
      setScale(scale - scaleStep);
    });
    zoomInButton.addEventListener('click', function() {
      setScale(scale + scaleStep);
    });
    resetButton.addEventListener('click', resetTransform);

    dialog.addEventListener('cancel', function(event) {
      event.preventDefault();
      closeZoom();
    });

    dialog.addEventListener('close', cleanUpDialog);
    dialog.addEventListener('click', function(event) {
      if (event.target === dialog) {
        closeZoom();
      }
    });

    dialog.addEventListener('keydown', function(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeZoom();
        return;
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        setScale(scale + scaleStep);
      }

      if (event.key === '-') {
        event.preventDefault();
        setScale(scale - scaleStep);
      }

      if (event.key === '0') {
        event.preventDefault();
        resetTransform();
      }
    });

    viewport.addEventListener('wheel', function(event) {
      event.preventDefault();
      setScale(scale + (event.deltaY < 0 ? scaleStep : -scaleStep));
    }, { passive: false });

    viewport.addEventListener('dblclick', function(event) {
      event.preventDefault();
      setScale(scale > minimumScale ? minimumScale : 2.5);
    });

    viewport.addEventListener('click', function(event) {
      if (event.target === viewport && !ignoreNextViewportClick) {
        closeZoom();
      }
    });

    viewport.addEventListener('pointerdown', function(event) {
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      viewport.classList.add('is-interacting');

      if (typeof viewport.setPointerCapture === 'function') {
        viewport.setPointerCapture(event.pointerId);
      }

      if (pointers.size === 2) {
        pinchStartDistance = getPointerDistance();
        pinchStartScale = scale;
      }
    });

    viewport.addEventListener('pointermove', function(event) {
      const previousPosition = pointers.get(event.pointerId);
      if (!previousPosition) return;

      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pointers.size >= 2) {
        const distance = getPointerDistance();

        if (pinchStartDistance > 0) {
          setScale(pinchStartScale * (distance / pinchStartDistance));
          ignoreNextViewportClick = true;
        }

        return;
      }

      if (scale > minimumScale) {
        translateX += event.clientX - previousPosition.x;
        translateY += event.clientY - previousPosition.y;
        clampTranslation();
        renderTransform();
        viewport.classList.add('is-dragging');
        ignoreNextViewportClick = true;
      }
    });

    function releasePointer(event) {
      pointers.delete(event.pointerId);

      if (pointers.size < 2) {
        pinchStartDistance = 0;
        pinchStartScale = scale;
      }

      if (!pointers.size) {
        viewport.classList.remove('is-dragging', 'is-interacting');
        window.setTimeout(function() {
          ignoreNextViewportClick = false;
        }, 0);
      }
    }

    viewport.addEventListener('pointerup', releasePointer);
    viewport.addEventListener('pointercancel', releasePointer);
    window.addEventListener('resize', function() {
      clampTranslation();
      renderTransform();
    });

    resetTransform();
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
