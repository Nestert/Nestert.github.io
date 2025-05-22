/**
 * Gallery Module
 * Handles gallery filtering and lightbox functionality
 */

class Gallery {
  constructor() {
    this.galleryContainer = document.querySelector('.gallery');
    this.galleryItems = document.querySelectorAll('.gallery__item');
    this.filterButtons = document.querySelectorAll('.filter__button');
    this.resetButton = document.querySelector('.filter__reset');
    
    this.activeFilters = {
      series: 'all',
      year: 'all',
      material: 'all'
    };
    
    this.visibleItems = [...this.galleryItems];
    
    this.init();
  }

  init() {
    this.updateMaterialAttributes();
    this.bindFilterEvents();
    this.bindGalleryEvents();
    this.updateVisibleItems();
  }

  updateMaterialAttributes() {
    // Update data-material attributes for compatibility
    this.galleryItems.forEach(item => {
      const detailsText = item.querySelector('.gallery__details')?.textContent.toLowerCase() || '';
      
      if (detailsText.includes('литография')) {
        item.dataset.material = 'lithography';
      } else if (detailsText.includes('шелкография')) {
        item.dataset.material = 'silkscreen';
      } else if (detailsText.includes('линогравюра')) {
        item.dataset.material = 'linocut';
      } else if (detailsText.includes('масло')) {
        item.dataset.material = 'oil';
      } else if (detailsText.includes('акрил')) {
        item.dataset.material = 'acrylic';
      }
    });
  }

  bindFilterEvents() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilterClick(e));
    });

    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => this.resetAllFilters());
    }
  }

  bindGalleryEvents() {
    this.galleryItems.forEach(item => {
      item.addEventListener('click', () => this.openLightbox(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openLightbox(item);
        }
      });
    });
  }

  handleFilterClick(e) {
    const button = e.currentTarget;
    const filterType = button.dataset.filter;
    const filterValue = button.dataset.value;
    
    // Update active filter
    this.activeFilters[filterType] = filterValue;
    
    // Update button states for this filter type
    this.updateFilterButtonStates(filterType, filterValue);
    
    // Apply filters
    this.applyFilters();
  }

  updateFilterButtonStates(filterType, activeValue) {
    document.querySelectorAll(`.filter__button[data-filter="${filterType}"]`).forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === activeValue);
    });
  }

  applyFilters() {
    this.galleryItems.forEach(item => {
      const matchesSeries = this.activeFilters.series === 'all' || 
                            item.dataset.category === this.activeFilters.series;
      
      const matchesYear = this.activeFilters.year === 'all' || 
                          item.dataset.year === this.activeFilters.year;
      
      const matchesMaterial = this.activeFilters.material === 'all' || 
                              item.dataset.material === this.activeFilters.material;
      
      const shouldShow = matchesSeries && matchesYear && matchesMaterial;
      
      item.classList.toggle('hidden', !shouldShow);
      item.setAttribute('aria-hidden', !shouldShow);
    });
    
    this.updateVisibleItems();
    this.announceFilterResults();
  }

  updateVisibleItems() {
    this.visibleItems = Array.from(this.galleryItems).filter(item => 
      !item.classList.contains('hidden')
    );
  }

  announceFilterResults() {
    const visibleCount = this.visibleItems.length;
    const totalCount = this.galleryItems.length;
    
    // Create or update screen reader announcement
    let announcement = document.getElementById('filter-announcement');
    if (!announcement) {
      announcement = document.createElement('div');
      announcement.id = 'filter-announcement';
      announcement.className = 'visually-hidden';
      announcement.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcement);
    }
    
    announcement.textContent = `Показано ${visibleCount} из ${totalCount} работ`;
  }

  resetAllFilters() {
    // Reset all active filters
    Object.keys(this.activeFilters).forEach(key => {
      this.activeFilters[key] = 'all';
    });
    
    // Reset all button states
    this.filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === 'all');
    });
    
    // Apply filters
    this.applyFilters();
  }

  openLightbox(item) {
    // This will be handled by the Lightbox class
    const event = new CustomEvent('gallery:openLightbox', {
      detail: { item, visibleItems: this.visibleItems }
    });
    document.dispatchEvent(event);
  }

  getVisibleItems() {
    return this.visibleItems;
  }
}

export default Gallery; 