'use client';

/**
 * The phone-app install bar (owner, 20 Oct 2026): a phone icon at the very top
 * of the page, the app opening without the browser, and the bar gone once
 * xaa.es is installed.
 *
 * Chrome/Edge/Samsung use their own install dialog (caught early by
 * lib/pwa-early.ts); iPhone/iPad and other mobile browsers get short steps.
 * Hidden when the site runs as the installed app, after `appinstalled`, or when
 * Chrome finds the installed app (getInstalledRelatedApps + manifest
 * related_applications). "×" hides it for 14 days. Also registers the service
 * worker.
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { PWA_KEY } from '@/lib/pwa-early';

type Prompt = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
declare global {
  interface Window { __xaaPwa?: { bip: Prompt | null } }
  interface Navigator { getInstalledRelatedApps?: () => Promise<unknown[]>; standalone?: boolean }
}

export interface InstallStrings {
  label: string; title: string; sub: string; install: string; later: string; close: string;
  iosTitle: string; ios: [string, string, string]; androidTitle: string; android: [string, string, string];
}

const EVENT = 'xaa-pwa';
const LATER = 'xaa_pwa_later';
const read = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const write = (k: string, v: string | null) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* storage blocked */ } };
const standalone = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;
type Platform = 'ios' | 'android' | 'desktop';
function platform(): Platform {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}
const subscribe = (cb: () => void) => { window.addEventListener(EVENT, cb); return () => window.removeEventListener(EVENT, cb); };
const getPrompt = () => window.__xaaPwa?.bip ?? null;

function PhoneIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="2.6" />
      <path d="M12 7v7m-3-3 3 3 3-3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

export function InstallBar({ s }: { s: InstallStrings }) {
  const prompt = useSyncExternalStore(subscribe, getPrompt, () => null);
  const [env, setEnv] = useState({ ready: false, installed: false, later: false, platform: 'desktop' as Platform });
  const [guide, setGuide] = useState(false);

  useEffect(() => {
    window.__xaaPwa ??= { bip: null };
    // Fallback if the early <head> script did not run (an old cached page).
    const onPrompt = (e: Event) => { e.preventDefault(); window.__xaaPwa!.bip = e as Prompt; write(PWA_KEY, null); window.dispatchEvent(new Event(EVENT)); };
    const onInstalled = () => { window.__xaaPwa!.bip = null; write(PWA_KEY, '1'); window.dispatchEvent(new Event(EVENT)); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    if (standalone()) write(PWA_KEY, '1');
    const installed = standalone() || read(PWA_KEY) === '1';
    setEnv({ ready: true, installed, later: Number(read(LATER) || 0) > Date.now(), platform: platform() });
    if (!installed && navigator.getInstalledRelatedApps) {
      navigator.getInstalledRelatedApps().then((apps) => {
        if (apps.length) { write(PWA_KEY, '1'); setEnv((x) => ({ ...x, installed: true })); }
      }).catch(() => {});
    }
    const sync = () => setEnv((x) => ({ ...x, installed: standalone() || read(PWA_KEY) === '1' }));
    window.addEventListener(EVENT, sync);
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((reg) => {
        reg.addEventListener('updatefound', () => {
          const w = reg.installing;
          w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) w.postMessage('skipWaiting'); });
        });
      }).catch(() => {});
    }
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const install = useCallback(async () => {
    const p = getPrompt();
    if (!p) { setGuide(true); return; }
    await p.prompt();
    const r = await p.userChoice.catch(() => ({ outcome: 'dismissed' }));
    window.__xaaPwa!.bip = null;
    if (r.outcome === 'accepted') write(PWA_KEY, '1');
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const installed = env.installed && !prompt;
  const show = env.ready && !installed && !env.later && (!!prompt || env.platform !== 'desktop');
  if (!show) return null;
  const steps = env.platform === 'ios' ? s.ios : s.android;
  return (
    <>
      <div className="pwa-bar" role="region" aria-label={s.label} data-testid="pwa-bar">
        <div className="pwa-bar-inner">
          <span className="pwa-bar-icon"><PhoneIcon /></span>
          <p className="pwa-bar-text"><strong>{s.title}</strong><span>{s.sub}</span></p>
          <button type="button" className="pwa-bar-btn" data-testid="pwa-install" onClick={() => void install()}>
            <PhoneIcon size={16} />{s.install}
          </button>
          <button type="button" className="pwa-bar-x" aria-label={s.later} title={s.later} onClick={() => { write(LATER, String(Date.now() + 14 * 86_400_000)); setEnv((x) => ({ ...x, later: true })); }}>×</button>
        </div>
      </div>
      {guide ? (
        <div className="pwa-guide" onClick={() => setGuide(false)} role="dialog" aria-modal="true" aria-labelledby="pwa-guide-title">
          <div className="pwa-guide-card" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-guide-icon"><PhoneIcon size={26} /></div>
            <h3 id="pwa-guide-title">{env.platform === 'ios' ? s.iosTitle : s.androidTitle}</h3>
            <ol>{steps.map((x, i) => <li key={i}><span>{i + 1}</span>{x}</li>)}</ol>
            <button type="button" className="btn btn-primary w-full" onClick={() => setGuide(false)} autoFocus>{s.close}</button>
          </div>
        </div>
      ) : null}
    </>
  );
}
