'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Lang } from '@/lib/i18n';

/**
 * Floating support chat. Opens a conversation with the studio: when an admin
 * is online they answer; otherwise the AI assistant answers from public site
 * information only, and a person follows up. Polls only while open and the
 * tab is visible.
 */

type Msg = { id: string; sender: 'visitor' | 'admin' | 'ai' | 'system'; body: string; at: string };

const TOPICS = ['quote', 'negotiate', 'crypto', 'bank', 'templates', 'project', 'other'] as const;

const T: Record<Lang, {
  open: string; title: string; online: string; offline: string; intro: string; name: string; email: string; topic: string;
  topics: Record<(typeof TOPICS)[number], string>; message: string; start: string; send: string; placeholder: string;
  you: string; studio: string; ai: string; aiNote: string; newChat: string; error: string; close: string;
}> = {
  en: {
    open: 'Chat with us', title: 'XAA support', online: 'Studio online', offline: 'Studio offline — AI assistant answers',
    intro: 'Ask about offers, prices or payments. A studio member answers when online; otherwise our AI assistant replies from the information on this site and a person follows up.',
    name: 'Your name', email: 'Email (for our reply)', topic: 'What is it about?',
    topics: { quote: 'Get an offer / quote', negotiate: 'Negotiate the price', crypto: 'Pay with crypto (USDT, BTC…)', bank: 'Pay by bank transfer (BNI)', templates: 'SaaS templates', project: 'My project / client portal', other: 'Something else' },
    message: 'Your message', start: 'Start chat', send: 'Send', placeholder: 'Type a message…', you: 'You', studio: 'XAA studio', ai: 'AI assistant',
    aiNote: 'Automatic answer from public site information — a person will confirm anything binding.', newChat: 'New conversation', error: 'Could not send — please try again.', close: 'Close chat',
  },
  es: {
    open: 'Chatea con nosotros', title: 'Soporte XAA', online: 'Estudio conectado', offline: 'Estudio desconectado — responde el asistente IA',
    intro: 'Pregunta por ofertas, precios o pagos. Un miembro del estudio responde cuando está conectado; si no, nuestro asistente IA responde con la información de esta web y una persona hace el seguimiento.',
    name: 'Tu nombre', email: 'Email (para responderte)', topic: '¿Sobre qué es?',
    topics: { quote: 'Pedir una oferta / presupuesto', negotiate: 'Negociar el precio', crypto: 'Pagar con cripto (USDT, BTC…)', bank: 'Pagar por transferencia (BNI)', templates: 'Plantillas SaaS', project: 'Mi proyecto / portal de clientes', other: 'Otra cosa' },
    message: 'Tu mensaje', start: 'Iniciar chat', send: 'Enviar', placeholder: 'Escribe un mensaje…', you: 'Tú', studio: 'Estudio XAA', ai: 'Asistente IA',
    aiNote: 'Respuesta automática con información pública de la web; una persona confirmará lo que sea vinculante.', newChat: 'Nueva conversación', error: 'No se pudo enviar; inténtalo de nuevo.', close: 'Cerrar chat',
  },
  id: {
    open: 'Chat dengan kami', title: 'Dukungan XAA', online: 'Studio online', offline: 'Studio offline — dijawab asisten AI',
    intro: 'Tanyakan penawaran, harga atau pembayaran. Tim studio menjawab saat online; jika tidak, asisten AI kami menjawab dari informasi di situs ini lalu tim akan menindaklanjuti.',
    name: 'Nama Anda', email: 'Email (untuk balasan)', topic: 'Tentang apa?',
    topics: { quote: 'Minta penawaran / harga', negotiate: 'Nego harga', crypto: 'Bayar dengan kripto (USDT, BTC…)', bank: 'Bayar via transfer bank (BNI)', templates: 'Template SaaS', project: 'Proyek saya / portal klien', other: 'Lainnya' },
    message: 'Pesan Anda', start: 'Mulai chat', send: 'Kirim', placeholder: 'Tulis pesan…', you: 'Anda', studio: 'Studio XAA', ai: 'Asisten AI',
    aiNote: 'Jawaban otomatis dari informasi publik situs — hal yang mengikat akan dikonfirmasi oleh tim.', newChat: 'Percakapan baru', error: 'Gagal mengirim — coba lagi.', close: 'Tutup chat',
  },
};

