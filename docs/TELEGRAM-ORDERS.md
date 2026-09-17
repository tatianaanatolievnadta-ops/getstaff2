# Подключение заявок к Telegram-группе

Группа менеджеров: https://t.me/+thCtFYz7sP8yMTEy  
Бот: https://t.me/zayavkigetstuff_bot  
`CHAT_ID` супергруппы: `-1004339261263`

Токен бота **нельзя** класть в `js/` — сайт на GitHub Pages публичный.

## Что уже сделано

- Бот добавлен в группу, тестовое сообщение в группу уходит.
- На сайте заявки параллельно идут на почту `tatiana.anatolievna.dta@gmail.com` (FormSubmit).

## Как добавить менеджера

1. Откройте инвайт группы: https://t.me/+thCtFYz7sP8yMTEy  
2. Добавьте человека в группу — он сразу видит все заявки.  
3. Бот должен оставаться в группе (лучше сделать его **админом** с правом писать сообщения).

## Включить автоотправку с сайта (один раз)

### Вариант A — Google Apps Script

1. Файл: `scripts/google-apps-telegram.gs`
2. https://script.google.com → новый проект → вставить код
3. Свойства скрипта: `BOT_TOKEN`, `CHAT_ID=-1004339261263`
4. Развернуть как **веб-приложение**, доступ: **Все**
5. URL вставить в `js/config.js` → `orderApiUrl` и запушить

### Вариант B — Cloudflare Worker

```bash
cd worker
npx wrangler login
npx wrangler secret put BOT_TOKEN
npx wrangler secret put CHAT_ID
npx wrangler deploy
```

URL `*.workers.dev` → `js/config.js` → `orderApiUrl`

## Проверка

Оформите тестовую заявку на сайте → сообщение в группе + письмо на почту.
