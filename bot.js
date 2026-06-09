// SkyDefence Telegram Bot
// Запуск: node bot.js

const TOKEN = '8845684563:REDACTED';  // вставьте сюда
const APP_URL = 'https://GogaBabaev.github.io/skydefence-app/'; // URL вашего Mini App

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
    // Приветственное сообщение с баннером и кнопками
    await call('sendMessage', {
      chat_id: chatId,
      text:
        `👋 Здравствуйте, ${firstName}!\n\n` +
        `Добро пожаловать в SkyDefence — военторг и экспертное снаряжение.\n\n` +
        `🛡 Детекторы и подавители БПЛА\n` +
        `🚁 Квадрокоптеры DJI\n` +
        `🎽 Тактическое снаряжение\n` +
        `⚡️ Портативные электростанции\n\n` +
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

  // Любое другое сообщение
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

// ─── Long polling (опрос Telegram каждые 2 сек) ─────────────────────────────
let offset = 0;
console.log('✅ SkyDefence бот запущен. Нажмите Ctrl+C для остановки.\n');

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