export function SupportWidget({ lang }: { lang: Lang }) {
  const t = T[lang] ?? T.en;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [hasThread, setHasThread] = useState(false);
  const [online, setOnline] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [form, setForm] = useState({ name: '', email: '', topic: 'quote' as (typeof TOPICS)[number], message: '', website: '' });
  const listRef = useRef<HTMLDivElement>(null);
  const lastAt = msgs.length ? msgs[msgs.length - 1]!.at : undefined;

  const merge = useCallback((incoming: Msg[]) => {
    setMsgs((cur) => {
      const seen = new Set(cur.map((m) => m.id));
      return [...cur, ...incoming.filter((m) => !seen.has(m.id))].sort((a, b) => a.at.localeCompare(b.at));
    });
  }, []);

  const poll = useCallback(async (after?: string) => {
    try {
      const r = await fetch(`/api/support${after ? `?after=${encodeURIComponent(after)}` : ''}`, { cache: 'no-store' });
      const j = await r.json();
      setOnline(Boolean(j.online));
      if (j.thread) {
        setHasThread(true);
        merge(j.messages ?? []);
      }
    } catch { /* offline — try again next tick */ }
    setLoaded(true);
  }, [merge]);

  useEffect(() => {
    if (!open) return;
    if (!loaded) void poll();
    const id = setInterval(() => { if (document.visibilityState === 'visible') void poll(lastAt); }, 6000);
    return () => clearInterval(id);
  }, [open, loaded, poll, lastAt]);

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }); }, [msgs, open]);

  if (pathname?.startsWith('/portal/admin')) return null;

  const post = async (payload: Record<string, unknown>) => {
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/support', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
      const j = await r.json();
      if (!r.ok) { setErr(j.error || t.error); return null; }
      return j;
    } catch { setErr(t.error); return null; } finally { setBusy(false); }
  };

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    const j = await post({ action: 'start', ...form, lang });
    if (j) { setHasThread(true); setOnline(Boolean(j.online)); merge(j.messages ?? []); }
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    const j = await post({ action: 'send', message: body });
    if (j) { setText(''); merge(j.messages ?? []); }
  };

  const reset = async () => {
    await post({ action: 'reset' });
    setHasThread(false); setMsgs([]); setForm((f) => ({ ...f, message: '' }));
  };

  const who = (m: Msg) => (m.sender === 'visitor' ? t.you : m.sender === 'admin' ? t.studio : m.sender === 'ai' ? t.ai : 'XAA');

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end" data-support-widget>
      {open ? (
        <div role="dialog" aria-label={t.title} className="mb-3 flex max-h-[min(640px,calc(100vh-6rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[color:var(--line)] bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[color:var(--accent-ink)] px-4 py-3 text-white">
            <div>
              <p className="text-sm font-bold">{t.title}</p>
              <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                <span className={`inline-block h-2 w-2 rounded-full ${online ? 'bg-green-400' : 'bg-amber-300'}`} />
                {online ? t.online : t.offline}
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.close} className="rounded-full px-2 text-lg leading-none text-white/80 hover:text-white">×</button>
          </div>

          {!hasThread ? (
            <form onSubmit={start} className="space-y-2.5 overflow-y-auto p-4 text-sm">
              <p className="text-xs leading-relaxed text-steel-500">{t.intro}</p>
              <label className="block"><span className="text-xs font-semibold">{t.topic}</span>
                <select className="select mt-1 w-full" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value as (typeof TOPICS)[number] })}>
                  {TOPICS.map((k) => <option key={k} value={k}>{t.topics[k]}</option>)}
                </select>
              </label>
              <label className="block"><span className="text-xs font-semibold">{t.name}</span>
                <input className="input mt-1 w-full" required maxLength={80} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="block"><span className="text-xs font-semibold">{t.email}</span>
                <input className="input mt-1 w-full" type="email" required maxLength={160} autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block"><span className="text-xs font-semibold">{t.message}</span>
                <textarea className="textarea mt-1 w-full" rows={3} required maxLength={2000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>
              <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} name="website" />
              {err ? <p className="text-xs text-red-600">{err}</p> : null}
              <button type="submit" disabled={busy} className="btn btn-primary btn-sm w-full">{busy ? '…' : t.start}</button>
            </form>
          ) : (
            <>
              <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-[color:var(--surface)] p-3" aria-live="polite">
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.sender === 'visitor' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${m.sender === 'visitor' ? 'bg-[color:var(--accent-ink)] text-white' : m.sender === 'system' ? 'bg-amber-50 text-amber-900' : 'bg-white text-ink-900 shadow-sm'}`}>
                      <p className={`mb-0.5 text-[10px] font-bold uppercase tracking-wide ${m.sender === 'visitor' ? 'text-white/70' : 'text-steel-500'}`}>{who(m)}</p>
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      {m.sender === 'ai' ? <p className="mt-1 text-[10px] text-steel-500">{t.aiNote}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-[color:var(--line)] p-2.5">
                <input className="input flex-1" value={text} maxLength={2000} placeholder={t.placeholder} onChange={(e) => setText(e.target.value)} aria-label={t.message} />
                <button type="submit" disabled={busy || !text.trim()} className="btn btn-primary btn-sm">{t.send}</button>
              </form>
              <div className="flex items-center justify-between px-3 pb-2 text-[11px]">
                {err ? <span className="text-red-600">{err}</span> : <span />}
                <button type="button" onClick={reset} className="text-steel-500 underline hover:text-gold-500">{t.newChat}</button>
              </div>
            </>
          )}
        </div>
      ) : null}
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="btn btn-primary rounded-full px-5 shadow-xl">
        💬 {t.open}
      </button>
    </div>
  );
}
