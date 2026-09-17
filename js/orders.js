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
  const botUrl =
    (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.telegramBotUrl) ||
    'https://t.me/zayavkigetstuff_bot';
  const email = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.orderEmail) || '';
  const title = opts.title || 'Заявка отправлена';
  const text =
    opts.text ||
    'Менеджер свяжется с вами. Обычно отвечаем в течение рабочего дня, не позднее 24 часов.';

  let where = '';
  if (opts.channels) {
    where = `<p class="order-success__hint"><strong>Куда ушла заявка:</strong><br>${opts.channels}</p>`;
  } else {
    where = `<p class="order-success__hint">Заявки смотрите в Telegram-боте <a href="${botUrl}" target="_blank" rel="noopener">@zayavkigetstuff_bot</a>${email ? ' и на почте <strong>' + email + '</strong>' : ''}.</p>`;
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
        <a class="btn btn--accent" href="${botUrl}" target="_blank" rel="noopener">Открыть Telegram-бот</a>
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
  const parts = [];
  if (res.telegram && res.telegram.ok) parts.push('Telegram-бот @zayavkigetstuff_bot (личные сообщения бота)');
  if (res.email && res.email.ok) {
    const email = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.orderEmail) || 'email';
    if (res.email.needsConfirm) {
      parts.push('Email: пришло письмо подтверждения на ' + email + ' — откройте и нажмите Confirm');
    } else {
      parts.push('Email: ' + email);
    }
  }
  if (!parts.length) {
    return 'Автоотправка не прошла. Напишите нам в Telegram или позвоните — заявка сохранена в браузере.';
  }
  return parts.join('<br>');
}
