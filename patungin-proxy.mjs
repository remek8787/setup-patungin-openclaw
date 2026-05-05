import http from 'node:http';
import { readFileSync } from 'node:fs';

const LISTEN_HOST = process.env.PATUNGIN_PROXY_HOST || '127.0.0.1';
const LISTEN_PORT = Number(process.env.PATUNGIN_PROXY_PORT || 8787);
const UPSTREAM = (process.env.PATUNGIN_UPSTREAM || 'https://ai.patungin.id/v1').replace(/\/$/, '');
const CONFIG_PATH = process.env.OPENCLAW_CONFIG || '/root/.openclaw/openclaw.json';

function getApiKey() {
  if (process.env.PATUNGIN_API_KEY) return process.env.PATUNGIN_API_KEY;

  const data = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  const providers = data?.models?.providers || {};
  const provider =
    providers['costum-api-patungin-gpt-5.5'] ||
    providers.patungin ||
    Object.values(providers).find((item) => item?.baseUrl?.includes('ai.patungin.id'));

  if (!provider?.apiKey) {
    throw new Error('Patungin apiKey not found. Set PATUNGIN_API_KEY or models.providers.costum-api-patungin-gpt-5.5.apiKey');
  }

  return provider.apiKey;
}

function collect(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/health') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ ok: true, upstream: UPSTREAM }));
      return;
    }

    let path = url.pathname;
    if (path.startsWith('/v1/')) path = path.slice(3);

    const target = UPSTREAM + path + url.search;
    const body = ['GET', 'HEAD'].includes(req.method || 'GET') ? undefined : await collect(req);

    const upstreamRes = await fetch(target, {
      method: req.method,
      headers: {
        authorization: `Bearer ${getApiKey()}`,
        'content-type': req.headers['content-type'] || 'application/json',
        accept: req.headers.accept || 'application/json',
        'user-agent': 'OpenClaw/1.0 PatunginProxy/1.0',
      },
      body,
      redirect: 'manual',
    });

    const outHeaders = {};
    for (const [key, value] of upstreamRes.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding', 'connection', 'keep-alive'].includes(key.toLowerCase())) {
        outHeaders[key] = value;
      }
    }

    res.writeHead(upstreamRes.status, outHeaders);
    if (upstreamRes.body) {
      const reader = upstreamRes.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(Buffer.from(value));
      }
    }
    res.end();
  } catch (error) {
    console.error(new Date().toISOString(), error?.stack || error);
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: { message: String(error?.message || error), type: 'patungin_proxy_error' } }));
  }
});

server.listen(LISTEN_PORT, LISTEN_HOST, () => {
  console.log(`Patungin proxy listening on http://${LISTEN_HOST}:${LISTEN_PORT}/v1 -> ${UPSTREAM}`);
});
