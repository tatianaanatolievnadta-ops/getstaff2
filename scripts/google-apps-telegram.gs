/**
 * Google Apps Script — простой приём заявок в Telegram без Cloudflare.
 *
 * 1. Откройте https://script.google.com → Новый проект
 * 2. Вставьте этот код
 * 3. Проект → Настройки проекта → Свойства скрипта:
 *      BOT_TOKEN = (токен от BotFather)
 *      CHAT_ID   = (ваш chat_id после /start боту)
 * 4. Развернуть → Новое развёртывание → Тип: Веб-приложение
 *      Выполнять от: Меня
 *      Доступ: Все
 * 5. Скопируйте URL веб-приложения в js/config.js → orderApiUrl
 */

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chatId = props.getProperty('CHAT_ID');
  if (!token || !chatId) {
    return json_({ ok: false, error: 'server_not_configured' });
  }

  let body = {};
  try {
    body = JSON.parse(e.postData.contents || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'invalid_json' });
  }

  const text = formatOrder_(body);
  const url = 'https://api.telegram.org/bot' + token + '/sendMessage';
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({
      chat_id: chatId,
      text: text,
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });

  const data = JSON.parse(res.getContentText() || '{}');
  if (!data.ok) {
    return json_({ ok: false, error: 'telegram_failed', detail: data });
  }
  return json_({ ok: true });
}

function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

function formatOrder_(b) {
  const lines = [];
  lines.push(b.type === 'wholesale' ? '📦 ЗАЯВКА НА ОПТ' : b.type === 'quick' ? '⚡ БЫСТРЫЙ ЗАКАЗ' : '🆕 ЗАЯВКА С САЙТА');
  if (b.id) lines.push('№ ' + b.id);
  lines.push('');
  if (b.name) lines.push('Имя: ' + b.name);
  if (b.company) lines.push('Компания: ' + b.company);
  if (b.inn) lines.push('ИНН: ' + b.inn);
  if (b.phone) lines.push('Телефон: ' + b.phone);
  if (b.email) lines.push('Email: ' + b.email);
  if (b.city) lines.push('Город: ' + b.city);
  if (b.address) lines.push('Адрес/ПВЗ: ' + b.address);
  if (b.priceTierName) lines.push('Тариф: ' + b.priceTierName);
  if (b.subtotal != null) lines.push('Товары: ' + money_(b.subtotal));
  if (b.deliveryCost != null) lines.push('Доставка (оценка): ' + money_(b.deliveryCost));
  if (b.total != null) lines.push('Итого: ' + money_(b.total));
  lines.push('');
  if (b.items) lines.push('Состав:\n' + b.items);
  if (b.productName) lines.push('Товар: ' + b.productName);
  if (b.comment) lines.push('Комментарий: ' + b.comment);
  lines.push('');
  lines.push('Ответьте клиенту и пришлите ссылку на оплату.');
  return lines.join('\n');
}

function money_(n) {
  return Math.round(Number(n) || 0).toLocaleString('ru-RU') + ' ₽';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
