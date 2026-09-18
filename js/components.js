function renderBuyOptions(opts = {}) {
  const compact = !!opts.compact;
  const titleTag = compact ? 'h3' : 'h2';
  const titleClass = compact ? 'buy-options__title buy-options__title--sm' : 'section__title buy-options__title';
  return `
    <div class="buy-options${compact ? ' buy-options--compact' : ''}">
      <${titleTag} class="${titleClass}">Два способа купить</${titleTag}>
      <p class="buy-options__lead">Выберите удобный вариант — и скорость доставки, и цена зависят от канала.</p>
      <div class="buy-options__grid">
        <div class="buy-options__card">
          <div class="buy-options__label">Wildberries</div>
          <div class="buy-options__name">Купить на WB</div>
          <p class="buy-options__text">
            Цена как на маркетплейсе. Сроки и способ доставки — <strong>как указано на Wildberries</strong>
            (склады и логистика WB).
          </p>
        </div>
        <div class="buy-options__card buy-options__card--site">
          <div class="buy-options__label buy-options__label--site">Сайт GETSTUFF</div>
          <div class="buy-options__name">Со скидкой −15%</div>
          <p class="buy-options__text">
            Дешевле, чем на WB. Отправка <strong>1 раз в неделю</strong>.
            Способ и детали доставки <strong>согласовываем с менеджером</strong> — подберём удобный для вас вариант.
          </p>
        </div>
      </div>
    </div>`;
}

function getSvgIcon(name) {
  const icons = {
    menu: '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
    search: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="6"/><path d="M17 17l-4-4"/></svg>',
    user: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="8" r="4"/><path d="M4 20c0-4 3-7 7-7s7 3 7 7"/></svg>',
    cart: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 2h3l2 12h11l3-8H6"/></svg>',
    home: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/></svg>',
    catalog: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    heart: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-8-4.5-8-11a5 5 0 019-3 5 5 0 019 3c0 6.5-8 11-8 11z"/></svg>',
    wholesale: '<svg width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 8l9-4 9 4v9l-9 4-9-4V8z"/><path d="M3 8l9 4 9-4M12 12v9"/></svg>',
    filter: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4h14M4 10h10M7 16h4"/></svg>',
  };
  return icons[name] || '';
}

function renderNavMenuPanel() {
  const cats = (CATEGORIES || []).slice(0, 8).map(c =>
    `<li><a href="catalog.html?cat=${c.id}">${c.name}</a></li>`
  ).join('');
  return `
    <div class="nav-menu__panel" id="nav-menu-panel" hidden>
      <div class="nav-menu__grid">
        <div class="nav-menu__col">
          <div class="nav-menu__title">Каталог</div>
          <ul>
            <li><a href="catalog.html"><strong>Весь каталог</strong></a></li>
            ${cats}
          </ul>
        </div>
        <div class="nav-menu__col">
          <div class="nav-menu__title">Разделы</div>
          <ul>
            <li><a href="index.html#products">Популярное</a></li>
            <li><a href="wholesale.html">Оптовым клиентам</a></li>
            <li><a href="index.html#delivery">Доставка</a></li>
            <li><a href="docs.html">Документы</a></li>
            <li><a href="index.html#about">О компании</a></li>
            <li><a href="#contacts">Контакты</a></li>
            <li><a href="favorites.html">Избранное</a></li>
          </ul>
        </div>
        <div class="nav-menu__col">
          <div class="nav-menu__title">Связь</div>
          <ul>
            <li><a href="tel:${SITE.phone.replace(/\D/g,'')}">${SITE.phone}</a></li>
            <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
            <li><a href="checkout.html">Оставить заявку</a></li>
            <li><a href="${SITE.wbSeller}" target="_blank" rel="noopener">Wildberries</a></li>
          </ul>
        </div>
      </div>
    </div>`;
}

