/* Публичный конфиг сайта. Токен бота сюда НЕ класть. */
const SITE_CONFIG = {
  orderApiUrl: 'https://script.google.com/macros/s/AKfycbwQWhtfh-gZZRILBNNUgKyVvglF_RwOhO3FPzNK1SKMZ0dBthTt2oCEsznx0vgTmY9U5Q/exec',
  // Заявки также уходят на почту (FormSubmit). Первую заявку подтвердите письмом Confirm.
  orderEmail: 'tatiana.anatolievna.dta@gmail.com',
  // Служебное: бот только шлёт заявки в группу менеджеров. Клиентам ссылку на бота не даём.
  telegramBotUrl: 'https://t.me/zayavkigetstuff_bot',
  // Только для менеджеров (не публиковать покупателям — там чужие заказы):
  telegramGroupUrl: 'https://t.me/+thCtFYz7sP8yMTEy',
};
