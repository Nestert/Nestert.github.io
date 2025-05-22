/**
 * SEO Enhancement Module
 * Dynamically updates meta tags based on current content and user interactions
 */

class SEOEnhancement {
  constructor() {
    this.defaultTitle = 'Екатерина Романова — Художник и дизайнер | Omanovar';
    this.defaultDescription = 'Портфолио художника Екатерины Романовой из Санкт-Петербурга. Живопись, графика, линогравюра, литография. Галерея работ и информация о выставках.';
    this.siteUrl = 'https://omanovar.ru';
    
    this.init();
  }

  init() {
    this.setupHashChangeTracking();
    this.setupGalleryFiltering();
    this.generateArtworkStructuredData();
  }

  /**
   * Track hash changes for single-page navigation
   */
  setupHashChangeTracking() {
    window.addEventListener('hashchange', () => {
      this.updateMetaForCurrentHash();
    });

    // Initial update
    this.updateMetaForCurrentHash();
  }

  /**
   * Update meta tags based on current hash
   */
  updateMetaForCurrentHash() {
    const hash = window.location.hash;
    let title = this.defaultTitle;
    let description = this.defaultDescription;
    let canonical = this.siteUrl;

    switch (hash) {
    case '#artworks':
      title = 'Галерея работ — Екатерина Романова | Omanovar';
      description = 'Галерея произведений художника Екатерины Романовой: линогравюра, литография, шелкография, живопись. Работы 2022-2024 годов из разных серий.';
      canonical = `${this.siteUrl}#artworks`;
      break;
      
    case '#exhibitions':
      title = 'Выставки — Екатерина Романова | Omanovar';
      description = 'Участие в выставках и конкурсах художника Екатерины Романовой. Лауреат и победитель конкурсов в сфере живописи и графики.';
      canonical = `${this.siteUrl}#exhibitions`;
      break;
      
    default:
      // Keep default values
      break;
    }

    this.updateMetaTags(title, description, canonical);
  }

