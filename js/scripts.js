// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const captionText = document.getElementById('caption');
  const gallery = document.querySelector('.gallery');
  const closeBtn = document.querySelector('.close');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('nav ul');

  // Мобильное меню
  hamburger.addEventListener('click', function() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Закрытие мобильного меню при клике на ссылку
  document.querySelectorAll('nav ul li a').forEach(item => {
    item.addEventListener('click', function() {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Плавная прокрутка для всех внутренних ссылок
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Учитываем высоту фиксированного header при прокрутке
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Делегирование событий для кликов по изображениям галереи
  gallery.addEventListener('click', function(e) {
    const target = e.target;
    if (target && target.classList.contains('gallery-img')) {
      lightbox.setAttribute('aria-hidden', 'false');
      lightboxImg.src = target.src;
      captionText.innerText = target.alt;
    }
  });

  // Закрытие lightbox по клику на кнопку закрытия
  closeBtn.addEventListener('click', function() {
    lightbox.setAttribute('aria-hidden', 'true');
  });

  // Закрытие lightbox при клике вне изображения
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });

  // Закрытие lightbox по нажатию клавиши Esc
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.getAttribute('aria-hidden') === 'false') {
      lightbox.setAttribute('aria-hidden', 'true');
    }
  });
}); 