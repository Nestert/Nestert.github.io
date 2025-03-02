// Ждем загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
  // Переменные для мобильного меню
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('nav ul');

  // Переменные для галереи и лайтбокса
  const gallery = document.querySelector('.gallery');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const caption = document.getElementById('caption');
  const details = document.getElementById('details');
  const counter = document.getElementById('counter');
  const closeBtn = document.querySelector('.close');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const resetFiltersBtn = document.querySelector('.reset-filters-btn');
  
  // Активные фильтры
  const activeFilters = {
    series: 'all',
    year: 'all',
    material: 'all'
  };
  
  // Обновление data-material атрибутов для совместимости с новыми фильтрами
  galleryItems.forEach(item => {
    const detailsText = item.querySelector('.artwork-details').textContent.toLowerCase();
    
    if (detailsText.includes('литография')) {
      item.dataset.material = 'lithography';
    } else if (detailsText.includes('шелкография')) {
      item.dataset.material = 'silkscreen';
    }
  });
  
  // Массив видимых изображений для навигации в лайтбоксе
  let visibleImages = [...galleryItems];
  
  // Текущий индекс изображения в лайтбоксе
  let currentIndex = 0;

  // Обработчик клика для мобильного меню
  if (hamburger) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Плавная прокрутка для ссылок внутри страницы
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
      
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 60,
          behavior: 'smooth'
        });
      }
    });
  });

  // Обновление массива видимых изображений
  function updateVisibleImages() {
    visibleImages = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
  }

  // Функция для применения фильтров к галерее
  function applyFilters() {
    galleryItems.forEach(item => {
      // Проверяем соответствие каждому активному фильтру
      const matchesSeries = activeFilters.series === 'all' || 
                            item.dataset.category === activeFilters.series;
      
      const matchesYear = activeFilters.year === 'all' || 
                          item.dataset.year === activeFilters.year;
      
      const matchesMaterial = activeFilters.material === 'all' || 
                              item.dataset.material === activeFilters.material;
      
      // Элемент должен соответствовать всем активным фильтрам
      if (matchesSeries && matchesYear && matchesMaterial) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
    
    // Обновить массив видимых изображений для лайтбокса
    updateVisibleImages();
  }

  // Обработчик для кнопок фильтрации
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const filterType = this.dataset.filter; // series, year, material
      const filterValue = this.dataset.value; // all, series-xxx, 2022, oil, etc.
      
      // Обновляем активный фильтр текущего типа
      activeFilters[filterType] = filterValue;
      
      // Визуально отмечаем активную кнопку для этого типа фильтра
      document.querySelectorAll(`.filter-btn[data-filter="${filterType}"]`).forEach(button => {
        button.classList.remove('active');
      });
      this.classList.add('active');
      
      // Применяем фильтры
      applyFilters();
    });
  });
  
  // Обработчик для кнопки сброса всех фильтров
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', function() {
      // Сбрасываем все активные фильтры
      Object.keys(activeFilters).forEach(key => {
        activeFilters[key] = 'all';
      });
      
      // Визуально отмечаем кнопки "Все" как активные
      filterBtns.forEach(btn => {
        if (btn.dataset.value === 'all') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      // Применяем фильтры
      applyFilters();
    });
  }

  // Обработчик клика по элементу галереи
  galleryItems.forEach((item, index) => {
    item.addEventListener('click', function() {
      openLightbox(this);
    });
  });
  
  // Функция открытия лайтбокса
  function openLightbox(item) {
    // Устанавливаем источник изображения и подпись
    const img = item.querySelector('img');
    const description = item.querySelector('.artwork-description').textContent;
    const detailsText = item.querySelector('.artwork-details').textContent;
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    caption.textContent = description;
    details.textContent = detailsText;
    
    // Находим индекс текущего изображения среди видимых
    currentIndex = visibleImages.indexOf(item);
    
    // Устанавливаем счетчик
    counter.textContent = `${currentIndex + 1} / ${visibleImages.length}`;
    
    // Показываем лайтбокс
    lightbox.setAttribute('aria-hidden', 'false');
    
    // Захватываем фокус для закрытия по Escape
    lightbox.focus();
  }
  
  // Функция для показа предыдущего изображения
  function showPrevImage() {
    if (visibleImages.length <= 1) return;
    
    currentIndex = (currentIndex - 1 + visibleImages.length) % visibleImages.length;
    const prevItem = visibleImages[currentIndex];
    
    if (prevItem) {
      openLightbox(prevItem);
    }
  }
  
  // Функция для показа следующего изображения
  function showNextImage() {
    if (visibleImages.length <= 1) return;
    
    currentIndex = (currentIndex + 1) % visibleImages.length;
    const nextItem = visibleImages[currentIndex];
    
    if (nextItem) {
      openLightbox(nextItem);
    }
  }
  
  // Обработчики кнопок навигации
  prevBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showPrevImage();
  });
  
  nextBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    showNextImage();
  });
  
  // Обработчик закрытия лайтбокса
  function closeLightbox() {
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }
  
  // Закрытие лайтбокса по клику на крестик
  closeBtn.addEventListener('click', closeLightbox);
  
  // Закрытие лайтбокса по клику вне изображения
  lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
  
  // Обработка клавиатурных событий в лайтбоксе
  document.addEventListener('keydown', function(e) {
    if (lightbox.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      }
    }
  });
  
  // Инициализация - обновляем массив видимых изображений
  updateVisibleImages();
}); 