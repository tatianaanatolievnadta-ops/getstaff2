/**
 * Отправка заявок на orderApiUrl (Google Apps Script / Worker → Telegram).
 * Токен бота на клиенте не используется.
 */

async function submitOrderToBackend(payload) {
  const url = (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.orderApiUrl) || '';
  if (!url) {
    console.warn('SITE_CONFIG.orderApiUrl не задан — заявка только локально');
    return { ok: false, skipped: true, error: 'no_api_url' };
  }

  const body = JSON.stringify(payload);

  // 1) Обычный POST (если сервер отвечает с CORS)
  try {
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.ok) return { ok: true };
    // Если CORS/редирект Google мешает — уйдём в fallback ниже
    if (res.ok === false && res.type !== 'opaque') {
      // продолжаем
    } else if (data && data.ok) {
      return { ok: true };
    }
  } catch (_) {
    // CORS часто падает здесь на Google Apps Script
  }

  // 2) Fallback: no-cors + text/plain (браузер не даёт прочитать ответ, но запрос уходит)
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    return { ok: true, opaque: true };
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
