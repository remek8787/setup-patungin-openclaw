---
title: "Blueprint — Setup Patungin for OpenClaw"
description: "Panduan resmi penggunaan Patungin di OpenClaw lewat local proxy agar bisa dipakai bersama anggota tim tanpa membuka token atau proxy ke publik."
project: openclaw
created: "2026-05-05"
updated: "2026-05-05"
tags: [patungin, openclaw, blueprint, local-proxy, team, 403, api]
---

# Blueprint — Setup Patungin for OpenClaw

Dokumen ini adalah versi blueprint yang bisa dipakai bersama oleh anggota lain.

## Tujuan

- Memakai Patungin di OpenClaw tanpa error 403.
- Menjaga proxy tetap local-only.
- Menjaga token tidak bocor.
- Menyediakan setup yang bisa direplikasi oleh anggota tim lain di mesin mereka sendiri.

## Prinsip

- Yang dibagi ke tim adalah **cara setup**, bukan token live.
- Proxy tetap jalan di `127.0.0.1:8787` pada mesin masing-masing.
- Alias provider yang dipakai: `costum-api-patungin-gpt-5.5`.
- Model backend yang dipakai: `gpt-5.5`.
- Setiap anggota yang butuh akses harus punya config provider sendiri.
- Repo ini aman untuk dibagikan karena tidak berisi token live.

## Arsitektur

```text
OpenClaw
  -> provider alias `costum-api-patungin-gpt-5.5`
  -> local proxy 127.0.0.1:8787
  -> upstream Patungin
  -> model backend `gpt-5.5`
```

## Langkah setup ringkas

1. Jalankan proxy lokal.
2. Arahkan `baseUrl` provider `costum-api-patungin-gpt-5.5` ke `http://127.0.0.1:8787/v1`.
3. Isi token provider di config lokal masing-masing.
4. Test `curl http://127.0.0.1:8787/health`.
5. Coba request model lewat proxy.

## Config yang benar

```json
{
  "models": {
    "providers": {
      "costum-api-patungin-gpt-5.5": {
        "baseUrl": "http://127.0.0.1:8787/v1",
        "apiKey": "TOKEN_PROVIDER_LOKAL_MASING_MASING"
      }
    }
  }
}
```

## Hal yang tidak boleh dibagikan

- token provider live
- token proxy live jika suatu saat ada mode auth tambahan
- token dashboard/admin
- file env lokal

## Troubleshooting 403

- cek proxy hidup
- cek baseUrl tidak dobel `/v1`
- cek token provider benar
- cek path request benar
- cek log proxy

## Catatan tim

Kalau ada anggota lain yang mau pakai, mereka tinggal clone repo ini dan ikuti README + blueprint ini. Mereka tetap harus pakai config lokal masing-masing.
