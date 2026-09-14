/**
 * Cloudflare Worker: принимает заявки с сайта и шлёт в Telegram.
 * Секреты: BOT_TOKEN, CHAT_ID (wrangler secret put ...)
 *
 * Деплой:
 *   cd worker
 *   npx wrangler login
 *   npx wrangler secret put BOT_TOKEN
 *   npx wrangler secret put CHAT_ID
 *   npx wrangler deploy
 */

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== 'POST') {
      return json({ ok: false, error: 'method_not_allowed' }, 405, cors);
    }

    if (!env.BOT_TOKEN || !env.CHAT_ID) {
      return json({ ok: false, error: 'server_not_configured' }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: 'invalid_json' }, 400, cors);
    }

    const text = formatOrder(body);
    const tgUrl = `https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage`;
    const tgRes = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.CHAT_ID,
        text,
        disable_web_page_preview: true,
      }),
    });

    const tgData = await tgRes.json().catch(() => ({}));
    if (!tgRes.ok || !tgData.ok) {
      return json({ ok: false, error: 'telegram_failed', detail: tgData }, 502, cors);
    }

    return json({ ok: true }, 200, cors);
  },
};

function formatOrder(b) {
  const lines = [
    b.type === 'wholesale' ? '📦 ЗАЯВКА НА ОПТ' : b.type === 'quick' ? '⚡ БЫСТРЫЙ ЗАКАЗ' : '🆕 ЗАЯВКА С САЙТА',
    b.id ? `№ ${b.id}` : null,
    '',
    b.name ? `Имя: ${b.name}` : null,
    b.company ? `Компания: ${b.company}` : null,
    b.inn ? `ИНН: ${b.inn}` : null,
    b.phone ? `Телефон: ${b.phone}` : null,
    b.email ? `Email: ${b.email}` : null,
    b.city ? `Город: ${b.city}` : null,
    b.address ? `Адрес/ПВЗ: ${b.address}` : null,
    b.priceTierName ? `Тариф: ${b.priceTierName}` : null,
    b.subtotal != null ? `Товары: ${formatMoney(b.subtotal)}` : null,
    b.deliveryCost != null ? `Доставка (оценка): ${formatMoney(b.deliveryCost)}` : null,
    b.total != null ? `Итого: ${formatMoney(b.total)}` : null,
    '',
    b.items ? `Состав:\n${b.items}` : null,
    b.productName ? `Товар: ${b.productName}` : null,
    b.comment ? `Комментарий: ${b.comment}` : null,
    '',
    'Ответьте клиенту и пришлите ссылку на оплату.',
  ];
  return lines.filter((x) => x != null && x !== '').join('\n');
}

function formatMoney(n) {
  return `${Math.round(Number(n) || 0).toLocaleString('ru-RU')} ₽`;
}

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  });
}
