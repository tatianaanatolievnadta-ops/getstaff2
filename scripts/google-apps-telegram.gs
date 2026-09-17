/**
 * GETSTUFF → Telegram (группа «ЗАЯВКИ с сайта GETSUFF»)
 * CHAT_ID группы: -1004339261263
 * Инвайт: https://t.me/+thCtFYz7sP8yMTEy
 *
 * 1) https://script.google.com → Новый проект
 * 2) Вставьте ВЕСЬ этот код, сохраните
 * 3) Слева шестерёнка «Настройки проекта» → «Свойства скрипта» → добавить:
 *      BOT_TOKEN = токен от @BotFather (zayavkigetstuff_bot)
 *      CHAT_ID   = -1004339261263
 * 4) Справа «Развернуть» → «Новое развёртывание»
 *      Тип: Веб-приложение
 *      Выполнять как: Я
 *      У кого есть доступ: Все
 * 5) URL вида https://script.google.com/macros/s/XXXX/exec → в js/config.js → orderApiUrl
 */

function doPost(e) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chatId = props.getProperty('CHAT_ID') || '-1004339261263';
  if (!token) {
    return json_({ ok: false, error: 'no_bot_token' });
  }

  let body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
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

function doGet() {
  return json_({ ok: true, service: 'getstuff-orders' });
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

/** Запустите раз из редактора: проверить, что бот пишет вам. */
function testSend() {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('BOT_TOKEN');
  const chatId = props.getProperty('CHAT_ID') || '-1004339261263';
  UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ chat_id: chatId, text: 'Тест GETSTUFF Apps Script OK' }),
  });
}
