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
    const imgPath = typeof getLocalProductImagePath === 'function'
      ? getLocalProductImagePath(product.wbId)
      : 'assets/brand/logo-mark.png';
    setPageSeo({
      title: product.name + ' — купить | GETSTUFF',
      description: desc + (price ? ' Цена от ' + price + ' ₽. Скидка к WB, опт, доставка.' : ''),
      path,
      image: imgPath,
      type: 'product',
    });
    const validUntil = new Date();
    validUntil.setMonth(validUntil.getMonth() + 3);
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      sku: String(product.sku || product.id),
      mpn: String(product.sku || product.id),
      image: [ORIGIN + '/' + String(imgPath).replace(/^\//, '')],
      description: product.description || product.name,
      category: product.category || 'Крепёж',
      brand: { '@type': 'Brand', name: 'GETSTUFF' },
      offers: {
        '@type': 'Offer',
        url: ORIGIN + path,
        priceCurrency: 'RUB',
        price: String(price || product.price || 0),
        priceValidUntil: validUntil.toISOString().slice(0, 10),
        availability: product.inStock !== false
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: { '@type': 'Organization', name: 'GETSTUFF', url: ORIGIN + '/' },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingDestination: {
            '@type': 'DefinedRegion',
            addressCountry: 'RU',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 7,
              unitCode: 'DAY',
            },
          },
        },
      },
    };
    if (product.rating) {
      ld.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: String(product.rating),
        reviewCount: String(product.reviews || 1),
        bestRating: '5',
        worstRating: '1',
      };
    }
    upsertJsonLd('ld-product', ld);
  };

  /** Related articles by product category for internal linking / SEO */
  window.getRelatedArticlesForProduct = function getRelatedArticlesForProduct(product) {
    const map = {
      'roof-screws': [
        { href: 'articles/samorezy-krovelnye-ral.html', title: 'Саморезы кровельные RAL и EPDM' },
        { href: 'articles/samorezy-dlya-zabora-profnastil.html', title: 'Саморезы для забора из профнастила' },
        { href: 'articles/rashod-samorezov-profnastil-m2.html', title: 'Расход саморезов на 1 м²' },
        { href: 'ral/', title: 'Подбор по цвету RAL' },
        { href: 'calc/rashod-samorezov.html', title: 'Калькулятор расхода' },
      ],
      'wood-screws': [
        { href: 'articles/kak-vybrat-samorezy-po-derevu.html', title: 'Как выбрать саморезы по дереву' },
        { href: 'articles/samorezy-35-i-42.html', title: 'Диаметры 3,5 и 4,2 мм' },
        { href: 'articles/zheltyj-cink-ili-chernyj-fosfat.html', title: 'Жёлтый цинк или чёрный фосфат' },
      ],
      'metal-screws': [
        { href: 'articles/samorezy-po-metallu-ili-derevu.html', title: 'По металлу или по дереву' },
        { href: 'articles/samorezy-so-sverlom.html', title: 'Саморезы со сверлом' },
        { href: 'articles/kak-otlichit-kachestvennyj-krepezh.html', title: 'Как отличить качественный крепёж' },
      ],
      nails: [
        { href: 'articles/gvozdi-stroitelnye-razmery.html', title: 'Гвозди: размеры и применение' },
        { href: 'articles/upakovka-krepezha-kg-ili-sht.html', title: 'Упаковка: кг или штуки' },
        { href: 'articles/chek-list-zakupki-krepezha.html', title: 'Чек-лист закупки' },
      ],
    };
    return map[product?.category] || [
      { href: 'articles.html', title: 'Все статьи о крепеже' },
      { href: 'articles/sajt-ili-wb-ceny-samorezy.html', title: 'Сайт или Wildberries' },
      { href: 'wholesale.html', title: 'Условия опта' },
    ];
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
