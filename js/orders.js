/**
 * Отправка заявок:
 * 1) Telegram через orderApiUrl (Worker / Apps Script), если доступен
 * 2) Email через FormSubmit (работает со статического сайта)
 * Токен бота на клиенте НЕ хранится.
 */

function formatOrderText(payload) {
  const lines = [
    payload.type === 'wholesale' ? 'ЗАЯВКА НА ОПТ' : payload.type === 'quick' ? 'БЫСТРЫЙ ЗАКАЗ' : 'ЗАЯВКА С САЙТА',
    payload.id ? ('N ' + payload.id) : null,
    '',
    payload.name ? ('Имя: ' + payload.name) : null,
    payload.company ? ('Компания: ' + payload.company) : null,
    payload.inn ? ('ИНН: ' + payload.inn) : null,
    payload.phone ? ('Телефон: ' + payload.phone) : null,
    payload.email ? ('Email: ' + payload.email) : null,
    payload.city ? ('Город: ' + payload.city) : null,
    payload.address ? ('Адрес/ПВЗ: ' + payload.address) : null,
    payload.priceTierName ? ('Тариф: ' + payload.priceTierName) : null,
    payload.subtotal != null ? ('Товары: ' + Math.round(payload.subtotal) + ' руб.') : null,
    payload.deliveryCost != null
      ? ('Доставка (примерно'
        + (payload.deliveryZone ? ', ' + payload.deliveryZone : '')
        + ', Ozon-оценка): ' + Math.round(payload.deliveryCost) + ' руб.')
      : null,
    payload.total != null ? ('Итого с доставкой (примерно): ' + Math.round(payload.total) + ' руб.') : null,
    '',
    payload.items || null,
    payload.productName ? ('Товар: ' + payload.productName) : null,
    payload.comment ? ('Комментарий: ' + payload.comment) : null,
  ];
  return lines.filter(Boolean).join('\n');
}

async function sendOrderEmail(payload) {
  const email = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.orderEmail) || '';
  if (!email) return { ok: false, skipped: true, error: 'no_email' };

  try {
    const res = await fetch('https://formsubmit.co/ajax/' + encodeURIComponent(email), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: 'GETSTUFF: ' + (payload.id || 'новая заявка'),
        _template: 'table',
        type: payload.type || 'checkout',
        id: payload.id || '',
        name: payload.name || '',
        company: payload.company || '',
        phone: payload.phone || '',
        email: payload.email || '',
        city: payload.city || '',
        address: payload.address || '',
        total: payload.total != null ? String(payload.total) : '',
        message: formatOrderText(payload),
      }),
    });
    const data = await res.json().catch(() => ({}));
    // FormSubmit returns success: true after activation; first time may ask to confirm
    if (res.ok && (data.success === 'true' || data.success === true || data.message)) {
      return { ok: true, needsConfirm: /confirm|activate|check your email/i.test(String(data.message || '')) };
    }
    return { ok: false, error: data.message || ('http_' + res.status) };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

async function sendOrderTelegram(payload) {
  const url = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.orderApiUrl) || '';
  if (!url) return { ok: false, skipped: true, error: 'no_api_url' };

  try {
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data = {};
    try { data = JSON.parse(text); } catch (_) {}
    if (res.ok && data.ok) return { ok: true };
    // Access denied / HTML from Google etc.
    if (/доступ|access|Tarvitset|DOCTYPE html/i.test(text)) {
      return { ok: false, error: 'endpoint_access_denied' };
    }
    return { ok: false, error: data.error || ('http_' + res.status) };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

async function submitOrderToBackend(payload) {
  const [emailRes, tgRes] = await Promise.all([
    sendOrderEmail(payload),
    sendOrderTelegram(payload),
  ]);

  return {
    ok: !!(emailRes.ok || tgRes.ok),
    email: emailRes,
    telegram: tgRes,
    skipped: !!(emailRes.skipped && tgRes.skipped),
  };
}

function showOrderSuccess(opts = {}) {
  const phone = (typeof SITE !== 'undefined' && SITE.phone) || '+7 (911) 910-33-44';
  const phoneHref = 'tel:' + phone.replace(/\D/g, '');
  const title = opts.title || 'Заявка отправлена';
  const text =
    opts.text ||
    'Менеджер уже получил заявку и свяжется с вами. Обычно отвечаем в течение рабочего дня, не позднее 24 часов. Бот и группу открывать не нужно.';

  let where = '';
  if (opts.channels) {
    where = `<p class="order-success__hint">${opts.channels}</p>`;
  }

  let overlay = document.getElementById('order-success-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'order-success-overlay';
    overlay.className = 'order-success';
    document.body.appendChild(overlay);
  }

  overlay.innerHTML = `
    <div class="order-success__card" role="dialog" aria-modal="true">
      <div class="order-success__icon">✓</div>
      <h2 class="order-success__title">${title}</h2>
      <p class="order-success__text">${text}</p>
      ${where}
      <div class="order-success__actions">
        <a class="btn btn--accent" href="${phoneHref}">Позвонить ${phone}</a>
        <a class="btn btn--outline" href="index.html">На главную</a>
      </div>
    </div>`;
  overlay.classList.add('order-success--open');
}

function hideOrderSuccess() {
  const overlay = document.getElementById('order-success-overlay');
  if (overlay) overlay.classList.remove('order-success--open');
}

function describeOrderChannels(res) {
  const phone = (typeof SITE !== 'undefined' && SITE.phone) || '+7 (911) 910-33-44';
  if (res.ok) {
    return 'Заявка ушла менеджеру. Открывать Telegram не нужно — мы сами напишем или позвоним.';
  }
  return `Автоотправка сбоя. Позвоните <a href="tel:${phone.replace(/\D/g, '')}">${phone}</a> — заявка сохранена в браузере.`;
}
