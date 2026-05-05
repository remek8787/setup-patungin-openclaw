# Quick Start untuk Anggota Tim

Panduan ini dibuat supaya siapa pun bisa clone repo lalu ganti token sendiri tanpa perlu bongkar manual terlalu jauh.

## 1. Clone repo

```bash
git clone git@github.com:remek8787/setup-patungin-openclaw.git
cd setup-patungin-openclaw
```

Kalau pakai HTTPS juga boleh:

```bash
git clone https://github.com/remek8787/setup-patungin-openclaw.git
cd setup-patungin-openclaw
```

## 2. Jalankan proxy lokal

Buka terminal baru lalu jalankan:

```bash
node patungin-proxy.mjs
```

Kalau mau eksplisit:

```bash
PATUNGIN_PROXY_HOST=127.0.0.1 \
PATUNGIN_PROXY_PORT=8787 \
PATUNGIN_UPSTREAM=https://ai.patungin.id/v1 \
node patungin-proxy.mjs
```

## 3. Edit file OpenClaw

Buka file config OpenClaw:

```bash
nano /root/.openclaw/openclaw.json
```

Atau kalau suka vim:

```bash
vim /root/.openclaw/openclaw.json
```

### Yang diganti

Cari bagian provider model, lalu pakai alias ini:

```json
"costum-api-patungin-gpt-5-5": {
  "baseUrl": "http://127.0.0.1:8787/v1",
  "apiKey": "ISI_TOKEN_PROVIDER_KAMU_SENDIRI"
}
```

Lalu pastikan model utama juga mengarah ke:

```text
costum-api-patungin-gpt-5-5/gpt-5.5
```

## 4. Simpan lalu cek health

```bash
curl http://127.0.0.1:8787/health
```

Harus balas `ok: true`.

## 5. Kalau masih 403

- pastikan `baseUrl` ke `http://127.0.0.1:8787/v1`
- jangan pakai `/v1` dobel
- pastikan token provider benar
- pastikan proxy lokal hidup

## Catatan penting

- Jangan pakai token dashboard di sini.
- Jangan buka proxy ke publik.
- Setiap anggota pakai config lokal masing-masing.
