/**
 * Live demos of the SaaS templates, published under /demos/<slug>/ by
 * tools/demos/import-template-demo.mjs from the private template repository.
 * Each JSON file holds the demo address, the demo account the demo fills in
 * (it only exists in the visitor's own browser) and the animated screenshots
 * of every menu, with titles and captions in EN/ES/ID.
 */
import type { Lang } from '@/lib/i18n';
import waitlist from './demos/waitlist.json';

export interface DemoShot {
  id: string;
  device: 'desktop' | 'phone';
  title: Record<Lang, string>;
  caption: Record<Lang, string>;
  src: string;
  poster: string;
  width: number;
  height: number;
}

export interface TemplateDemo {
  slug: string;
  url: string;
  login: string;
  account: { email: string; password: string };
  updated: string;
  shots: DemoShot[];
}

export const TEMPLATE_DEMOS: Record<string, TemplateDemo> = {
  waitlist: waitlist as TemplateDemo,
};

export const demoFor = (slug: string): TemplateDemo | undefined => TEMPLATE_DEMOS[slug];
