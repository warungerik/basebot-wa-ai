# BaseBot AI: Bot WhatsApp Multi-Provider LLM

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-22.x+-339933?logo=nodedotjs)](https://nodejs.org)
[![Baileys](https://img.shields.io/badge/Baileys-v7.x-25D366?logo=whatsapp)](https://github.com/WhiskeySockets/Baileys)

Bot WhatsApp canggih berbasis Baileys dan Node.js dengan dukungan multi-provider LLM (Groq, B.AI, Poolside), manajemen memori percakapan aktif, dan fitur smart message handling.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Prasyarat](#prasyarat)
- [Instalasi](#instalasi)
- [Konfigurasi](#konfigurasi)
- [Panduan Penggunaan](#panduan-penggunaan)
- [Provider LLM](#provider-llm)
- [Command](#command)
- [Struktur Proyek](#struktur-proyek)
- [Troubleshooting](#troubleshooting)
- [Lisensi](#lisensi)

---

## Fitur Utama

- Multi-Provider LLM: Dukungan Groq, B.AI, dan Poolside
- Manajemen Memori Percakapan: Menyimpan konteks percakapan per user (max 10 turns)
- Autentikasi Aman: Sistem pairing code untuk WhatsApp Web
- Group Detection: Otomatis respond hanya jika bot di-mention atau di-reply
- Quoted Message Support: Automatic tracking pesan yang di-reply
- Auto-Reject Call: Menolak panggilan masuk secara otomatis
- Auto-Read Message: Tandai pesan sebagai sudah dibaca (optional)
- Poll Message Support: Agregasi voting dari poll message
- Message Store: Persistent message tracking
- Auto-Reconnect: Reconneksi otomatis saat koneksi terputus
- Session Management: Automatic session handling dan logout detection

---

## Prasyarat

Sebelum memulai, pastikan Anda memiliki:

- Node.js >= 22.0.0
- npm >= 10.x
- Akun WhatsApp aktif (untuk pairing)
- API Key dari minimal satu provider LLM:
  - Groq API (https://console.groq.com)
  - B.AI API (https://b.ai/)
  - Poolside API (https://poolside.ai/)

---

## Instalasi

### 1. Clone Repositori

```bash
git clone https://github.com/warungerik/basebot-wa-ai.git
cd basebot-wa-ai
```

### 2. Install Dependensi

```bash
npm install
```

### 3. Konfigurasi Environment

Salin file template environment:

```bash
cp .env.example .env
```

Edit file `.env` dengan editor pilihan Anda:

```bash
# Linux/Mac
nano .env

# Windows
notepad .env
```

---

## Konfigurasi

### Variabel Environment

```env
# Wajib diisi
PAIRING_NUMBER=628xxxxxxxxxx
BOT_NAME=BaseBotAi
AUTH_DIR=./auth

# Pilih salah satu: groq, poolside, atau bai
AI_PROVIDER=poolside

# Konfigurasi Poolside
POOLSIDE_API_KEY=your_api_key
POOLSIDE_MODEL=poolside/laguna-xs-2.1

# Konfigurasi Groq
GROQ_API_KEY=your_api_key
GROQ_MODEL=openai/gpt-oss-120b

# Konfigurasi B.AI
BAI_API_KEY=your_api_key
BAI_MODEL=glm-5.3-flash

# Optional
OWNER_NUMBER=628xxxxxxxxxx
AUTO_REJECT_CALL=true
AUTO_READ=false
```

### Penjelasan Konfigurasi

- **PAIRING_NUMBER**: Nomor WhatsApp untuk pairing bot (format 62 tanpa +)
- **BOT_NAME**: Nama bot yang akan ditampilkan dalam system prompt
- **AUTH_DIR**: Direktori untuk menyimpan session WhatsApp
- **AI_PROVIDER**: Provider LLM yang digunakan (groq | poolside | bai)
- **OWNER_NUMBER**: Nomor pemilik bot (opsional, untuk tracking ownership)
- **AUTO_REJECT_CALL**: Tolak panggilan masuk secara otomatis (default: true)
- **AUTO_READ**: Tandai pesan sebagai sudah dibaca (default: false)

### Contoh `.env` Lengkap

```env
PAIRING_NUMBER=628123456789
BOT_NAME=BaseBotAi
OWNER_NUMBER=628123456789
AUTH_DIR=./auth

AI_PROVIDER=groq

GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=openai/gpt-oss-120b

POOLSIDE_API_KEY=xxx-xxxxxxxxxxxxxxxxxxxxxxxxxx
POOLSIDE_MODEL=poolside/laguna-xs-2.1

BAI_API_KEY=your_bai_api_key_here
BAI_MODEL=glm-5.3-flash

AUTO_REJECT_CALL=true
AUTO_READ=false
```

---

## Panduan Penggunaan

### Menjalankan Bot

```bash
npm start
```

Pada kali pertama, bot akan menampilkan QR code di terminal. Pindai QR code tersebut menggunakan WhatsApp untuk melakukan pairing.

```
[BOOT] Bot siap.
[QR] Scan:
[CONNECTION] Terhubung.
```

### Chat dengan Bot

Bot merespons:
- Chat pribadi: Semua pesan akan diproses
- Chat grup: Hanya jika bot di-mention atau pesan merupakan reply ke bot

Contoh percakapan:

```
User: Halo, siapa nama kamu?
Bot: Saya BaseBotAi, asisten WhatsApp dengan AI. Ada yang bisa saya bantu?

User: Berikan saya tips menulis artikel
Bot: Berikut tips menulis artikel yang baik:
1. Tentukan topik dan target audience...
2. Buat outline sebelum menulis...
[Bot menyimpan konteks percakapan untuk respons berikutnya]

User: Terapkan itu untuk topik teknologi
Bot: Baik, untuk menulis artikel teknologi:
1. Tentukan aspek teknologi yang spesifik...
[Bot mengingat percakapan sebelumnya]
```

---

## Command

Bot memiliki command khusus yang dapat digunakan siapa saja:

### Reset Memori Percakapan

```
reset
clear
lupakan
```

Menghapus riwayat percakapan dengan bot. Berguna jika bot kehilangan konteks atau Anda ingin memulai topik baru.

Contoh:
```
User: reset
Bot: Memori percakapan telah dibersihkan.
```

---

## Provider LLM

BaseBot mendukung tiga provider LLM. Pilih salah satu yang sesuai kebutuhan Anda:

### 1. Groq

- Website: https://groq.com/
- Kelebihan: Latency sangat rendah, gratis untuk development, cocok untuk real-time chat
- Model Default: openai/gpt-oss-120b
- Model Lainnya: openai/gpt-oss-120b, openai/gpt-oss-350b, openai/gpt-oss-7b

Setup:
```env
AI_PROVIDER=groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_MODEL=openai/gpt-oss-120b
```

Cara mendapatkan API Key:
1. Buka https://console.groq.com
2. Sign up dengan akun Anda
3. Navigasi ke API Keys
4. Generate API key baru
5. Copy ke `.env`

### 2. Poolside

- Website: https://poolside.ai/
- Kelebihan: Model Laguna dengan performa optimal, cost-effective
- Model Default: poolside/laguna-xs-2.1
- Model Lainnya: poolside/laguna-xs-2.1, poolside/laguna-2

Setup:
```env
AI_PROVIDER=poolside
POOLSIDE_API_KEY=xxx-xxxxxxxxxxxxxxxxxxxxxxxxxx
POOLSIDE_MODEL=poolside/laguna-xs-2.1
```

Cara mendapatkan API Key:
1. Buka https://poolside.ai/
2. Register akun
3. Buka settings API
4. Create new API key
5. Copy ke `.env`

### 3. B.AI

- Website: https://b.ai/
- Kelebihan: Model GLM terbaru dari Baidu, support vision model
- Model Default: glm-5.3-flash
- Model Lainnya: glm-5.3-flash, glm-4-vision, glm-4

Setup:
```env
AI_PROVIDER=bai
BAI_API_KEY=your_bai_api_key_here
BAI_MODEL=glm-5.3-flash
```

Cara mendapatkan API Key:
1. Buka https://b.ai/
2. Daftar akun
3. Masuk ke dashboard
4. Cari bagian API Keys
5. Generate dan copy API key

### Switch Provider

Untuk switch provider tanpa edit `.env`:

```bash
AI_PROVIDER=groq npm start
AI_PROVIDER=poolside npm start
AI_PROVIDER=bai npm start
```

---

## Struktur Proyek

```text
basebot-wa-ai/
├── index.js              # Entry point, setup Baileys, message routing
├── config.js             # Load dan parse environment variables
├── ai.js                 # AI processing, memory management, provider handling
├── package.json          # Dependencies dan scripts
├── .env                  # Konfigurasi aplikasi (jangan commit!)
├── .env.example          # Template konfigurasi
├── .gitignore            # File yang diabaikan git
├── LICENSE               # Lisensi MIT
├── auth/                 # Session WhatsApp (auto-generated)
├── baileys_store.json    # Message store (auto-generated)
└── README.md             # Dokumentasi ini
```

### Penjelasan File Utama

#### index.js
- Setup koneksi Baileys ke WhatsApp
- Event listeners untuk calls, groups, messages
- Message store management untuk tracking pesan
- Group metadata caching
- QR code generation dan pairing code request
- Auto-reconnect logic
- Group mention dan quoted message detection

#### config.js
- Load environment variables dari `.env`
- Parse dan validasi konfigurasi
- Export config object untuk digunakan di index.js dan ai.js

#### ai.js
- Memory management per user (Map-based, max 10 turns)
- API request handling untuk semua provider
- Error handling dan response formatting
- Command parsing (reset, clear, lupakan)
- System prompt injection untuk bot behavior

---

## Fitur Teknis

### Memory Management

Bot menyimpan riwayat percakapan per user dengan batasan:
- **Max Turns**: 10 turn percakapan (user + assistant)
- **Storage**: In-memory Map (reset saat bot restart)
- **Scope**: Per user (jid)

Ketika mencapai 10 turns, 2 turns tertua akan dihapus otomatis.

### Group Handling

Bot di grup hanya akan respond jika:
- Bot di-mention dalam pesan
- Pesan merupakan reply ke bot

Ini untuk menghindari spam dan unnecessary responses.

### Message Tracking

Bot menyimpan hingga 1500 pesan terakhir untuk:
- Tracked quoted messages
- Poll message aggregation
- Message context

### Auto-Reconnect

Bot otomatis reconnect saat:
- Connection lost (3 detik delay)
- Session expired (2 detik delay + clear auth folder)
- Logout detected

---

## Troubleshooting

### QR Code Tidak Muncul

Masalah: Terminal menampilkan loading tapi QR code tidak keluar

Solusi:
```bash
# Hapus session lama
rm -rf auth/
rm baileys_store.json

# Jalankan ulang
npm start
```

### Bot Tidak Merespons Pesan

Masalah: Bot terkoneksi tapi tidak balas pesan

Pengecekan:
1. Pastikan API KEY valid
   ```bash
   # Test API key Groq
   curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.groq.com/openai/v1/models
   ```

2. Cek logs di terminal untuk error
   ```bash
   npm start
   ```

3. Di grup, pastikan bot di-mention atau reply ke bot
   ```
   @BotName pesan kamu
   atau reply ke pesan bot
   ```

4. Verifikasi `.env` file
   ```bash
   cat .env | grep AI_PROVIDER
   cat .env | grep API_KEY
   ```

### Error "Invalid API Key"

Masalah: API key di-reject oleh provider

Solusi:
- Verify API key di website provider (copy-paste lagi)
- Pastikan tidak ada spasi tambahan di `.env`
- Cek quota/balance di provider
- Generate API key baru dan coba lagi
- Pastikan AI_PROVIDER sesuai dengan API key yang digunakan

### Error "403 Forbidden" atau "Invalid Request"

Masalah: Provider menolak request

Kemungkinan penyebab:
- Model name salah (cek GROQ_MODEL, POOLSIDE_MODEL, BAI_MODEL)
- API key expired
- Quota habis di provider
- Region/country restriction

Solusi:
- Verify model name di dokumentasi provider
- Generate API key baru
- Cek balance di provider
- Gunakan provider alternatif

### Bot Disconnect Terus-Menerus

Masalah: Bot frequently disconnect dan reconnect

Solusi:
1. Pastikan nomor WhatsApp aktif dan stabil
2. Jangan gunakan WhatsApp Web di browser lain
3. Update Baileys ke versi terbaru
   ```bash
   npm update baileys
   ```
4. Cek koneksi internet
5. Jika menggunakan VPN, coba matikan

### Out of Memory Error

Masalah: Bot crash dengan error "Out of memory"

Solusi:
- Restart bot
- Hapus `baileys_store.json` yang terlalu besar
- Reduce message store size (edit MAX_SIZE di index.js)
- Monitor memory usage dengan `top` atau `htop`

### Error Beim Parsing JSON di B.AI

Masalah: B.AI mengembalikan error response yang tidak valid

Solusi:
- Cek apakah BAI_API_KEY benar
- Gunakan model yang sudah tested: glm-5.3-flash
- Coba switch ke provider lain (Groq atau Poolside)

### Logs dan Debugging

Untuk melihat detailed logs:

```bash
# Enable Baileys verbose logging
DEBUG=baileys npm start

# Simpan logs ke file
npm start 2>&1 | tee bot.log
```

---

## System Prompt

Bot menggunakan system prompt berikut untuk behavior:

```
Kamu adalah {BOT_NAME}, asisten WhatsApp. Jawab langsung ke pokok permasalahan, 
ringkas, lugas, dan solutif. Dilarang menggunakan format bertele-tele, kalimat 
pembuka basa-basi, atau emoji seperti 🚀, 🤖, ✨, 🔥, 💡. Jangan gunakan disclaimer 
klise. Kamu memiliki memori percakapan aktif dan terhubung langsung di WhatsApp.
```

Jika ingin mengubah behavior bot, edit langsung di `ai.js` pada section system message.

---

## Lisensi

Proyek ini didistribusikan di bawah lisensi MIT. Lihat file [LICENSE](LICENSE) untuk detail lengkap.

---

## Tips Production Deployment

### Gunakan Process Manager (PM2)

```bash
npm install -g pm2

# Start dengan PM2
pm2 start index.js --name "basebot"

# Auto restart pada boot
pm2 startup
pm2 save

# Monitor
pm2 monit

# Logs
pm2 logs basebot
```

### Environment Configuration

```bash
# Gunakan .env untuk production
cp .env.example .env
# Edit .env dengan production values

# Start
npm start
```

### Backup Session

```bash
# Backup auth folder
tar -czf auth_backup.tar.gz auth/

# Restore
tar -xzf auth_backup.tar.gz
```

### Rate Limiting

Jika bot spam di trigger, tambahkan delay:

Edit `ai.js` di handleAI function untuk tambahkan delay sebelum send message.

---
## Support Pengembangan

Jika project ini membantu Anda, pertimbangkan untuk memberikan dukungan:

<a href="https://warungerik.com/payment" target="_blank">
  <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee" />
</a>
</br>
Made with care by Warungerik https://warungerik.com

Jika project ini bermanfaat, jangan lupa beri star di repository!