function renderHeader() {
  return `
    <div class="site-chrome">
      <div class="top-bar">
        <div class="container">
          <a href="tel:${SITE.phone.replace(/\D/g,'')}" class="top-bar__phone">${SITE.phone}</a>
          <div class="top-bar__links">
            <a href="index.html#about">О компании</a>
            <a href="wholesale.html">Опт</a>
            <a href="index.html#delivery">Доставка</a>
            <a href="#contacts">Контакты</a>
            <a href="${SITE.wbSeller}" target="_blank" rel="noopener">Wildberries</a>
          </div>
        </div>
      </div>
      <header class="header">
        <div class="header__inner">
          <div class="nav-menu" id="site-nav-menu">
            <button type="button" class="header__menu-btn" id="nav-menu-toggle" aria-label="Меню" aria-expanded="false" aria-controls="nav-menu-panel">${getSvgIcon('menu')}</button>
            <button type="button" class="header__catalog-btn" id="nav-catalog-toggle" aria-expanded="false" aria-controls="nav-menu-panel">${getSvgIcon('catalog')} Каталог</button>
            ${renderNavMenuPanel()}
          </div>
          <a href="index.html" class="header__logo">
            <img class="header__logo-mark" src="assets/brand/logo-mark.png" alt="" width="40" height="40">
            <img class="header__logo-wordmark" src="assets/brand/logo-full.png" alt="GETSTUFF">
          </a>
          <div class="header__search">
            <input type="search" id="search-input" placeholder="Искать крепёж, саморезы, гвозди..." autocomplete="off">
            <span class="header__search-icon">${getSvgIcon('search')}</span>
            <div class="search-suggestions" id="search-suggestions"></div>
          </div>
          <div class="header__actions">
            <a href="wholesale.html" class="header__action header__action--desktop header__action--wholesale">
              ${getSvgIcon('wholesale')}
              <span data-wholesale-label>Опт</span>
              <span class="header__wholesale-badge" data-wholesale-badge style="display:none">✓</span>
            </a>
            <a href="favorites.html" class="header__action header__action--desktop">
              ${getSvgIcon('heart')}
              <span>Избранное</span>
            </a>
            <a href="cart.html" class="header__action">
              ${getSvgIcon('cart')}
              <span class="header__badge" style="display:none">0</span>
              <span>Корзина</span>
            </a>
          </div>
        </div>
      </header>
    </div>`;
}