  /**
   * Update page meta tags
   */
  updateMetaTags(title, description, canonical) {
    // Update title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonical);
    }

    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    }

    const twitterDescription = document.querySelector('meta[property="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    }
  }

  /**
   * Track gallery filtering for analytics
   */
  setupGalleryFiltering() {
    document.addEventListener('galleryFiltered', (event) => {
      const { filterType, filterValue, visibleCount } = event.detail;
      
      // Update page title for filtered gallery
      if (filterValue && filterValue !== 'all') {
        const filterTitle = this.getFilterTitle(filterType, filterValue);
        const title = `${filterTitle} — Галерея Екатерины Романовой | Omanovar`;
        document.title = title;
      } else {
        // Reset to default gallery title
        document.title = 'Галерея работ — Екатерина Романова | Omanovar';
      }

      // Track for analytics
      this.trackGalleryFilter(filterType, filterValue, visibleCount);
    });
  }

  /**
   * Get human-readable filter title
   */
  getFilterTitle(filterType, filterValue) {
    const filterTitles = {
      series: {
        'series-аисты': 'Серия "Аисты"',
        'series-портреты': 'Серия "Портреты"',
        'series-поговорки': 'Серия "Поговорки"',
        'series-места': 'Серия "Места"'
      },
      year: {
        '2022': 'Работы 2022 года',
        '2023': 'Работы 2023 года',
        '2024': 'Работы 2024 года'
      },
      material: {
        'oil': 'Работы маслом',
        'linocut': 'Линогравюры',
        'acrylic': 'Работы акрилом',
        'lithography': 'Литографии',
        'silkscreen': 'Шелкографии'
      }
    };

    return filterTitles[filterType]?.[filterValue] || filterValue;
  }

  /**
   * Generate structured data for individual artworks
   */
  generateArtworkStructuredData() {
    const artworks = document.querySelectorAll('.gallery__item[itemscope]');
    const artworkData = [];

    artworks.forEach(artwork => {
      const name = artwork.querySelector('[itemprop="name"]')?.textContent;
      const image = artwork.querySelector('[itemprop="image"]')?.src;
      const medium = artwork.querySelector('[itemprop="artMedium"]')?.textContent;
      const width = artwork.querySelector('[itemprop="width"]')?.getAttribute('content');
      const height = artwork.querySelector('[itemprop="height"]')?.getAttribute('content');
      const dateCreated = artwork.querySelector('[itemprop="dateCreated"]')?.getAttribute('datetime');

      if (name && image) {
        artworkData.push({
          '@type': 'VisualArtwork',
          name,
          'image': image.startsWith('http') ? image : `${this.siteUrl}/${image}`,
          'creator': {
            '@type': 'Person',
            'name': 'Екатерина Романова'
          },
          'artMedium': medium,
          'width': width ? `${width} cm` : undefined,
          'height': height ? `${height} cm` : undefined,
          dateCreated,
          'genre': 'Графика',
          'artform': 'Печатная графика'
        });
      }
    });

    if (artworkData.length > 0) {
      this.addStructuredData({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': 'Галерея работ Екатерины Романовой',
        'description': 'Коллекция произведений искусства художника Екатерины Романовой',
        'numberOfItems': artworkData.length,
        'itemListElement': artworkData.map((artwork, index) => ({
          '@type': 'ListItem',
          'position': index + 1,
          'item': artwork
        }))
      });
    }
  }

  /**
   * Add structured data to page
   */
  addStructuredData(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data, null, 2);
    script.id = 'gallery-structured-data';
    
    // Remove existing gallery structured data
    const existing = document.getElementById('gallery-structured-data');
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);
  }

  /**
   * Track gallery filtering for analytics
   */
  trackGalleryFilter(filterType, filterValue, visibleCount) {
    // Google Analytics 4 event tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'gallery_filter', {
        filter_type: filterType,
        filter_value: filterValue,
        visible_items: visibleCount,
        event_category: 'engagement'
      });
    }

    // Yandex Metrica tracking
    // eslint-disable-next-line no-undef
    if (typeof ym !== 'undefined' && window.yaCounterID) {
      // eslint-disable-next-line no-undef
      ym(window.yaCounterID, 'reachGoal', 'gallery_filter', {
        filter_type: filterType,
        filter_value: filterValue,
        visible_items: visibleCount
      });
    }

    // Debug logging (remove in production)
    // eslint-disable-next-line no-console
    console.log(`Gallery filtered: ${filterType}=${filterValue}, showing ${visibleCount} items`);
  }

  /**
   * Track artwork views for analytics
   */
  trackArtworkView(artworkName, _artworkDetails) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'view_item', {
        item_id: artworkName.toLowerCase().replace(/\s+/g, '_'),
        item_name: artworkName,
        item_category: 'artwork',
        content_type: 'artwork_view'
      });
    }

    // eslint-disable-next-line no-undef
    if (typeof ym !== 'undefined' && window.yaCounterID) {
      // eslint-disable-next-line no-undef
      ym(window.yaCounterID, 'reachGoal', 'artwork_view', {
        artwork_name: artworkName
      });
    }
  }

  /**
   * Generate breadcrumb structured data
   */
  generateBreadcrumbData() {
    const hash = window.location.hash;
    const breadcrumbs = [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Главная',
        'item': this.siteUrl
      }
    ];

    if (hash === '#artworks') {
      breadcrumbs.push({
        '@type': 'ListItem',
        'position': 2,
        'name': 'Галерея работ',
        'item': `${this.siteUrl}#artworks`
      });
    } else if (hash === '#exhibitions') {
      breadcrumbs.push({
        '@type': 'ListItem',
        'position': 2,
        'name': 'Выставки',
        'item': `${this.siteUrl}#exhibitions`
      });
    }

    if (breadcrumbs.length > 1) {
      this.addStructuredData({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs
      });
    }
  }

  /**
   * Setup social sharing optimization
   */
  setupSocialSharing() {
    // Listen for potential sharing events
    document.addEventListener('click', (event) => {
      const target = event.target.closest('a[href*="twitter.com"], a[href*="facebook.com"], a[href*="vk.com"]');
      if (target) {
        const platform = this.detectSocialPlatform(target.href);
        this.trackSocialShare(platform);
      }
    });
  }

  /**
   * Detect social media platform
   */
  detectSocialPlatform(url) {
    if (url.includes('twitter.com')) return 'twitter';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('vk.com')) return 'vkontakte';
    if (url.includes('telegram.org') || url.includes('t.me')) return 'telegram';
    return 'unknown';
  }

  /**
   * Track social sharing
   */
  trackSocialShare(platform) {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        method: platform,
        content_type: 'portfolio',
        content_id: 'omanovar_portfolio'
      });
    }
  }
}

export default SEOEnhancement; 