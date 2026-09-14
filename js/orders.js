/**
 * Отправка заявок на orderApiUrl (Cloudflare Worker → Telegram).
 * Токен бота на клиенте не используется.
 */

async function submitOrderToBackend(payload) {
  const url = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.orderApiUrl) || '';
  if (!url) {
    console.warn('SITE_CONFIG.orderApiUrl не задан — заявка только локально');
    return { ok: false, skipped: true, error: 'no_api_url' };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || `http_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

function showOrderSuccess(opts = {}) {
  const botUrl =
    (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.telegramBotUrl) ||
    'https://t.me/zayavkigetstuff_bot';
  const title = opts.title || 'Заявка отправлена';
  const text =
    opts.text ||
    'Менеджер свяжется с вами по телефону или в мессенджере. Обычно отвечаем в течение рабочего дня, не позднее 24 часов.';

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
      <p class="order-success__hint">Можно написать нам в Telegram — так быстрее согласовать оплату и доставку.</p>
      <div class="order-success__actions">
        <a class="btn btn--accent" href="${botUrl}" target="_blank" rel="noopener">Написать в Telegram</a>
        <a class="btn btn--outline" href="index.html">На главную</a>
      </div>
    </div>`;
  overlay.classList.add('order-success--open');
}

function hideOrderSuccess() {
  const overlay = document.getElementById('order-success-overlay');
  if (overlay) overlay.classList.remove('order-success--open');
}
