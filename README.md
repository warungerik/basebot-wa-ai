# BaseBot AI: Bot WhatsApp Multi-Provider LLM

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22.x+-339933?logo=nodedotjs)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-v7.x-25D366?logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)

Bot WhatsApp berbasis Baileys dan Node.js dengan dukungan multi-provider LLM serta memori percakapan aktif.

---

## Modul & Kemampuan

- **Obrolan Langsung**: Respon pesan langsung tanpa prefix di chat pribadi. Respon otomatis di grup saat mention atau reply.
- **Memori Konteks**: Simpan riwayat chat sliding-window FIFO per pengguna. Hapus riwayat lewat pesan `reset` atau `clear`.
- **Multi-Provider LLM**: Dukungan langsung untuk Poolside AI, Groq, dan B.AI.
- **Proteksi Akun**: Tolak panggilan masuk otomatis dan pulihkan sesi jika terputus.

---

## Struktur Direktori

```text
basebot/
├── .env                    # Variabel environment dan kredensial API
├── .env.example            # Template konfigurasi environment
├── .gitignore              # Berkas yang diabaikan Git
├── ai.js                   # Pemrosesan AI dan memori percakapan
├── config.js               # Konfigurasi runtime aplikasi
├── index.js                # Socket Baileys dan routing pesan
├── package.json            # Dependensi dan skrip proyek
└── test/
    └── bot.test.js         # Pengujian unit otomatis
```

---

## Panduan Penggunaan

### Prasyarat

- Node.js >= 22.0.0
- npm >= 10.x

### 1. Clone Repositori & Install Dependensi

```bash
git clone https://github.com/warungerik/basebot-wa-ai.git
cd basebot-wa-ai
npm install
```

### 2. Konfigurasi Environment

Salin template environment:

```bash
cp .env.example .env
```

Isi variabel di berkas `.env`:

```env
PAIRING_NUMBER=628xxxxxxxxxx
BOT_NAME=BaseBotAi
OWNER_NUMBER=628xxxxxxxxxx
AUTH_DIR=./auth
AI_PROVIDER=poolside

POOLSIDE_API_KEY=your_poolside_api_key
POOLSIDE_MODEL=poolside/laguna-s-2.1

GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b

BAI_API_KEY=your_bai_api_key
BAI_MODEL=glm-5.3-flash
```

### 3. Jalankan Bot

```bash
npm start
```

Masukkan 8 digit kode pairing dari terminal ke WhatsApp ponsel (**Perangkat Tertaut** > **Tautkan Perangkat** > **Tautkan dengan nomor telepon saja**).

### 4. Pengujian

Jalankan pengujian unit:

```bash
npm test
```

---

## Lisensi

Didistribusikan dengan lisensi [MIT](./LICENSE).

---

## Dukungan

Dukungan pengembangan:

<a href="https://warungerik.com/payment" target="_blank">
  <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
</a>