function initNavMenu() {
  const root = document.getElementById('site-nav-menu');
  const panel = document.getElementById('nav-menu-panel');
  const toggles = [document.getElementById('nav-menu-toggle'), document.getElementById('nav-catalog-toggle')].filter(Boolean);
  if (!root || !panel || !toggles.length) return;

  let closeTimer = null;
  const isDesktop = () => window.matchMedia('(min-width: 768px)').matches;

  function setOpen(open) {
    root.classList.toggle('is-open', open);
    panel.hidden = !open;
    toggles.forEach(btn => btn.setAttribute('aria-expanded', open ? 'true' : 'false'));
  }

  function openMenu() {
    clearTimeout(closeTimer);
    setOpen(true);
  }

  function closeMenu(delay = 0) {
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setOpen(false), delay);
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!root.classList.contains('is-open'));
    });
    btn.addEventListener('mouseenter', () => {
      if (isDesktop()) openMenu();
    });
  });

  root.addEventListener('mouseenter', () => {
    if (isDesktop()) openMenu();
  });
  root.addEventListener('mouseleave', () => {
    if (isDesktop()) closeMenu(180);
  });

  document.addEventListener('click', (e) => {
    if (!root.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
}

function renderBottomNav() {
  return `
    <nav class="bottom-nav">
      <a href="index.html" class="bottom-nav__item" data-nav="home">
        ${getSvgIcon('home')}
        <span>Главная</span>
      </a>
      <a href="catalog.html" class="bottom-nav__item" data-nav="catalog">
        ${getSvgIcon('catalog')}
        <span>Каталог</span>
      </a>
      <a href="cart.html" class="bottom-nav__item" data-nav="cart">
        ${getSvgIcon('cart')}
        <span class="bottom-nav__badge" style="display:none">0</span>
        <span>Корзина</span>
      </a>
      <a href="favorites.html" class="bottom-nav__item" data-nav="favorites">
        ${getSvgIcon('heart')}
        <span>Избранное</span>
      </a>
      <a href="wholesale.html" class="bottom-nav__item" data-nav="wholesale">
        ${getSvgIcon('wholesale')}
        <span>Опт</span>
      </a>
    </nav>`;
}

function renderFooter() {
  return `
    <footer class="footer" id="contacts">
      <div class="container">
        <div class="footer__grid">
          <div class="footer__col">
            <div class="footer__col-title">Каталог</div>
            <ul>
              ${CATEGORIES.map(c => `<li><a href="catalog.html?cat=${c.id}">${c.name}</a></li>`).join('')}
            </ul>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">Покупателям</div>
            <ul>
              <li><a href="wholesale.html">Оптовым клиентам</a></li>
              <li><a href="docs.html#delivery">Доставка и оплата</a></li>
              <li><a href="docs.html#return">Возврат товара</a></li>
              <li><a href="docs.html">Документы</a></li>
              <li><a href="#" onclick="downloadPriceList();return false">Прайс-лист</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">Компания</div>
            <ul>
              <li><a href="index.html#about">О нас</a></li>
              <li><a href="#contacts">Контакты</a></li>
              <li><a href="docs.html#privacy">Политика конфиденциальности</a></li>
              <li><a href="docs.html#offer">Оферта</a></li>
            </ul>
          </div>
          <div class="footer__col">
            <div class="footer__col-title">Контакты</div>
            <ul>
              <li><a href="tel:${SITE.phone.replace(/\D/g,'')}">${SITE.phone}</a></li>
              <li><a href="mailto:${SITE.email}">${SITE.email}</a></li>
              <li><a href="checkout.html">Оставить заявку</a></li>
              <li><a href="${SITE.wbSeller}" target="_blank" rel="noopener">Wildberries</a></li>
              <li><a href="${SITE.ozon}" target="_blank" rel="noopener">Ozon</a></li>
            </ul>
          </div>
        </div>
        <div class="footer__bottom">
          <div class="footer__logo">
            <img src="assets/brand/logo-full.png" alt="GETSTUFF" class="footer__logo-img">
          </div>
          <p>© 2026 GETSTUFF · ${typeof LEGAL !== 'undefined' ? LEGAL.shortName : 'ИП'} · <a href="docs.html">Документы</a></p>
        </div>
      </div>
    </footer>`;
}

function renderLayout(content) {
  document.body.insertAdjacentHTML('afterbegin', renderHeader());
  document.body.insertAdjacentHTML('beforeend', renderFooter() + renderBottomNav());
  initNavMenu();
  if (typeof updateWholesaleUI === 'function') updateWholesaleUI();
}

function initCatalogPage() {
  const params = new URLSearchParams(window.location.search);
  const catFilter = params.get('cat');
  const searchQuery = params.get('q');

  let filtered = [...PRODUCTS];

  if (catFilter) {
    filtered = filtered.filter(p => p.category === catFilter);
    const catName = getCategoryName(catFilter);
    document.getElementById('page-title').textContent = catName || 'Каталог';
    document.getElementById('breadcrumb-current').textContent = catName || 'Каталог';
  }

  if (searchQuery) {
    filtered = searchProducts(searchQuery);
    document.getElementById('page-title').textContent = `Поиск: «${searchQuery}»`;
    document.getElementById('breadcrumb-current').textContent = searchQuery;
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = searchQuery;
  }

  function sortMmLabels(values) {
    return [...values].sort((a, b) => {
      const na = parseFloat(String(a).replace(',', '.')) || 0;
      const nb = parseFloat(String(b).replace(',', '.')) || 0;
      return na - nb;
    });
  }

  function productFinish(p) {
    return p.specs?.coating || p.specs?.material || '';
  }

  const filters = { finishes: new Set(), diameters: new Set(), lengths: new Set() };
  PRODUCTS.forEach(p => {
    const finish = productFinish(p);
    if (finish) filters.finishes.add(finish);
    if (p.specs?.diameter) filters.diameters.add(p.specs.diameter);
    if (p.specs?.length) filters.lengths.add(p.specs.length);
  });

  const filtersPanel = document.getElementById('filters-panel');
  if (filtersPanel) {
    filtersPanel.innerHTML = `
      <div class="filter-group">
        <div class="filter-group__title">Категория</div>
        ${CATEGORIES.map(c => `
          <label class="filter-option">
            <input type="checkbox" name="category" value="${c.id}" ${catFilter === c.id ? 'checked' : ''}>
            ${c.name}
          </label>
        `).join('')}
      </div>
      <div class="filter-group">
        <div class="filter-group__title">Покрытие</div>
        ${[...filters.finishes].sort((a, b) => a.localeCompare(b, 'ru')).map(m => `
          <label class="filter-option">
            <input type="checkbox" name="finish" value="${m}"> ${m}
          </label>
        `).join('')}
      </div>
      <div class="filter-group">
        <div class="filter-group__title">Диаметр</div>
        ${sortMmLabels(filters.diameters).map(d => `
          <label class="filter-option">
            <input type="checkbox" name="diameter" value="${d}"> ${d}
          </label>
        `).join('')}
      </div>
      <div class="filter-group">
        <div class="filter-group__title">Длина</div>
        ${sortMmLabels(filters.lengths).map(l => `
          <label class="filter-option">
            <input type="checkbox" name="length" value="${l}"> ${l}
          </label>
        `).join('')}
      </div>
      <div class="filter-group">
        <div class="filter-group__title">Цена, ₽</div>
        <div class="price-range">
          <input type="number" id="price-min" placeholder="от" min="0">
          <span>—</span>
          <input type="number" id="price-max" placeholder="до">
        </div>
      </div>
      <div class="filter-group">
        <label class="filter-option">
          <input type="checkbox" id="in-stock-only"> Только в наличии
        </label>
      </div>
      <button class="btn btn--primary btn--block" id="apply-filters">Применить</button>
    `;
  }

  function applyFilters() {
    let result = catFilter ? getProductsByCategory(catFilter) : [...PRODUCTS];
    if (searchQuery) result = searchProducts(searchQuery);

    const categories = [...document.querySelectorAll('input[name="category"]:checked')].map(el => el.value);
    const finishes = [...document.querySelectorAll('input[name="finish"]:checked')].map(el => el.value);
    const diameters = [...document.querySelectorAll('input[name="diameter"]:checked')].map(el => el.value);
    const lengths = [...document.querySelectorAll('input[name="length"]:checked')].map(el => el.value);
    const priceMin = parseInt(document.getElementById('price-min')?.value) || 0;
    const priceMax = parseInt(document.getElementById('price-max')?.value) || Infinity;
    const inStockOnly = document.getElementById('in-stock-only')?.checked;

    if (categories.length) result = result.filter(p => categories.includes(p.category));
    if (finishes.length) result = result.filter(p => finishes.includes(productFinish(p)));
    if (diameters.length) result = result.filter(p => diameters.includes(p.specs?.diameter));
    if (lengths.length) result = result.filter(p => lengths.includes(p.specs?.length));
    result = result.filter(p => p.price >= priceMin && p.price <= priceMax);
    if (inStockOnly) result = result.filter(p => p.inStock);

    const sort = document.getElementById('sort-select')?.value;
    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    renderCatalogGrid(result);
  }

  function renderCatalogGrid(products) {
    const grid = document.getElementById('catalog-grid');
    const count = document.getElementById('products-count');
    if (count) count.textContent = `Найдено: ${products.length} товаров`;
    if (!grid) return;

    if (products.length === 0) {
      grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--gray-400)">Товары не найдены</p>';
      return;
    }
    grid.innerHTML = products.map(p => renderProductCard(p)).join('');
  }

  document.getElementById('apply-filters')?.addEventListener('click', applyFilters);
  document.getElementById('sort-select')?.addEventListener('change', applyFilters);
  document.getElementById('filters-toggle')?.addEventListener('click', () => {
    document.getElementById('filters-panel')?.classList.toggle('active');
  });

  renderCatalogGrid(filtered);
}

function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const product = getProductById(id);
  if (!product) {
    document.getElementById('product-container').innerHTML = '<p>Товар не найден</p>';
    return;
  }

  document.title = product.name + ' — GETSTUFF';

  const specsRows = Object.entries(product.specs).map(([key, val]) => {
    const labels = { diameter: 'Диаметр', length: 'Длина', material: 'Материал', coating: 'Покрытие', standard: 'Стандарт', pack: 'Упаковка', size: 'Размер', thickness: 'Толщина' };
    return `<tr><td>${labels[key] || key}</td><td>${val}</td></tr>`;
  }).join('');

  document.getElementById('product-container').innerHTML = `
    <div class="product-gallery">
      <div class="product-gallery__main" id="gallery-main">
        <img src="${getLocalProductImagePath(product.wbId)}" data-remote="${getWbRemoteImageUrl(product.wbId)}" alt="${product.name}" id="gallery-main-img" ${imgOnErrorAttr()}>
      </div>
      <div class="product-gallery__thumbs">
        ${Array.from({ length: Math.min(product.pics || product.images?.length || 1, 3) }, (_, i) => {
          const n = i + 1;
          const local = getLocalProductImagePath(product.wbId, n);
          const remote = getWbRemoteImageUrl(product.wbId, n);
          return `
          <button class="product-gallery__thumb${i === 0 ? ' active' : ''}" onclick="setGalleryImage('${local}', this, '${remote}')">
            <img src="${local}" data-remote="${remote}" alt="" ${imgOnErrorAttr()}>
          </button>`;
        }).join('')}
      </div>
    </div>
    <div class="product-info">
      <div class="product-info__sku">Артикул WB: ${product.sku}</div>
      <h1 class="product-info__name">${product.name}</h1>
      <div class="product-info__rating">
        <span class="product-card__stars">${renderStars(product.rating)}</span>
        ${product.rating} (${product.reviews} отзывов)
      </div>
      ${renderProductPrices(product, true)}
      ${typeof renderWholesalePriceNote === 'function' && isWholesaleBuyer() ? `
      <div class="product-info__tiers">
        <div class="product-info__tier"><span>Розница</span><strong>${formatPrice(getProductPriceForTier(product, 'retail'))}</strong></div>
        <div class="product-info__tier product-info__tier--opt"><span>Опт</span><strong>${formatPrice(getProductPriceForTier(product, 'wholesale'))}</strong></div>
        <div class="product-info__tier product-info__tier--large"><span>Крупный опт</span><strong>${formatPrice(getProductPriceForTier(product, 'large'))}</strong></div>
        <div class="product-info__tier product-info__tier--box"><span>В коробке</span><strong>${getBoxQty(product)} шт</strong></div>
      </div>` : ''}
      <div class="product-info__wb-note">Цена на Wildberries: ${formatPrice(getWbPrice(product))}</div>
      <div class="product-info__stock">${product.inStock ? 'В наличии на складе' : 'Под заказ'}</div>

      <div class="qty-selector">
        <button onclick="changeQty(-1)">−</button>
        <input type="number" id="product-qty" value="1" min="1" max="99">
        <button onclick="changeQty(1)">+</button>
      </div>

      <div class="product-actions">
        <button class="btn btn--primary" onclick="addToCart('${product.id}', parseInt(document.getElementById('product-qty').value))">В корзину (−${Math.round(SITE_DISCOUNT * 100)}%)</button>
        <a href="${getWbProductUrl(product.wbId)}" target="_blank" rel="noopener" class="btn btn--wb btn--wb-lg">Купить на Wildberries</a>
        <button class="btn btn--icon" onclick="toggleFavorite('${product.id}')">♡</button>
      </div>
      ${renderBuyOptions({ compact: true })}

      <div class="quick-order">
        <div class="quick-order__title">⚡ Быстрый заказ</div>
        <form class="quick-order__form" onsubmit="submitQuickOrder(event, '${product.id}')">
          <input type="tel" placeholder="+7 (___) ___-__-__" required>
          <button type="submit" class="btn btn--accent btn--sm">Заказать</button>
          <label class="form-consent" style="flex:1 1 100%;margin-top:8px">
            <input type="checkbox" name="pd_consent" required>
            <span>Согласие на <a href="docs.html#consent" target="_blank" rel="noopener">обработку данных</a></span>
          </label>
        </form>
      </div>

      ${product.description ? `<p class="product-desc">${product.description}</p>` : ''}

      <h3 style="font-size:0.9375rem;font-weight:700;margin-bottom:12px">Характеристики</h3>
      <table class="specs-table">${specsRows}</table>
    </div>`;
}

