# setup-patungin-openclaw

Panduan singkat untuk memakai **Patungin** di OpenClaw lewat **local proxy** supaya request AI tidak kena error 403 dari jalur yang salah.

Untuk blueprint formal yang bisa dibaca anggota tim lain, lihat: [`docs/BLUEPRINT.md`](docs/BLUEPRINT.md).

## Tujuan

- OpenClaw tetap pakai model Patungin.
- Request model lewat proxy lokal di mesin yang sama.
- Tidak membuka proxy ke publik.
- Tidak menaruh token live di repo.
- Menghindari 403 karena request langsung ke upstream yang salah atau header auth tidak konsisten.
- Bisa direplikasi anggota tim lain di mesin masing-masing tanpa membagikan token live.

## Arsitektur

```text
OpenClaw Agent
  -> http://127.0.0.1:8787/v1
  -> local proxy alias `costum-api-patungin-gpt-5.5`
  -> https://ai.patungin.id/v1
  -> model backend `gpt-5.5`
```

## Yang dipakai

- **Proxy lokal**: `http://127.0.0.1:8787`
- **Health**: `http://127.0.0.1:8787/health`
- **Upstream**: `https://ai.patungin.id/v1`
- **Token model**: dari config provider OpenClaw atau env lokal, **bukan** dari repo ini
- **Alias provider**: `costum-api-patungin-gpt-5.5`
- **Model backend**: `gpt-5.5`
- **Token proxy**: hanya kalau kamu sengaja aktifkan auth di proxy lokal

## Kenapa 403 bisa muncul

Biasanya karena salah satu ini:

- OpenClaw langsung nembak upstream tanpa proxy lokal
- base URL dipasang ganda, misalnya `/v1` dobel
- header `Authorization` tidak sesuai format yang diminta upstream
- API key Patungin belum ada di config provider `costum-api-patungin-gpt-5.5` OpenClaw
- request path salah, misalnya `/v1/v1/chat/completions`
- proxy lokal tidak aktif atau tidak listen di loopback

## Setup proxy lokal

File proxy yang dipakai di workspace OpenClaw:

```text
/root/.openclaw/workspace/scripts/patungin-proxy.mjs
```

Jalankan sebagai local-only:

```bash
PATUNGIN_PROXY_HOST=127.0.0.1 \
PATUNGIN_PROXY_PORT=8787 \
PATUNGIN_UPSTREAM=https://ai.patungin.id/v1 \
node /root/.openclaw/workspace/scripts/patungin-proxy.mjs
```

Test health:

```bash
curl http://127.0.0.1:8787/health
```

Harus balas JSON semacam:

```json
{"ok":true,"upstream":"https://ai.patungin.id/v1"}
```

## Arahkan OpenClaw ke proxy lokal

Kalau OpenClaw membaca config provider dari file config, set provider `costum-api-patungin-gpt-5.5` ke proxy lokal, bukan langsung ke upstream.

Contoh pola config:

```json
{
  "models": {
    "providers": {
      "costum-api-patungin-gpt-5.5": {
        "baseUrl": "http://127.0.0.1:8787/v1",
        "apiKey": "PAKAI_TOKEN_PROVIDER_YANG_BENAR"
      }
    }
  }
}
```

Catatan:

- `baseUrl` harus mengarah ke proxy lokal.
- `apiKey` tetap milik provider/model, bukan token dashboard.
- Jangan taruh token live di repo ini.

## Contoh request yang dilewatkan proxy

### Models

```bash
curl http://127.0.0.1:8787/v1/models \
  -H 'Authorization: Bearer <token-provider>'
```

### Chat completions

```bash
curl http://127.0.0.1:8787/v1/chat/completions \
  -H 'Authorization: Bearer <token-provider>' \
  -H 'Content-Type: application/json' \
  -d '{
    "model": "gpt-5.5",
    "messages": [
      {"role": "user", "content": "halo"}
    ]
  }'
```

## Jika masih 403

Cek berurutan:

1. Proxy lokal hidup?
   - `ss -ltnp | grep 8787`
2. Health lokal OK?
   - `curl http://127.0.0.1:8787/health`
3. Base URL OpenClaw sudah ke proxy lokal?
   - harus `http://127.0.0.1:8787/v1`
4. Token provider sudah benar?
   - jangan campur dengan token dashboard atau token lain
5. Path request sudah benar?
   - jangan dobel `/v1`
6. Proxy log ada error upstream?
   - cek `logs/patungin-proxy.log` di workspace OpenClaw

## Aturan aman

- Proxy tetap local-only.
- Jangan buka port 8787 ke publik.
- Jangan commit token live.
- Jangan bikin route nginx public tanpa instruksi eksplisit.

## Ringkasan cepat

Kalau mau Patungin dipakai OpenClaw tanpa 403, jalurnya harus begini (alias provider: `costum-api-patungin-gpt-5.5`, model: `gpt-5.5`):

```text
OpenClaw -> 127.0.0.1:8787/v1 -> ai.patungin.id/v1
```

Bukan langsung ke upstream dari semua tempat.
