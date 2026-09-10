import fs from "node:fs";

if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

export const config = {
  pairingNumber: process.env.PAIRING_NUMBER?.replace(/[^0-9]/g, "") || "",
  ownerNumber: process.env.OWNER_NUMBER?.replace(/[^0-9]/g, "") || "",
  authDir: process.env.AUTH_DIR || "./auth",
  botName: process.env.BOT_NAME || "BaseBotAi",
  autoRejectCall: process.env.AUTO_REJECT_CALL !== "false",
  autoRead: process.env.AUTO_READ === "true",
  aiProvider: (process.env.AI_PROVIDER || "groq").toLowerCase(),
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  baiApiKey: process.env.BAI_API_KEY || "",
  baiModel: process.env.BAI_MODEL || "glm-5.3-flash",
  poolsideApiKey: process.env.POOLSIDE_API_KEY || "",
  poolsideModel: process.env.POOLSIDE_MODEL || "poolside/laguna-xs-2.1",
};