function setGalleryImage(src, thumb, remote = '') {
  const img = document.getElementById('gallery-main-img');
  if (img) {
    img.dataset.step = '';
    img.dataset.remote = remote || '';
    img.style.display = '';
    img.src = src;
  }
  document.querySelectorAll('.product-gallery__thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function changeQty(delta) {
  const input = document.getElementById('product-qty');
  if (!input) return;
  input.value = Math.max(1, Math.min(99, parseInt(input.value) + delta));
}

function initCartPage() {
  const cart = getCart();
  const container = document.getElementById('cart-container');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty__icon">🛒</div>
        <div class="cart-empty__title">Корзина пуста</div>
        <div class="cart-empty__text">Добавьте товары из каталога</div>
        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
      </div>`;
    return;
  }

  let itemsHtml = cart.map(item => {
    const p = getProductById(item.id);
    if (!p) return '';
    return `
      <div class="cart-item">
        <div class="cart-item__img">${renderProductImage(p)}</div>
        <div class="cart-item__info">
          <div class="cart-item__name">${p.name}</div>
          <div class="cart-item__sku">${p.sku}</div>
          <div class="cart-item__bottom">
            <div class="qty-selector" style="margin:0">
              <button onclick="updateCartQty('${item.id}', ${item.qty - 1});location.reload()">−</button>
              <input type="number" value="${item.qty}" readonly>
              <button onclick="updateCartQty('${item.id}', ${item.qty + 1});location.reload()">+</button>
            </div>
            <div class="cart-item__price">${formatPrice(getSitePrice(p) * item.qty)}</div>
            ${typeof getBoxQty === 'function' && isWholesaleBuyer() ? `<div class="cart-item__box">${getBoxesCount(p, item.qty)} кор. × ${getBoxQty(p)} шт</div>` : ''}
          </div>
          <div class="cart-item__remove" onclick="removeFromCart('${item.id}');location.reload()">Удалить</div>
        </div>
      </div>`;
  }).join('');

  const savedCity = localStorage.getItem('getstuff_city') || '';
  const summary = renderOrderSummaryRows(cart, savedCity);

  container.innerHTML = itemsHtml + `
    <div class="cart-summary">
      <div class="form-group" style="margin-bottom:12px">
        <label for="cart-city">Город доставки</label>
        <input type="text" id="cart-city" placeholder="Например: Гатчина, Краснодар, Москва" value="${savedCity}">
      </div>
      <div id="cart-summary">${summary.html}</div>
      <a href="checkout.html" class="btn btn--primary btn--block" style="margin-top:16px">Оформить заказ</a>
    </div>`;

  const cityInput = document.getElementById('cart-city');
  cityInput?.addEventListener('input', () => {
    localStorage.setItem('getstuff_city', cityInput.value);
    updateSummaryByCity('cart-city', 'cart-summary');
  });
}

function initCheckoutPage() {
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  const summary = document.getElementById('checkout-summary');
  const savedCity = localStorage.getItem('getstuff_city') || '';
  const cityInput = document.getElementById('city');
  if (cityInput && savedCity) cityInput.value = savedCity;

  if (summary) {
    const result = renderOrderSummaryRows(cart, cityInput?.value || savedCity);
    summary.innerHTML = result.html;
  }

  cityInput?.addEventListener('input', () => {
    localStorage.setItem('getstuff_city', cityInput.value);
    updateSummaryByCity('city', 'checkout-summary');
  });
}

function initAccountPage() {
  const wsUser = typeof getWholesaleUser === 'function' ? getWholesaleUser() : null;
  const header = document.querySelector('.account-header');
  if (header && wsUser) {
    header.querySelector('.account-header__name').textContent = wsUser.company || wsUser.name;
    header.querySelector('.account-header__email').textContent = wsUser.email;
    const bonus = header.querySelector('.account-bonus');
    if (bonus) {
      bonus.innerHTML = `
        <span class="account-bonus__label">📦 Оптовый покупатель</span>
        <a href="wholesale.html" class="account-bonus__value" style="font-size:0.875rem">Прайс-лист →</a>`;
    }
  }

  const orders = [...MOCK_ORDERS, ...JSON.parse(localStorage.getItem('getstuff_orders') || '[]')];
  const ordersEl = document.getElementById('orders-list');
  if (ordersEl) {
    ordersEl.innerHTML = orders.map(o => `
      <div class="order-card">
        <div class="order-card__header">
          <span class="order-card__id">${o.id}</span>
          <span class="order-status order-status--${o.status}">${o.statusText}</span>
        </div>
        <div class="order-card__items">${o.items}</div>
        <div class="order-card__footer">
          <span class="order-card__total">${formatPrice(o.total)}</span>
          <span class="order-card__date">${o.date}</span>
        </div>
      </div>
    `).join('');
  }
}

function initFavoritesPage() {
  const favs = getFavorites();
  const grid = document.getElementById('favorites-grid');
  if (!grid) return;

  if (favs.length === 0) {
    grid.innerHTML = `
      <div class="cart-empty" style="grid-column:1/-1">
        <div class="cart-empty__icon">♡</div>
        <div class="cart-empty__title">Избранное пусто</div>
        <div class="cart-empty__text">Добавляйте товары, нажимая на сердечко</div>
        <a href="catalog.html" class="btn btn--primary">Перейти в каталог</a>
      </div>`;
    return;
  }

  grid.innerHTML = favs.map(id => {
    const p = getProductById(id);
    return p ? renderProductCard(p) : '';
  }).join('');
}

function initHomePage() {
  renderPromoBanners();
  renderCategoryTiles();
  initDeliveryZones();
  initWholesaleSection();

  const hotEl = document.getElementById('hot-products');
  if (hotEl) {
    hotEl.innerHTML = getSaleProducts().slice(0, 8).map(p => renderProductCard(p)).join('');
  }

  initProductTabs();
}

function renderPromoBanners() {
  const el = document.getElementById('promo-banners');
  if (!el) return;
  el.innerHTML = PROMO_BANNERS.map((b, i) => `
    <a href="${b.link}" class="promo-banner${i > 0 ? ' promo-banner--sm' : ''}">
      <div class="promo-banner__bg" style="background-image:url('${b.image || getLocalProductImagePath(b.wbId)}')"></div>
      <div class="promo-banner__content">
        <div class="promo-banner__title">${b.title}</div>
        <div class="promo-banner__subtitle">${b.subtitle}</div>
        <span class="promo-banner__cta">${b.cta || 'Купить'}</span>
      </div>
      ${b.accent ? '<span class="promo-banner__badge">АКЦИЯ</span>' : ''}
    </a>
  `).join('');
}

function renderCategoryTiles() {
  const el = document.getElementById('categories-grid');
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <a href="catalog.html?cat=${c.id}" class="category-card">
      <div class="category-card__bg" style="background-image:url('${getLocalProductImagePath(c.wbId)}')"></div>
      <div class="category-card__label">${c.name}</div>
    </a>
  `).join('');
}

function initProductTabs() {
  const tabs = document.querySelectorAll('.product-tab');
  const grid = document.getElementById('tab-products');
  if (!tabs.length || !grid) return;

  const tabData = {
    hits: () => getPopularProducts(),
    sale: () => getSaleProducts(),
    new: () => getNewProducts(),
  };

  function showTab(name) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
    const products = tabData[name] ? tabData[name]() : [];
    grid.innerHTML = products.map(p => renderProductCard(p)).join('');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => showTab(tab.dataset.tab));
  });

  showTab('hits');
}
