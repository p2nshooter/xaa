// A small stand-in for PayPal's Sandbox REST API, so the PayPal Checkout flow
// can be tested end to end without network access or real credentials.
//
//   node tools/e2e/paypal-mock.mjs            (listens on 127.0.0.1:8899)
//   wrangler dev ... --var PAYPAL_SANDBOX_API:http://127.0.0.1:8899
//
// It implements exactly what server/paypal.ts calls: OAuth, create / get /
// capture an order, and webhook signature verification — plus an approval
// page with "Approve", "Approve and close the tab" and "Cancel" links that
// play the buyer's part on paypal.com.

import http from 'node:http';

const PORT = Number(process.env.MOCK_PORT || 8899);
export const MOCK_CLIENT_ID = 'mock-sandbox-client-id';
export const MOCK_SECRET = 'mock-sandbox-secret';
const TOKEN = 'mock-access-token';
const orders = new Map();
let seq = 0;

function send(res, code, body, headers = {}) {
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(code, { 'Content-Type': typeof body === 'string' ? 'text/html; charset=utf-8' : 'application/json', ...headers });
  res.end(text);
}

function view(o) {
  const self = `http://127.0.0.1:${PORT}/v2/checkout/orders/${o.id}`;
  return {
    id: o.id,
    status: o.status,
    purchase_units: o.purchase_units.map((pu) => ({
      ...pu,
      ...(o.capture ? { payments: { captures: [o.capture] } } : {}),
    })),
    links: [
      { rel: 'self', href: self, method: 'GET' },
      ...(o.status === 'PAYER_ACTION_REQUIRED'
        ? [{ rel: 'payer-action', href: `http://127.0.0.1:${PORT}/checkoutnow?token=${o.id}`, method: 'GET' }]
        : []),
    ],
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  let raw = '';
  for await (const chunk of req) raw += chunk;
  const auth = req.headers.authorization || '';

  if (req.method === 'POST' && url.pathname === '/v1/oauth2/token') {
    const want = 'Basic ' + Buffer.from(`${MOCK_CLIENT_ID}:${MOCK_SECRET}`).toString('base64');
    if (auth !== want) return send(res, 401, { error: 'invalid_client', error_description: 'Client Authentication failed' });
    return send(res, 200, { access_token: TOKEN, token_type: 'Bearer', expires_in: 32400 });
  }

  // The buyer's side of paypal.com.
  if (req.method === 'GET' && url.pathname === '/checkoutnow') {
    const o = orders.get(url.searchParams.get('token') || '');
    if (!o) return send(res, 404, '<p>unknown order</p>');
    const action = url.searchParams.get('action');
    const ctx = o.ctx || {};
    if (action === 'approve' || action === 'approve-close') {
      o.status = 'APPROVED';
      if (action === 'approve-close') return send(res, 200, '<p id="closed">Approved — the buyer closed the tab.</p>');
      const back = new URL(ctx.return_url);
      back.searchParams.set('token', o.id);
      back.searchParams.set('PayerID', 'MOCKPAYER');
      return send(res, 302, '', { Location: back.toString() });
    }
    if (action === 'cancel') {
      const back = new URL(ctx.cancel_url);
      back.searchParams.set('token', o.id);
      return send(res, 302, '', { Location: back.toString() });
    }
    const pu = o.purchase_units[0];
    return send(
      res,
      200,
      `<!doctype html><title>PayPal (mock)</title><h1>Pay ${pu.amount.value} ${pu.amount.currency_code}</h1>
       <p>${pu.description || ''}</p>
       <a id="approve" href="?token=${o.id}&action=approve">Approve</a>
       <a id="approve-close" href="?token=${o.id}&action=approve-close">Approve and close the tab</a>
       <a id="cancel" href="?token=${o.id}&action=cancel">Cancel and return</a>`
    );
  }

  if (url.pathname === '/__orders') return send(res, 200, [...orders.values()].map(view));
  if (url.pathname === '/favicon.ico') return send(res, 404, '');

  if (auth !== `Bearer ${TOKEN}`) return send(res, 401, { name: 'AUTHENTICATION_FAILURE', message: 'bad token' });

  if (req.method === 'POST' && url.pathname === '/v2/checkout/orders') {
    const body = JSON.parse(raw || '{}');
    const id = `MOCK${++seq}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const o = { id, status: 'PAYER_ACTION_REQUIRED', purchase_units: body.purchase_units, ctx: body.payment_source?.paypal?.experience_context };
    orders.set(id, o);
    return send(res, 200, view(o));
  }

  const m = url.pathname.match(/^\/v2\/checkout\/orders\/([^/]+)(\/capture)?$/);
  if (m) {
    const o = orders.get(decodeURIComponent(m[1]));
    if (!o) return send(res, 404, { name: 'RESOURCE_NOT_FOUND', details: [{ issue: 'INVALID_RESOURCE_ID' }] });
    if (req.method === 'GET' && !m[2]) return send(res, 200, view(o));
    if (req.method === 'POST' && m[2]) {
      if (o.status === 'COMPLETED') return send(res, 422, { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_ALREADY_CAPTURED' }] });
      if (o.status !== 'APPROVED') return send(res, 422, { name: 'UNPROCESSABLE_ENTITY', details: [{ issue: 'ORDER_NOT_APPROVED' }] });
      const pu = o.purchase_units[0];
      o.status = 'COMPLETED';
      o.capture = { id: `CAP-${o.id}`, status: process.env.MOCK_CAPTURE_STATUS || 'COMPLETED', amount: pu.amount, custom_id: pu.custom_id };
      return send(res, 201, view(o));
    }
  }

  if (req.method === 'POST' && url.pathname === '/v1/notifications/verify-webhook-signature') {
    return send(res, 200, { verification_status: 'SUCCESS' });
  }

  send(res, 404, { name: 'NOT_FOUND', path: url.pathname });
});

server.listen(PORT, '127.0.0.1', () => console.log(`paypal mock on http://127.0.0.1:${PORT}`));
