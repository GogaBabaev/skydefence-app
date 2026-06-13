// SkyDefence Telegram Bot
// Токен берётся ТОЛЬКО из переменной окружения — никогда не храните его в коде.
// Запуск: TELEGRAM_BOT_TOKEN=xxx APP_URL=https://app.example.com node bot.js

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.APP_URL ?? 'https://app.example.com/';
// Backend base URL (e.g. https://api.example.com or http://api:3000) and the
// shared secret used for the manager-only order status admin endpoint.
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://api:3000';
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;
const MANAGER_CHAT_ID = process.env.TELEGRAM_MANAGER_CHAT_ID;

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

// ─── Обработка нажатий на кнопки заявки (админ-панель менеджера) ───────────
const STATUS_BY_ACTION = {
  c: 'CONFIRMED',
  f: 'FULFILLED',
  x: 'CANCELED',
};

const STATUS_LABEL = {
  CONFIRMED: '✅ Подтверждён',
  FULFILLED: '📦 Выполнен',
  CANCELED: '❌ Отменён',
};

async function handleCallbackQuery(query) {
  const data = query.data ?? '';
  const match = /^ord:([cfx]):([0-9a-fA-F-]+)$/.exec(data);
  if (!match) {
    await call('answerCallbackQuery', { callback_query_id: query.id });
    return;
  }

  const [, action, orderId] = match;
  const status = STATUS_BY_ACTION[action];
  const chatId = query.message?.chat?.id;

  if (MANAGER_CHAT_ID && String(chatId) !== String(MANAGER_CHAT_ID)) {
    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: '⛔ У вас нет доступа к этой заявке',
      show_alert: true,
    });
    return;
  }

  if (!ADMIN_API_SECRET) {
    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: '⚠️ ADMIN_API_SECRET не настроен на боте',
      show_alert: true,
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': ADMIN_API_SECRET,
      },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`❌ status update error (${res.status}):`, errText);
      await call('answerCallbackQuery', {
        callback_query_id: query.id,
        text: '⚠️ Не удалось обновить статус заказа',
        show_alert: true,
      });
      return;
    }

    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Статус обновлён: ${STATUS_LABEL[status]}`,
    });

    if (query.message) {
      const originalText = query.message.text ?? '';
      await call('editMessageText', {
        chat_id: chatId,
        message_id: query.message.message_id,
        text: `${originalText}\n\n${STATUS_LABEL[status]}`,
        parse_mode: 'HTML',
      });
    }
  } catch (e) {
    console.error('❌ callback_query error:', e.message);
    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: '⚠️ Ошибка соединения с сервером',
      show_alert: true,
    });
  }
}

// ─── Обработка входящих сообщений ───────────────────────────────────────────
async function handleUpdate(update) {
  if (update.callback_query) {
    await handleCallbackQuery(update.callback_query);
    return;
  }

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
