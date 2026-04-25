const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Required env vars (set in docker-compose.yml)
const {
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_CHAT_ID,
  GRAFANA_URL,
  GRAFANA_USER,
  GRAFANA_PASS,
  DASHBOARD_UID,
  DASHBOARD_SLUG,
} = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  throw new Error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
}
if (!GRAFANA_URL || !GRAFANA_USER || !GRAFANA_PASS || !DASHBOARD_UID || !DASHBOARD_SLUG) {
  throw new Error('Missing Grafana env vars (GRAFANA_URL, GRAFANA_USER, GRAFANA_PASS, DASHBOARD_UID, DASHBOARD_SLUG)');
}

const chatId = TELEGRAM_CHAT_ID;
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const PANEL_MAP = {
  '/rps': { panelId: 1, title: 'RPS (Запросы к API)' },
  '/routes': { panelId: 2, title: 'RPS по маршрутам' },
  '/latency': { panelId: 3, title: 'Задержка HTTP (p50/p95)' },
  '/heap': { panelId: 4, title: 'Node.js heap (процесс backend)' },
  // Метрики из /metrics backend (prom-client) — один процесс Node
  '/cpu': { panelId: 5, title: 'CPU: процесс backend (Node.js)' },
  '/ram': { panelId: 6, title: 'RAM: процесс backend (resident memory)' },
  // Метрики node-exporter — хост Linux (VM Docker Desktop), не «весь Windows»
  '/hostcpu': { panelId: 7, title: 'CPU: хост (node-exporter, VM Docker)' },
  '/hostram': { panelId: 8, title: 'RAM: хост (node-exporter, VM Docker)' },
};

function renderUrl(panelId) {
  // Renders a single panel as PNG (used to send screenshots to Telegram).
  // Notes:
  // - Grafana requires a dashboard UID in the URL.
  // - The slug is part of the path; UID is what actually selects the dashboard.
  return `${GRAFANA_URL}/render/d-solo/${DASHBOARD_UID}/${encodeURIComponent(DASHBOARD_SLUG)}?orgId=1&panelId=${panelId}&from=now-1h&to=now&width=1200&height=500`;
}

async function getPanelPng(panelId) {
  const url = renderUrl(panelId);
  const resp = await axios.get(url, {
    responseType: 'arraybuffer',
    auth: { username: GRAFANA_USER, password: GRAFANA_PASS },
    headers: { Accept: 'image/png' },
  });
  return Buffer.from(resp.data);
}

function helpText() {
  return [
    'Команды (скрин панели из Grafana):',
    '/rps - RPS',
    '/routes - RPS по маршрутам',
    '/latency - задержка p50/p95',
    '/heap - Node.js heap (процесс backend)',
    '/cpu — CPU процесса backend',
    '/ram — RAM процесса backend',
    '/hostcpu — CPU хоста (node-exporter)',
    '/hostram — RAM хоста (node-exporter)',
  ].join('\n');
}

bot.on('message', async (msg) => {
  const text = (msg.text || '').trim();
  if (!text.startsWith('/')) return;

  try {
    if (text === '/start' || text === '/help') {
      await bot.sendMessage(chatId, helpText());
      return;
    }

    const cmd = text.split(' ')[0].toLowerCase();
    const meta = PANEL_MAP[cmd];
    if (!meta) {
      await bot.sendMessage(chatId, `Неизвестная команда: ${cmd}\n\n${helpText()}`);
      return;
    }

    const png = await getPanelPng(meta.panelId);
    await bot.sendPhoto(chatId, png, { caption: meta.title });
  } catch (e) {
    await bot.sendMessage(chatId, `Ошибка: ${e.message || String(e)}`);
  }
});

console.log('Telegram bot started.');

