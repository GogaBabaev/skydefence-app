// SkyDefence Telegram Bot
// Токен берётся ТОЛЬКО из переменной окружения — никогда не храните его в коде.
// Запуск: TELEGRAM_BOT_TOKEN=xxx APP_URL=https://app.example.com node bot.js

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_URL = process.env.APP_URL ?? 'https://app.example.com/';
const API_BASE_URL = process.env.API_BASE_URL ?? 'http://api:3000';
const ADMIN_API_SECRET = process.env.ADMIN_API_SECRET;
const MANAGER_CHAT_ID = process.env.TELEGRAM_MANAGER_CHAT_ID;

// Route ONLY Telegram requests through a SOCKS5 proxy so the bot works from
// RU-hosted servers where api.telegram.org is blocked. Internal calls (e.g.
// http://api:3000) must stay DIRECT — the proxy can't reach the Docker network.
// Set SOCKS_PROXY to activate, e.g. socks5h://user:pass@host:port.
if (process.env.SOCKS_PROXY) {
  const nodeFetch = require('node-fetch');
  const { SocksProxyAgent } = require('socks-proxy-agent');
  const agent = new SocksProxyAgent(process.env.SOCKS_PROXY);
  const safe = process.env.SOCKS_PROXY.replace(/:([^:@]+)@/, ':***@');
  global.fetch = (url, opts = {}) => {
    const useProxy = String(url).includes('api.telegram.org');
    return nodeFetch(url, useProxy ? { ...opts, agent } : opts);
  };
  console.log('🌐 SOCKS5 прокси активирован (только Telegram):', safe);
}

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не задан. Получите токен у @BotFather и экспортируйте его в окружение.');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

// Safety net: never let an unhandled error kill the bot. The poll loop keeps
// running; a flaky proxy must never take the whole process down.
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ unhandledRejection:', reason instanceof Error ? reason.message : reason);
});
process.on('uncaughtException', (err) => {
  console.error('⚠️ uncaughtException:', err.message);
});

// ─── Отправка запросов к Telegram API ───────────────────────────────────────
// НИКОГДА не бросает: при сбое сети/прокси возвращает {ok:false}. Так моргание
// прокси превращается в обычный повтор, а не в падение процесса (Node 22 по
// умолчанию убивает процесс на необработанном промисе → был crash-loop).
async function call(method, body) {
  try {
    const res = await fetch(`${API}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!json.ok) console.error(`❌ ${method} error:`, JSON.stringify(json));
    return json;
  } catch (e) {
    console.error(`❌ ${method} fetch failed:`, e.message);
    return { ok: false, error_code: 0, description: e.message };
  }
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

async function handleB2bCallback(query, action, id) {
  const STATUS_BY_B2B_ACTION = { ip: 'IN_PROGRESS', cl: 'CLOSED' };
  const B2B_STATUS_LABEL = { IN_PROGRESS: '🔄 В работу', CLOSED: '✅ Закрыто' };
  const status = STATUS_BY_B2B_ACTION[action];
  if (!status) {
    await call('answerCallbackQuery', { callback_query_id: query.id });
    return;
  }

  if (!ADMIN_API_SECRET) {
    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: '⚠️ ADMIN_API_SECRET не настроен',
      show_alert: true,
    });
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/admin/b2b-requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_API_SECRET },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.error(`❌ b2b status update error (${res.status}):`, errText);
      await call('answerCallbackQuery', {
        callback_query_id: query.id,
        text: `⚠️ Ошибка: HTTP ${res.status}`,
        show_alert: true,
      });
      return;
    }
    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Статус обновлён: ${B2B_STATUS_LABEL[status]}`,
    });
    if (query.message) {
      const originalText = query.message.text ?? '';
      await call('editMessageText', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        text: `${originalText}\n\n${B2B_STATUS_LABEL[status]}`,
        parse_mode: 'HTML',
      });
    }
  } catch (e) {
    console.error('❌ b2b callback error:', e.message);
    await call('answerCallbackQuery', {
      callback_query_id: query.id,
      text: '⚠️ Ошибка соединения с сервером',
      show_alert: true,
    });
  }
}

