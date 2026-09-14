# Подключение заявок к Telegram (@zayavkigetstuff_bot)

Токен бота **нельзя** класть в `js/` — сайт на GitHub Pages публичный.

## Шаг 1. Привязать чат менеджера

1. Откройте https://t.me/zayavkigetstuff_bot
2. Нажмите **Start** / напишите `/start`
3. Узнайте свой `chat_id`: напишите боту [@userinfobot](https://t.me/userinfobot) — он пришлёт Id  
   (или перешлите любое сообщение боту-хелперу)
4. Сообщите `chat_id` (число вроде `123456789`) — пропишем в секрет

## Шаг 2. Бэкенд (выберите один)

### A) Google Apps Script (проще всего, бесплатно)

1. Файл шаблона: `scripts/google-apps-telegram.gs`
2. https://script.google.com → новый проект → вставить код
3. Свойства скрипта: `BOT_TOKEN`, `CHAT_ID`
4. Развернуть как **веб-приложение** (доступ: Все)
5. URL вставить в `js/config.js` → `orderApiUrl`

### B) Cloudflare Worker

```bash
cd worker
npx wrangler login
npx wrangler secret put BOT_TOKEN
npx wrangler secret put CHAT_ID
npx wrangler deploy
```

URL `*.workers.dev` → в `js/config.js` → `orderApiUrl`

## Шаг 3. Проверка

Оформите тестовую заявку с сайта → сообщение должно прийти в Telegram.

## Безопасность

Токен уже светился в чате. После настройки зайдите в @BotFather → `/revoke` для этого бота и обновите секрет новым токеном.
