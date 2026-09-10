const memory = new Map();
const MAX_TURNS = 10;

export function resetMemory(jid) {
  memory.delete(jid);
}

export function getMemory(jid) {
  return memory.get(jid) || [];
}

export async function handleAI({ socket, jid, msg, text, config }) {
  const clean = text.trim();
  if (!clean) return;

  if (/^(reset|clear|lupakan)\b/i.test(clean)) {
    resetMemory(jid);
    return socket.sendMessage(
      jid,
      { text: "Memori percakapan telah dibersihkan." },
      { quoted: msg }
    );
  }

  let apiUrl = "https://api.groq.com/openai/v1/chat/completions";
  let apiKey = config.groqApiKey;
  let model = config.groqModel || "openai/gpt-oss-120b";
  let isBai = false;

  if (config.aiProvider === "poolside") {
    apiUrl = "https://inference.poolside.ai/v1/chat/completions";
    apiKey = config.poolsideApiKey;
    model = config.poolsideModel || "poolside/laguna-xs-2.1";
  } else if (config.aiProvider === "bai" || config.aiProvider === "b.ai") {
    isBai = true;
    apiUrl = "https://api.b.ai/v1/chat/completions";
    apiKey = config.baiApiKey;
    model = config.baiModel || "glm-5.3-flash";
  }

  if (!apiKey) {
    return socket.sendMessage(
      jid,
      { text: `API key ${config.aiProvider.toUpperCase()}_API_KEY belum dikonfigurasi di .env.` },
      { quoted: msg }
    );
  }


  const history = getMemory(jid);
  const messages = [
    {
      role: "system",
      content: `Kamu adalah ${config.botName}, asisten WhatsApp. Jawab langsung ke pokok permasalahan, ringkas, lugas, dan solutif. Dilarang menggunakan format bertele-tele, kalimat pembuka basa-basi, atau emoji seperti 🚀, 🤖, ✨, 🔥, 💡. Jangan gunakan disclaimer klise. Kamu memiliki memori percakapan aktif dan terhubung langsung di WhatsApp.`,
    },
    ...history,
    { role: "user", content: clean },
  ];

  const payload = { model, messages };
  if (isBai) {
    payload.temperature = 0.7;
    payload.max_tokens = 1000;
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error(`\n[AI ERROR ${res.status}] Provider: ${config.aiProvider} | Model: ${model}`);
      console.error(err, "\n");
      return socket.sendMessage(
        jid,
        { text: `Error AI (${res.status}): ${err.slice(0, 100)}` },
        { quoted: msg }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Tidak ada respon dari AI.";

    history.push({ role: "user", content: clean });
    history.push({ role: "assistant", content: reply });
    if (history.length > MAX_TURNS) history.splice(0, 2);
    memory.set(jid, history);

    await socket.sendMessage(jid, { text: reply }, { quoted: msg });
  } catch (err) {
    console.error(`\n[AI EXCEPTION] Provider: ${config.aiProvider} | Model: ${model}`);
    console.error(err, "\n");
    await socket.sendMessage(
      jid,
      { text: `Error AI: ${err.message}` },
      { quoted: msg }
    ).catch(() => { });
  }
}
