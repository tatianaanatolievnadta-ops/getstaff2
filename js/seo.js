/** SEO-хелперы: meta, Open Graph, JSON-LD */
(function () {
  const ORIGIN = 'https://gstmetiz.shop';

  function upsertMeta(attr, key, content) {
    if (!content) return;
    let el = document.querySelector(`meta[${attr}="${key}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function upsertLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  }

  function upsertJsonLd(id, data) {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('script');
      el.type = 'application/ld+json';
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  }

  window.SITE_ORIGIN = ORIGIN;

  window.setPageSeo = function setPageSeo({ title, description, path, image, type, noindex }) {
    if (title) document.title = title;
    if (description) upsertMeta('name', 'description', description);
    if (noindex) upsertMeta('name', 'robots', 'noindex, nofollow');
    const url = path ? (path.startsWith('http') ? path : ORIGIN + (path.startsWith('/') ? path : '/' + path)) : ORIGIN + '/';
    upsertLink('canonical', url);
    upsertMeta('property', 'og:title', title || document.title);
    upsertMeta('property', 'og:description', description || '');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:type', type || 'website');
    upsertMeta('property', 'og:site_name', 'GETSTUFF');
    upsertMeta('property', 'og:locale', 'ru_RU');
    const img = image
      ? (image.startsWith('http') ? image : ORIGIN + '/' + image.replace(/^\//, ''))
      : ORIGIN + '/assets/brand/hero-roof.jpg';
    upsertMeta('property', 'og:image', img);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title || document.title);
    upsertMeta('name', 'twitter:description', description || '');
    upsertMeta('name', 'twitter:image', img);
  };

  window.setProductSeo = function setProductSeo(product) {
    if (!product) return;
    const price = typeof getSitePrice === 'function' ? getSitePrice(product) : product.price;
    const path = '/product.html?id=' + encodeURIComponent(product.id);
    const desc = (product.description || product.name).slice(0, 160);
    setPageSeo({
      title: product.name + ' — купить | GETSTUFF',
      description: desc + (price ? ' Цена от ' + price + ' ₽. Скидка к WB, опт, доставка.' : ''),
      path,
      image: typeof getLocalProductImagePath === 'function'
        ? getLocalProductImagePath(product.wbId)
        : 'assets/brand/logo-mark.png',
      type: 'product',
    });
    upsertJsonLd('ld-product', {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: product.sku || product.id,
      image: ORIGIN + '/' + (typeof getLocalProductImagePath === 'function'
        ? getLocalProductImagePath(product.wbId)
        : 'assets/brand/logo-mark.png'),
      description: product.description || product.name,
      brand: { '@type': 'Brand', name: 'GETSTUFF' },
      offers: {
        '@type': 'Offer',
        url: ORIGIN + path,
        priceCurrency: 'RUB',
        price: String(price || product.price || 0),
        availability: product.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'GETSTUFF' },
      },
      aggregateRating: product.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: String(product.rating),
            reviewCount: String(product.reviews || 1),
          }
        : undefined,
    });
  };

  window.injectOrgJsonLd = function injectOrgJsonLd() {
    const phone = (typeof SITE !== 'undefined' && SITE.phone) || '+7 (911) 910-33-44';
    const email = (typeof SITE !== 'undefined' && SITE.email) || 'gstmetiz@yandex.ru';
    upsertJsonLd('ld-org', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'GETSTUFF',
      url: ORIGIN + '/',
      logo: ORIGIN + '/assets/brand/logo-mark.png',
      email,
      telephone: phone,
      sameAs: [
        (typeof SITE !== 'undefined' && SITE.wbSeller) || 'https://www.wildberries.ru/seller/55354',
      ],
    });
    upsertJsonLd('ld-website', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'GETSTUFF',
      url: ORIGIN + '/',
      potentialAction: {
        '@type': 'SearchAction',
        target: ORIGIN + '/catalog.html?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    });
  };
})();
