import { appEnv, newId, nowIso } from './db';
import { data } from './data';
import { messageId, messageStream, messagesAfter } from './r2/schema';
import { knowledgeFor, scrub, type Topic } from './support-kb';
import { readyTemplateSlugs } from './store';

/**
 * Live support chat.
 *
 * Visitors chat without an account: a thread is bound to a random token in an
 * httpOnly cookie. When the studio is online (an admin has the Support desk
 * open — it pings every 20 s), messages wait for a human. When nobody is
 * online, the AI answers from the public knowledge pack only (support-kb.ts),
 * through the ulyah.com Orchestra key pool, and every AI reply is scrubbed
 * before it is stored. Contact-form briefs open a thread too, so the admin has
 * one inbox for everything.
 *
 * Storage (R2): a thread is a document (c/support_threads/…, unique token);
 * its messages are an append-only log l/support/<threadId>/<time>-<id>, so
 * "messages after X" is one list call from a position, never a scan.
 */

export interface SupportThread {
  id: string;
  token: string;
  name: string;
  email: string;
  topic: Topic;
  source: 'chat' | 'contact';
  lang: string;
  status: 'open' | 'closed';
  user_id: string | null;
  unread_admin: number;
  ai_replies: number;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  thread_id: string;
  sender: 'visitor' | 'admin' | 'ai' | 'system';
  body: string;
  created_at: string;
}

const PRESENCE_KEY = 'presence/support-admin';
const ONLINE_WINDOW_MS = 90_000;
const MAX_AI_REPLIES_PER_THREAD = 25;
const DEFAULT_AI_URL = 'https://api.ulyah.com/ai/reader';

export const TOPIC_LABEL: Record<Topic, string> = {
  quote: 'Offer / quote',
  negotiate: 'Price negotiation',
  crypto: 'Pay with crypto',
  bank: 'Bank transfer (BNI)',
  templates: 'SaaS templates',
  project: 'My project',
  other: 'Other',
};

