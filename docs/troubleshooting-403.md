# Troubleshooting 403 Patungin di OpenClaw

Gunakan urutan ini sebelum mengubah config besar.

## 1. Pastikan proxy hidup lokal

```bash
ss -ltnp | grep 8787
curl http://127.0.0.1:8787/health
```

Kalau tidak hidup, jalankan ulang proxy.

## 2. Pastikan OpenClaw mengarah ke proxy

Base URL yang benar:

```text
http://127.0.0.1:8787/v1
```

Bukan:

```text
https://ai.patungin.id/v1
http://127.0.0.1:8787/v1/v1
```

## 3. Pastikan token provider ada

Proxy akan mengambil token dari:

1. env `PATUNGIN_API_KEY`, atau
2. `models.providers.patungin.apiKey` di config OpenClaw.

Jangan pakai token dashboard.

## 4. Cek request path

Path request dari OpenClaw ke proxy boleh berbentuk:

```text
/v1/chat/completions
/v1/models
```

Proxy akan meneruskan ke upstream tanpa menggandakan `/v1`.

## 5. Cek log proxy

Kalau pakai nohup:

```bash
tail -f /root/.openclaw/workspace/logs/patungin-proxy.log
```

Cari error upstream, token missing, atau route salah.
