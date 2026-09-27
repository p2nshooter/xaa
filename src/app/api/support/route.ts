import { cookies } from 'next/headers';
import { currentUser } from '@/server/auth';
import { isTopic } from '@/server/support-kb';
import { createThread, threadByToken, listMessages, visitorMessage, autoReply, adminOnline } from '@/server/support';

/**
 * Visitor side of the support chat.
 *   GET                         → the visitor's thread and messages (optionally ?after=ISO)
 *   POST {action:'start', …}    → open a thread (name, email, topic, message)
 *   POST {action:'send', message}
 *   POST {action:'reset'}       → forget this browser's thread, to start a new one
 * The thread is identified only by an httpOnly cookie token; nothing here can
 * read another visitor's conversation.
 */
export const dynamic = 'force-dynamic';

const COOKIE = 'xaa_support';
const MAX_PER_HOUR = 40;

function clean(v: unknown, max: number): string {
  return typeof v === 'string' ? v.replace(/\u0000/g, '').trim().slice(0, max) : '';
}

function publicMessages(ms: Awaited<ReturnType<typeof listMessages>>) {
  return ms.map((m) => ({ id: m.id, sender: m.sender, body: m.body, at: m.created_at }));
}

export async function GET(req: Request) {
  try {
    const jar = await cookies();
    const thread = await threadByToken(jar.get(COOKIE)?.value);
    const online = await adminOnline();
    if (!thread) return Response.json({ thread: null, messages: [], online });
    const after = new URL(req.url).searchParams.get('after') ?? undefined;
    const messages = await listMessages(thread.id, after && /^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(after) ? after : undefined);
    return Response.json(
      { thread: { name: thread.name, topic: thread.topic, status: thread.status }, messages: publicMessages(messages), online },
      { headers: { 'cache-control': 'no-store' } }
    );
  } catch {
    return Response.json({ error: 'Chat is temporarily unavailable.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: 'Bad request' }, { status: 400 });
  }
  const jar = await cookies();
  try {
    if (body.action === 'reset') {
      jar.delete(COOKIE);
      return Response.json({ ok: true });
    }

    if (body.action === 'start') {
      if (clean(body.website, 50)) return Response.json({ ok: true }); // honeypot: bots fill it, people never see it
      const name = clean(body.name, 80);
      const email = clean(body.email, 160);
      const message = clean(body.message, 2000);
      const lang = ['en', 'es', 'id'].includes(String(body.lang)) ? String(body.lang) : 'en';
      if (!name || !message) return Response.json({ error: 'name and message are required' }, { status: 400 });
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return Response.json({ error: 'a valid email is required' }, { status: 400 });
      if (!isTopic(body.topic)) return Response.json({ error: 'choose a topic' }, { status: 400 });
      const user = await currentUser();
      const thread = await createThread({ name, email, topic: body.topic, lang, userId: user?.id ?? null, firstMessage: message });
      jar.set(COOKIE, thread.token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 90 });
      await autoReply(thread, message);
      return Response.json({ ok: true, messages: publicMessages(await listMessages(thread.id)), online: await adminOnline() });
    }

    if (body.action === 'send') {
      const thread = await threadByToken(jar.get(COOKIE)?.value);
      if (!thread) return Response.json({ error: 'no conversation — start a new one' }, { status: 404 });
      const message = clean(body.message, 2000);
      if (!message) return Response.json({ error: 'empty message' }, { status: 400 });
      const hourAgo = new Date(Date.now() - 3600_000).toISOString();
      const recent = (await listMessages(thread.id, hourAgo)).filter((m) => m.sender === 'visitor').length;
      if (recent >= MAX_PER_HOUR) return Response.json({ error: 'Too many messages — please wait a little.' }, { status: 429 });
      const added = await visitorMessage(thread, message);
      return Response.json({ ok: true, messages: publicMessages(added) });
    }

    return Response.json({ error: 'unknown action' }, { status: 400 });
  } catch {
    return Response.json({ error: 'Chat is temporarily unavailable. Please use the contact page.' }, { status: 503 });
  }
}
