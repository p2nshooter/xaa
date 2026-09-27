import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge rules that every request passes through.
 *
 * 1. One canonical origin: https://xaa.es. `www.xaa.es` and plain-HTTP requests
 *    are 301-redirected there, path and query intact, so search engines see one
 *    site instead of three copies. The HTTP check trusts only what Cloudflare's
 *    edge reports about the visitor's connection (X-Forwarded-Proto / CF-Visitor)
 *    — never the URL the Worker was invoked with, which can read "http" inside
 *    the runtime even for an HTTPS visit and would loop forever.
 *
 * 2. Language URLs. `?lang=es` / `?lang=id` make each language version of a page
 *    its own crawlable URL (hreflang points at them). The language is handed to
 *    the renderer in a request header and stored in the sticky cookie, so the
 *    visitor keeps it as they browse on. The header is always overwritten, so
 *    only the URL can set it — never a client.
 *
 * Kept free of imports from the i18n dictionary so the middleware bundle stays
 * tiny.
 */

const CANONICAL_HOST = 'xaa.es';
const LANGS = ['en', 'es', 'id'];
const LANG_COOKIE = 'xaa_lang';
const URL_LANG_HEADER = 'x-xaa-lang';

function visitorUsedHttp(req: NextRequest): boolean {
  const xfp = req.headers.get('x-forwarded-proto');
  if (xfp) return xfp.split(',')[0]!.trim().toLowerCase() === 'http';
  const visitor = req.headers.get('cf-visitor');
  return visitor ? /"scheme"\s*:\s*"http"/.test(visitor) : false;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const host = (req.headers.get('host') ?? url.host).toLowerCase().split(':')[0];

  if (host === `www.${CANONICAL_HOST}` || (host === CANONICAL_HOST && visitorUsedHttp(req))) {
    return NextResponse.redirect(`https://${CANONICAL_HOST}${url.pathname}${url.search}`, 301);
  }

  // Always SET the header, never just delete it: on the Cloudflare runtime a
  // deleted request header survives into the render, so a client could send
  // its own value. Overwriting with 'none' closes that.
  const requestHeaders = new Headers(req.headers);
  const lang = url.searchParams.get('lang');
  const urlLang = lang && LANGS.includes(lang) ? lang : null;
  requestHeaders.set(URL_LANG_HEADER, urlLang ?? 'none');

  const res = NextResponse.next({ request: { headers: requestHeaders } });
  if (urlLang) res.cookies.set(LANG_COOKIE, urlLang, { path: '/', maxAge: 31536000, sameSite: 'lax' });
  return res;
}

export const config = {
  // Everything except build assets and files served straight from /public.
  matcher: ['/((?!_next/static|_next/image|brand/|company/|og/|favicon|icon\\.svg).*)'],
};
