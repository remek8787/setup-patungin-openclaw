# Public Proxy Token Management

Dokumen ini untuk mengelola token akses public Patungin proxy.

## Status arsitektur

```text
Client/agent lain
  -> https://api.anantasatriya.my.id/patungin/v1
  -> public proxy token
  -> server Alvii
  -> token provider Patungin asli di sisi server
```

Token provider asli tidak dibagikan ke client.

## Lokasi token manager

Di server Alvii/OpenClaw:

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs
```

Token store:

```bash
/etc/openclaw/patungin-public-tokens.json
```

File token store hanya menyimpan hash, bukan plaintext token.

## Tambah token untuk mesin baru

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs add nama-mesin
```

Contoh:

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs add agent-vps-1
```

Output akan menampilkan token plaintext satu kali saja. Simpan token itu di mesin pemakai.

## Lihat token yang terdaftar

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs list
```

Yang tampil hanya:

- status enabled/disabled
- nama token
- prefix token
- waktu dibuat

Tidak menampilkan token penuh.

## Cabut token

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs revoke nama-mesin
```

Contoh:

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs revoke agent-vps-1
```

## Aktifkan ulang token

```bash
/root/.openclaw/workspace/scripts/patungin-token-manager.mjs enable nama-mesin
```

## Config OpenClaw di mesin lain

```json
{
  "models": {
    "providers": {
      "costum-api-patungin-gpt-5-5": {
        "baseUrl": "https://api.anantasatriya.my.id/patungin/v1",
        "apiKey": "PUBLIC_PROXY_TOKEN_DARI_ALVII",
        "api": "openai-completions"
      }
    }
  },
  "agents": {
    "defaults": {
      "model": {
        "primary": "costum-api-patungin-gpt-5-5/gpt-5.5",
        "fallbacks": []
      }
    }
  }
}
```

## Test dari mesin lain

```bash
curl https://api.anantasatriya.my.id/patungin/health
```

Test models:

```bash
curl https://api.anantasatriya.my.id/patungin/v1/models \
  -H "Authorization: Bearer PUBLIC_PROXY_TOKEN_DARI_ALVII"
```

Tanpa token harus `401 Unauthorized`.

## Catatan keamanan

- Jangan kirim token provider asli.
- Jangan commit token ke GitHub.
- Buat token per mesin/agent agar mudah dicabut.
- Kalau token bocor, revoke dan buat token baru.
