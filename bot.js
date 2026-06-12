// SkyDefence Telegram Bot
// Токен берётся ТОЛЬКО из переменной окружения — никогда не храните его в коде.
// Запуск: TELEGRAM_BOT_TOKEN=xxx APP_URL=https://app.example.com node bot.js

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.APP_URL ?? 'https://app.example.com/';

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан. Получите токен у @BotFather и экспортируйте его в окружение.');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

// ─── Отправка запросов к Telegram API ───────────────────────────────────────
async function call(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) console.error(`❌ ${method} error:`, JSON.stringify(json));
  return json;
}

// ─── Обработка входящих сообщений ───────────────────────────────────────────
async function handleUpdate(update) {
  const msg = update.message;
  if (!msg) return;

  const chatId = msg.chat.id;
  const firstName = msg.from?.first_name ?? 'друг';
  const text = msg.text ?? '';

  if (text === '/start') {
    await call('sendMessage', {
      chat_id: chatId,
      text:
        `👋 Здравствуйте, ${firstName}!\n\n` +
        `Добро пожаловать в SkyDefence.\n\n` +
        `Нажмите кнопку ниже, чтобы открыть каталог:\n\n` +
        `📞 +7 (495) 136-5777`,
      reply_markup: {
        inline_keyboard: [
          [{ text: '🛒 Открыть магазин', web_app: { url: APP_URL } }],
          [
            { text: '📋 Каталог',  web_app: { url: APP_URL + '#/catalog'  } },
            { text: '📞 Контакты', web_app: { url: APP_URL + '#/contacts' } },
          ],
        ],
      },
    });
    return;
  }

  await call('sendMessage', {
    chat_id: chatId,
    text: 'Воспользуйтесь кнопкой ниже или введите /start',
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Открыть магазин', web_app: { url: APP_URL } }],
      ],
    },
  });
}

// ─── Long polling ────────────────────────────────────────────────────────────
let offset = 0;
console.log('✅ SkyDefence бот запущен.');

async function poll() {
  try {
    const data = await call('getUpdates', { offset, timeout: 30 });
    for (const update of data.result ?? []) {
      offset = update.update_id + 1;
      await handleUpdate(update);
    }
  } catch (e) {
    console.error('❌ poll error:', e.message);
  }
  setTimeout(poll, 500);
}

poll();
