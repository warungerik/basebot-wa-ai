import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers,
  getContentType,
  getAggregateVotesInPollMessage,
} from "baileys";
import pino from "pino";
import qrcode from "qrcode-terminal";
import fs from "node:fs";
import path from "node:path";
import { config } from "./config.js";
import { handleAI } from "./ai.js";

const logger = pino({ level: "warn" });
const STORE_PATH = "./baileys_store.json";

const messageStore = new Map();

function loadStore() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH, "utf-8"));
      for (const [k, v] of Object.entries(data)) {
        messageStore.set(k, v);
      }
    }
  } catch {}
}

function saveStore() {
  try {
    const obj = Object.fromEntries(messageStore);
    fs.writeFileSync(STORE_PATH, JSON.stringify(obj));
  } catch {}
}

function storeMessage(m) {
  if (!m?.key?.id) return;
  const keyStr = `${m.key.remoteJid}_${m.key.id}`;
  if (messageStore.size > 1500) {
    const oldestKey = messageStore.keys().next().value;
    messageStore.delete(oldestKey);
  }
  messageStore.set(keyStr, m.message);
}

export function getStoredMessage(key) {
  if (!key?.id) return undefined;
  return messageStore.get(`${key.remoteJid}_${key.id}`);
}

const groupCache = new Map();
function setGroupCache(id, metadata) {
  groupCache.set(id, { data: metadata, exp: Date.now() + 5 * 60 * 1000 });
}
function getGroupCache(id) {
  const item = groupCache.get(id);
  if (!item) return undefined;
  if (Date.now() > item.exp) {
    groupCache.delete(id);
    return undefined;
  }
  return item.data;
}

export async function startBot() {
  loadStore();
  console.log(`[BOOT] Bot siap.`);

  const { state, saveCreds } = await useMultiFileAuthState(config.authDir);

  const socket = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: true,
    markOnlineOnConnect: false,
    cachedGroupMetadata: async (jid) => getGroupCache(jid),
    getMessage: async (key) => getStoredMessage(key),
  });

  socket.ev.on("creds.update", saveCreds);

  socket.ev.on("call", async (calls) => {
    if (!config.autoRejectCall) return;
    for (const call of calls) {
      if (call.status === "offer") {
        await socket.rejectCall(call.id, call.from).catch(() => {});
      }
    }
  });

  socket.ev.on("groups.update", async (events) => {
    for (const event of events) {
      try {
        const metadata = await socket.groupMetadata(event.id);
        setGroupCache(event.id, metadata);
      } catch {}
    }
  });

  socket.ev.on("group-participants.update", async (event) => {
    try {
      const metadata = await socket.groupMetadata(event.id);
      setGroupCache(event.id, metadata);
    } catch {}
  });

  socket.ev.on("messages.update", async (updates) => {
    for (const { key, update } of updates) {
      if (update?.pollUpdates) {
        const pollCreation = getStoredMessage(key);
        if (pollCreation) {
          getAggregateVotesInPollMessage({
            message: pollCreation,
            pollUpdates: update.pollUpdates,
          });
        }
      }
    }
  });

  let pairingCodeRequested = false;

  socket.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !config.pairingNumber) {
      console.log("\n[QR] Scan:");
      qrcode.generate(qr, { small: true });
    }

    if (!socket.authState.creds.registered && config.pairingNumber && !pairingCodeRequested) {
      pairingCodeRequested = true;
      setTimeout(async () => {
        try {
          const code = await socket.requestPairingCode(config.pairingNumber);
          console.log(`[PAIRING] ${code}`);
        } catch (err) {
          console.error("[PAIRING ERROR]", err.message);
        }
      }, 3000);
    }

    if (connection === "close") {
      saveStore();
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const dataReason = lastDisconnect?.error?.data?.reason;
      const isLoggedOut =
        statusCode === DisconnectReason.loggedOut ||
        dataReason === "401" ||
        statusCode === 401;

      console.log(`[CONNECTION] Putus (${statusCode || dataReason}). Reconnect: ${!isLoggedOut}`);
      if (isLoggedOut) {
        console.log("[CONNECTION] Sesi expired / logged out. Membersihkan folder auth...");
        try {
          fs.rmSync(config.authDir, { recursive: true, force: true });
        } catch {}
        setTimeout(startBot, 2000);
      } else {
        setTimeout(startBot, 3000);
      }
    } else if (connection === "open") {
      console.log("[CONNECTION] Terhubung.");
    }
  });

  socket.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    for (const msg of messages) {
      storeMessage(msg);

      if (config.autoRead && msg.key.id) {
        await socket.readMessages([msg.key]).catch(() => {});
      }

      if (msg.key.fromMe) continue;
      if (!msg.message) continue;
      const jid = msg.key.remoteJid;
      if (!jid || jid === "status@broadcast") continue;

      const type = getContentType(msg.message);
      const text = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        msg.message.videoMessage?.caption ||
        ""
      ).trim();

      if (!text) continue;

      const isGroup = jid.endsWith("@g.us");
      const botNum = socket.user?.id?.split(":")[0];
      const ctx = msg.message?.extendedTextMessage?.contextInfo;
      const isMentioned = ctx?.mentionedJid?.some((m) => botNum && m.startsWith(botNum));
      const isQuotedMe = ctx?.participant && botNum && ctx.participant.startsWith(botNum);

      if (isGroup && !isMentioned && !isQuotedMe) continue;

      try {
        await handleAI({ socket, jid, msg, text, config });
      } catch (err) {
        console.error("[AI ERROR]", err);
      }
    }
  });

  return { socket };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve("index.js")) {
  startBot().catch((err) => {
    console.error("[FATAL ERROR]", err);
    process.exit(1);
  });
}
