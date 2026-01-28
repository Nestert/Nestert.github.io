(function() {
  'use strict';

  class Lightbox {
    constructor() {
      this.lightbox = document.getElementById('lightbox');
      this.image = document.getElementById('lightbox-image');
      this.closeBtn = document.querySelector('.lightbox__close');
      this.prevBtn = document.querySelector('.lightbox__prev');
      this.nextBtn = document.querySelector('.lightbox__next');
      this.links = document.querySelectorAll('[data-lightbox="gallery"]');

      this.currentIndex = 0;
      this.images = [];

      this.init();
    }

    init() {
      if (!this.lightbox || !this.links.length) return;

      this.links.forEach((link, index) => {
        this.images.push({
          src: link.href,
          title: link.dataset.title || ''
        });

        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.open(index);
        });
      });

      this.closeBtn.addEventListener('click', () => this.close());
      this.prevBtn.addEventListener('click', () => this.prev());
      this.nextBtn.addEventListener('click', () => this.next());

      this.lightbox.addEventListener('click', (e) => {
        if (e.target === this.lightbox) {
          this.close();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (!this.lightbox.classList.contains('is-open')) return;

        if (e.key === 'Escape') this.close();
        if (e.key === 'ArrowLeft') this.prev();
        if (e.key === 'ArrowRight') this.next();
      });

      this.initTouch();
    }

    initTouch() {
      let startX = 0;
      let endX = 0;

      this.lightbox.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
      }, { passive: true });

      this.lightbox.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        const diff = startX - endX;

        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.next();
          } else {
            this.prev();
          }
        }
      }, { passive: true });
    }

    open(index) {
      this.currentIndex = index;
      this.updateImage();
      this.lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    close() {
      this.lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    prev() {
      this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
      this.updateImage();
    }

    next() {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.updateImage();
    }

    updateImage() {
      const current = this.images[this.currentIndex];
      this.image.src = current.src;
      this.image.alt = current.title;
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    new Lightbox();
  });
})();