function token(): string {
  return [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ───────── presence ───────── */

export async function markAdminOnline(): Promise<void> {
  const d = await data();
  await d.store.updateDoc<{ at: number }>(PRESENCE_KEY, { at: 0 }, () => ({ at: Date.now() }));
}

export async function adminOnline(): Promise<boolean> {
  try {
    const d = await data();
    const seen = await d.store.getDoc<{ at: number }>(PRESENCE_KEY, { at: 0 });
    return Date.now() - Number(seen.at) < ONLINE_WINDOW_MS;
  } catch {
    return false;
  }
}

/* ───────── threads & messages ───────── */

async function insertMessage(threadId: string, sender: SupportMessage['sender'], body: string): Promise<SupportMessage> {
  const d = await data();
  const m: SupportMessage = { id: newId(), thread_id: threadId, sender, body: body.slice(0, 4000), created_at: nowIso() };
  await d.store.append(messageStream(threadId), messageId(m.created_at, m.id), m);
  if (await d.threads.get(threadId)) {
    await d.threads.update(threadId, (t) => ({
      ...t,
      updated_at: m.created_at,
      unread_admin: sender === 'visitor' ? t.unread_admin + 1 : sender === 'admin' ? 0 : t.unread_admin,
      ai_replies: sender === 'ai' ? t.ai_replies + 1 : t.ai_replies,
    }));
  }
  return m;
}

export async function createThread(input: {
  name: string; email: string; topic: Topic; lang: string; source?: 'chat' | 'contact'; userId?: string | null; firstMessage: string;
}): Promise<SupportThread> {
  const d = await data();
  const now = nowIso();
  const t: SupportThread = {
    id: newId(), token: token(), name: input.name.slice(0, 80), email: input.email.slice(0, 160).toLowerCase(),
    topic: input.topic, source: input.source ?? 'chat', lang: input.lang, status: 'open', user_id: input.userId ?? null,
    unread_admin: 0, ai_replies: 0, created_at: now, updated_at: now,
  };
  await d.threads.create(t);
  await insertMessage(t.id, 'visitor', input.firstMessage);
  return t;
}

export async function threadByToken(tok: string | undefined | null): Promise<SupportThread | null> {
  if (!tok || !/^[0-9a-f]{48}$/.test(tok)) return null;
  return (await data()).threads.find('token', tok);
}

export async function getThread(id: string): Promise<SupportThread | null> {
  return (await data()).threads.get(id);
}

export async function listMessages(threadId: string, after?: string): Promise<SupportMessage[]> {
  const d = await data();
  const entries = await d.store.readLog<SupportMessage>(messageStream(threadId), after ? { after: messagesAfter(after) } : {});
  return entries.map((e) => e.value);
}

export async function listThreads(limit = 100): Promise<SupportThread[]> {
  return (await (await data()).threads.listDocs('recent', 'all', { limit })).docs;
}

export async function countUnreadThreads(): Promise<number> {
  try {
    return await (await data()).threads.count('unread', 'all');
  } catch {
    return 0;
  }
}

export async function adminReply(threadId: string, body: string): Promise<void> {
  await insertMessage(threadId, 'admin', body);
}

export async function markThreadRead(threadId: string): Promise<void> {
  const d = await data();
  if (!(await d.threads.get(threadId))) return;
  await d.threads.update(threadId, (t) => (t.unread_admin === 0 ? null : { ...t, unread_admin: 0 }));
}

export async function setThreadStatus(threadId: string, status: 'open' | 'closed'): Promise<void> {
  const d = await data();
  if (!(await d.threads.get(threadId))) return;
  await d.threads.update(threadId, (t) => ({ ...t, status, updated_at: nowIso() }));
}

/* ───────── visitor message + AI fallback ───────── */

const OFFLINE_NOTE: Record<string, string> = {
  en: 'Thanks — the studio team is offline right now. Your message is saved and a person will reply here; you can close this window and come back later.',
  es: 'Gracias: el equipo no está conectado ahora mismo. Tu mensaje está guardado y una persona te responderá aquí; puedes cerrar esta ventana y volver más tarde.',
  id: 'Terima kasih — tim studio sedang offline. Pesan Anda tersimpan dan akan dibalas di sini oleh tim; Anda boleh menutup jendela ini dan kembali nanti.',
};

/** Ask the ulyah.com Orchestra pool, grounded only in the public knowledge pack. */
async function askAi(thread: SupportThread, question: string): Promise<string | null> {
  const env = (await appEnv()) as { SUPPORT_AI_URL?: string };
  const url = env.SUPPORT_AI_URL || DEFAULT_AI_URL;
  const history = (await listMessages(thread.id)).slice(-6)
    .map((m) => `${m.sender === 'visitor' ? 'Visitor' : m.sender === 'admin' ? 'Studio' : 'Assistant'}: ${m.body}`).join('\n');
  const ready = thread.topic === 'templates' ? await readyTemplateSlugs().catch(() => undefined) : undefined;
  const context = `${knowledgeFor(thread.topic, ready)}\n\nCONVERSATION SO FAR (topic: ${TOPIC_LABEL[thread.topic]}):\n${history}`.slice(-6000);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'content-type': 'application/json', origin: 'https://xaa.es' },
      body: JSON.stringify({ task: 'ask', context, question: question.slice(0, 300), locale: thread.lang }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { result?: string };
    const text = scrub(j.result ?? '');
    return text.length >= 2 ? text.slice(0, 1500) : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * When no admin is online, answer automatically: the AI's reply if it has one,
 * otherwise a plain "a person will get back to you" — posted once, not after
 * every message.
 */
export async function autoReply(thread: SupportThread, question: string): Promise<SupportMessage[]> {
  if (await adminOnline()) return [];
  const ai = thread.ai_replies < MAX_AI_REPLIES_PER_THREAD ? await askAi(thread, question) : null;
  if (ai) return [await insertMessage(thread.id, 'ai', ai)];
  const recent = await listMessages(thread.id);
  const lastHuman = [...recent].reverse().findIndex((m) => m.sender === 'admin');
  const sinceHuman = lastHuman === -1 ? recent : recent.slice(recent.length - lastHuman);
  if (sinceHuman.some((m) => m.sender === 'system')) return [];
  return [await insertMessage(thread.id, 'system', OFFLINE_NOTE[thread.lang] ?? OFFLINE_NOTE.en!)];
}

/** Store a visitor message, then any automatic reply. */
export async function visitorMessage(thread: SupportThread, body: string): Promise<SupportMessage[]> {
  if (thread.status === 'closed') await setThreadStatus(thread.id, 'open');
  const mine = await insertMessage(thread.id, 'visitor', body);
  return [mine, ...(await autoReply(thread, body))];
}