async function handleCallbackQuery(query) {
  const data = query.data ?? '';

  const b2bMatch = /^b2b:(ip|cl):(\d+)$/.exec(data);
  if (b2bMatch) {
    await handleB2bCallback(query, b2bMatch[1], b2bMatch[2]);
    return;
  }

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

  if (text === '/b2b') {
    if (MANAGER_CHAT_ID && String(chatId) !== String(MANAGER_CHAT_ID)) {
      await call('sendMessage', { chat_id: chatId, text: '⛔ Команда доступна только менеджеру.' });
      return;
    }
    if (!ADMIN_API_SECRET) {
      await call('sendMessage', { chat_id: chatId, text: '⚠️ ADMIN_API_SECRET не настроен.' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/b2b-requests`, {
        headers: { 'x-admin-secret': ADMIN_API_SECRET },
      });
      if (!res.ok) {
        await call('sendMessage', { chat_id: chatId, text: `⚠️ Ошибка: HTTP ${res.status}` });
        return;
      }
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) {
        await call('sendMessage', { chat_id: chatId, text: '📭 Заявок пока нет.' });
        return;
      }
      const statusLabel = { NEW: '🆕 Новая', IN_PROGRESS: '🔄 В работе', CLOSED: '✅ Закрыта' };
      const lines = list.slice(0, 15).map((r) => {
        const head = `<b>№${r.id}</b> · ${statusLabel[r.status] ?? r.status}`;
        const parts = [head, `🏢 ${escapeHtml(r.company)} — ${escapeHtml(r.contactName)}`, `📞 ${escapeHtml(r.phone)}`];
        if (r.message) parts.push(`💬 ${escapeHtml(String(r.message).slice(0, 120))}`);
        return parts.join('\n');
      });
      await call('sendMessage', {
        chat_id: chatId,
        text: `📋 <b>Последние B2B-заявки</b>\n\n${lines.join('\n\n')}`,
        parse_mode: 'HTML',
      });
    } catch (e) {
      console.error('❌ /b2b error:', e.message);
      await call('sendMessage', { chat_id: chatId, text: '⚠️ Ошибка соединения с сервером.' });
    }
    return;
  }

  if (text === '/orders') {
    if (MANAGER_CHAT_ID && String(chatId) !== String(MANAGER_CHAT_ID)) {
      await call('sendMessage', { chat_id: chatId, text: '⛔ Команда доступна только менеджеру.' });
      return;
    }
    if (!ADMIN_API_SECRET) {
      await call('sendMessage', { chat_id: chatId, text: '⚠️ ADMIN_API_SECRET не настроен.' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`, {
        headers: { 'x-admin-secret': ADMIN_API_SECRET },
      });
      if (!res.ok) {
        await call('sendMessage', { chat_id: chatId, text: `⚠️ Ошибка: HTTP ${res.status}` });
        return;
      }
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) {
        await call('sendMessage', { chat_id: chatId, text: '📭 Заказов пока нет.' });
        return;
      }
      const statusLabel = { NEW: '🆕 Новый', CONFIRMED: '✅ Подтверждён', FULFILLED: '📦 Выполнен', CANCELED: '❌ Отменён' };
      const lines = list.slice(0, 15).map((o) => {
        const head = `<b>Заказ №${o.number}</b> · ${statusLabel[o.status] ?? o.status}`;
        const goods = (o.items || []).map((i) => `  • ${escapeHtml(i.productName)} ×${i.quantity}`).join('\n');
        const parts = [head, `👤 ${escapeHtml(o.customerName)} · 📞 ${escapeHtml(o.customerPhone)}`];
        if (goods) parts.push(goods);
        parts.push(`💰 ${Number(o.totalAmount).toLocaleString('ru-RU')} ${o.currency || 'RUB'}`);
        return parts.join('\n');
      });
      await call('sendMessage', {
        chat_id: chatId,
        text: `🛒 <b>Последние заказы</b>\n\n${lines.join('\n\n')}`,
        parse_mode: 'HTML',
      });
    } catch (e) {
      console.error('❌ /orders error:', e.message);
      await call('sendMessage', { chat_id: chatId, text: '⚠️ Ошибка соединения с сервером.' });
    }
    return;
  }

  if (text === '/callbacks') {
    if (MANAGER_CHAT_ID && String(chatId) !== String(MANAGER_CHAT_ID)) {
      await call('sendMessage', { chat_id: chatId, text: '⛔ Команда доступна только менеджеру.' });
      return;
    }
    if (!ADMIN_API_SECRET) {
      await call('sendMessage', { chat_id: chatId, text: '⚠️ ADMIN_API_SECRET не настроен.' });
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/callbacks`, {
        headers: { 'x-admin-secret': ADMIN_API_SECRET },
      });
      if (!res.ok) {
        await call('sendMessage', { chat_id: chatId, text: `⚠️ Ошибка: HTTP ${res.status}` });
        return;
      }
      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) {
        await call('sendMessage', { chat_id: chatId, text: '📭 Заявок на обратный звонок пока нет.' });
        return;
      }
      const lines = list.slice(0, 20).map((r) => {
        const parts = [
          `👤 <b>${escapeHtml(r.name)}</b> · 📞 <a href="tel:${escapeHtml(r.phone)}">${escapeHtml(r.phone)}</a>`,
        ];
        if (r.message) parts.push(`💬 ${escapeHtml(String(r.message).slice(0, 120))}`);
        const date = r.createdAt ? new Date(r.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) : '';
        if (date) parts.push(`🕐 ${date}`);
        return parts.join('\n');
      });
      await call('sendMessage', {
        chat_id: chatId,
        text: `📞 <b>Заявки на обратный звонок</b>\n\n${lines.join('\n\n')}`,
        parse_mode: 'HTML',
      });
    } catch (e) {
      console.error('❌ /callbacks error:', e.message);
      await call('sendMessage', { chat_id: chatId, text: '⚠️ Ошибка соединения с сервером.' });
    }
    return;
  }

  if (text === '/start') {
    await call('sendMessage', {
      chat_id: chatId,
      text:
        `👋 Здравствуйте, ${firstName}!\n\n` +
        `Добро пожаловать в SkyDefence — военторг и экспертное снаряжение.\n\n` +
        `🛡 Детекторы и подавители БПЛА\n` +
        `🚁 Квадрокоптеры DJI\n` +
        `🎽 Тактическое снаряжение\n` +
        `⚡️ Портативные электростанции\n\n` +
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

// ─── Команды в меню Telegram ─────────────────────────────────────────────────
// Клиентам показываем только /start; в чате менеджера — ещё /orders и /b2b.
// Best-effort: если прокси моргнул на старте, не мешаем боту работать.
async function registerCommands() {
  try {
    await call('setMyCommands', {
      commands: [{ command: 'start', description: 'Открыть магазин' }],
    });
    if (MANAGER_CHAT_ID) {
      await call('setMyCommands', {
        commands: [
          { command: 'orders', description: 'Последние заказы' },
          { command: 'b2b', description: 'B2B-заявки' },
          { command: 'callbacks', description: 'Заявки на обратный звонок' },
          { command: 'start', description: 'Открыть магазин' },
        ],
        scope: { type: 'chat', chat_id: Number(MANAGER_CHAT_ID) },
      });
    }
    console.log('✅ Команды зарегистрированы.');
  } catch (e) {
    console.error('⚠️ Не удалось зарегистрировать команды:', e.message);
  }
}

// ─── Long polling ────────────────────────────────────────────────────────────
let offset = 0;
let pollErrorCount = 0;
console.log('✅ SkyDefence бот запущен.');
registerCommands();

async function poll() {
  try {
    // LONG polling (timeout: 50) — ONE held-open connection waits up to 50s for
    // updates instead of hammering the proxy with a request every second. The
    // cheap SOCKS proxy rate-limits connections, so fewer = far fewer refusals.
    const data = await call('getUpdates', { offset, timeout: 50 });
    if (data.ok) {
      pollErrorCount = 0;
      for (const update of data.result ?? []) {
        offset = update.update_id + 1;
        await handleUpdate(update);
      }
      setTimeout(poll, 300); // re-poll quickly; the long-poll itself paces us
    } else if (data.error_code === 429) {
      const retryAfter = data.parameters?.retry_after ?? 10;
      console.error(`❌ getUpdates 429 — ждём ${retryAfter}s`);
      setTimeout(poll, retryAfter * 1000);
    } else {
      // Transient proxy/network blip — retry soon with a gentle backoff.
      pollErrorCount++;
      const delay = Math.min(1000 * pollErrorCount, 8000);
      setTimeout(poll, delay);
    }
  } catch (e) {
    console.error('❌ poll error:', e.message);
    pollErrorCount++;
    const delay = Math.min(1000 * pollErrorCount, 8000);
    setTimeout(poll, delay);
  }
}

poll();

// ─── Утилиты ──────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
