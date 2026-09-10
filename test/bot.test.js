import test from "node:test";
import assert from "node:assert/strict";
import { config } from "../config.js";
import { getStoredMessage } from "../index.js";
import { handleAI, getMemory, resetMemory } from "../ai.js";

test("config: konfigurasi bot dan provider AI siap", () => {
  assert.equal(typeof config.botName, "string");
  assert.equal(typeof config.aiProvider, "string");
  assert.equal(typeof config.groqApiKey, "string");
  assert.equal(typeof config.groqModel, "string");
  assert.equal(typeof config.baiApiKey, "string");
  assert.equal(typeof config.baiModel, "string");
  assert.equal(typeof config.poolsideApiKey, "string");
  assert.equal(typeof config.poolsideModel, "string");
});

test("store: getStoredMessage berfungsi", () => {
  assert.equal(typeof getStoredMessage, "function");
  assert.equal(getStoredMessage({}), undefined);
});

test("ai: merespon chat langsung tanpa prefix dan menyimpan memory", async () => {
  const testJid = "user1@s.whatsapp.net";
  resetMemory(testJid);

  let sent = null;
  const mockSocket = {
    async sendMessage(jid, content, options) {
      sent = { jid, content, options };
      return sent;
    },
  };

  const groqConfig = { ...config, aiProvider: "groq" };

  await handleAI({
    socket: mockSocket,
    jid: testJid,
    msg: { key: { id: "m1" } },
    text: "Nama saya Budi",
    config: groqConfig,
  });

  assert.ok(sent?.content?.text);
  const mem1 = getMemory(testJid);
  assert.equal(mem1.length, 2);
  assert.equal(mem1[0].content, "Nama saya Budi");

  await handleAI({
    socket: mockSocket,
    jid: testJid,
    msg: { key: { id: "m2" } },
    text: "Siapa nama saya?",
    config: groqConfig,
  });

  assert.ok(sent?.content?.text);
  assert.match(sent.content.text, /Budi/i);
  const mem2 = getMemory(testJid);
  assert.equal(mem2.length, 4);

  await handleAI({
    socket: mockSocket,
    jid: testJid,
    msg: { key: { id: "m3" } },
    text: "reset",
    config: groqConfig,
  });

  assert.match(sent.content.text, /dibersihkan/);
  assert.equal(getMemory(testJid).length, 0);
});



test("ai: validasi API key B.AI saat dipilih", async () => {
  let sent = null;
  const mockSocket = {
    async sendMessage(jid, content, options) {
      sent = { jid, content, options };
      return sent;
    },
  };

  const baiConfig = {
    ...config,
    aiProvider: "bai",
    baiApiKey: "",
  };

  await handleAI({
    socket: mockSocket,
    jid: "user-bai@s.whatsapp.net",
    msg: { key: { id: "b1" } },
    text: "Halo",
    config: baiConfig,
  });

  assert.match(sent?.content?.text, /BAI_API_KEY/);
});

test("ai: validasi API key Poolside saat dipilih", async () => {
  let sent = null;
  const mockSocket = {
    async sendMessage(jid, content, options) {
      sent = { jid, content, options };
      return sent;
    },
  };

  const poolConfig = {
    ...config,
    aiProvider: "poolside",
    poolsideApiKey: "",
  };

  await handleAI({
    socket: mockSocket,
    jid: "user-pool@s.whatsapp.net",
    msg: { key: { id: "p1" } },
    text: "Halo",
    config: poolConfig,
  });

  assert.match(sent?.content?.text, /POOLSIDE_API_KEY/);
});


