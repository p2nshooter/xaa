'use client';

import { useActionState, useMemo, useState } from 'react';
import Link from 'next/link';
import { createProjectAction, type ActionState } from '@/server/actions';
import { PACKAGES, ADDONS, SETUP_PLANS, CARE_PLANS, eur, usd, priceRange, TIER_LABEL } from '@/content/packages';
import { Submit, Notice } from './Submit';

/**
 * The order form. It quotes live as the client picks: package + add-ons give a
 * range, and the 10/40/50 split is shown against the bottom of that range —
 * the same figure the portal will actually ask for, so nothing is a surprise
 * once the project exists.
 */
export function NewProjectForm({
  defaultPackage,
  defaultSetup,
  defaultCare,
}: {
  defaultPackage?: string;
  defaultSetup?: string;
  defaultCare?: string;
}) {
  const [state, action] = useActionState<ActionState, FormData>(createProjectAction, {});
  const [pkgSlug, setPkgSlug] = useState(defaultPackage && PACKAGES.some((p) => p.slug === defaultPackage) ? defaultPackage : PACKAGES[0]!.slug);
  const [addons, setAddons] = useState<string[]>([]);
  const [setup, setSetup] = useState(defaultSetup ?? '');
  const [care, setCare] = useState(defaultCare ?? '');

  const pkg = PACKAGES.find((p) => p.slug === pkgSlug)!;

  const quote = useMemo(() => {
    const addonMin = addons.reduce((s, a) => s + (ADDONS.find((x) => x.slug === a)?.priceMin ?? 0), 0);
    const addonMax = addons.reduce((s, a) => s + (ADDONS.find((x) => x.slug === a)?.priceMax ?? 0), 0);
    const min = pkg.priceMin + addonMin;
    const max = pkg.priceMax + addonMax;
    return {
      min,
      max,
      deposit: Math.round(min * 0.1),
      production: Math.round(min * 0.4),
      settlement: min - Math.round(min * 0.1) - Math.round(min * 0.4),
    };
  }, [pkg, addons]);

  const setupPlan = SETUP_PLANS.find((s) => s.slug === setup);
  const carePlan = CARE_PLANS.find((c) => c.slug === care);

  const toggleAddon = (slug: string) =>
    setAddons((prev) => (prev.includes(slug) ? prev.filter((x) => x !== slug) : [...prev, slug]));

  return (
    <form action={action} className="grid gap-8 lg:grid-cols-[1.35fr_.65fr] lg:items-start">
      <div className="space-y-8">
        <Notice error={state.error} ok={state.ok} />

        {/* 1 — package */}
        <section className="panel p-6">
          <h2 className="font-display text-xl font-extrabold">
            <span className="mr-2 text-gold-500">01</span> Choose your package
          </h2>
          <p className="mt-1 text-sm text-steel-500">
            Not sure? Pick the closest — we confirm the right one during the scope review, before any money moves past
            the deposit.
          </p>
          <div className="mt-5 grid gap-3">
            {PACKAGES.map((p) => (
              <label
                key={p.slug}
                className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition ${
                  pkgSlug === p.slug ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]/20' : 'border-[color:var(--accent-soft)] hover:bg-ivory-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="package"
                  value={p.slug}
                  checked={pkgSlug === p.slug}
                  onChange={() => setPkgSlug(p.slug)}
                  className="mt-1"
                />
                <span className="flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold">
                      <span className="mr-2 font-mono text-xs text-steel-500">{p.code}</span>
                      {p.name}
                      <span className="ml-2 badge badge-grey">{TIER_LABEL[p.tier]}</span>
                    </span>
                    <span className="whitespace-nowrap font-serif font-extrabold">{priceRange(p.priceMin, p.priceMax, p.openEnded)}</span>
                  </span>
                  <span className="mt-1 block text-sm leading-relaxed text-steel-500">{p.summary}</span>
                  <span className="mt-1.5 block text-xs text-steel-500">{p.timeline} · {p.pages}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* 2 — project details */}
        <section className="panel p-6">
          <h2 className="font-display text-xl font-extrabold">
            <span className="mr-2 text-gold-500">02</span> Tell us about the project
          </h2>
          <div className="mt-5">
            <label className="field">
              <span>Project name *</span>
              <input name="title" className="input" required placeholder="e.g. Nordvik Consulting — new company site" />
              <span className="hint">Your company, product or campaign. It appears on your project page and invoices.</span>
            </label>
            <label className="field">
              <span>What are you building?</span>
              <textarea
                name="scope"
                className="textarea"
                rows={6}
                placeholder="What the site or platform has to do, who uses it, what exists today, any deadline you are working towards. You can upload your full concept, brand files and content after the deposit."
              />
            </label>
          </div>
        </section>

        {/* 3 — add-ons */}
        <section className="panel p-6">
          <h2 className="font-display text-xl font-extrabold">
            <span className="mr-2 text-gold-500">03</span> Add-on services <span className="text-sm font-normal text-steel-500">(optional)</span>
          </h2>
          <p className="mt-1 text-sm text-steel-500">Each is quoted on its own and folded into your milestone schedule.</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {ADDONS.map((a) => (
              <label
                key={a.slug}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm transition ${
                  addons.includes(a.slug) ? 'border-[color:var(--accent)] bg-[color:var(--accent-soft)]/20' : 'border-[color:var(--accent-soft)] hover:bg-ivory-100/60'
                }`}
              >
                <input type="checkbox" name="addons" value={a.slug} checked={addons.includes(a.slug)} onChange={() => toggleAddon(a.slug)} className="mt-1" />
                <span>
                  <span className="block font-semibold">{a.name}</span>
                  <span className="block text-xs text-steel-500">{priceRange(a.priceMin, a.priceMax, a.openEnded)}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* 4 — setup & care */}
        <section className="panel p-6">
          <h2 className="font-display text-xl font-extrabold">
            <span className="mr-2 text-gold-500">04</span> Setup & care <span className="text-sm font-normal text-steel-500">(optional, priced separately)</span>
          </h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">One-time setup</p>
              <select name="setup" className="select mt-2" value={setup} onChange={(e) => setSetup(e.target.value)}>
                <option value="">No setup — I will handle it</option>
                {SETUP_PLANS.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — {s.custom ? `from ${eur(s.price)}` : priceRange(s.price, s.priceMax ?? s.price)}
                  </option>
                ))}
              </select>
              {setupPlan ? <p className="hint">{setupPlan.blurb}</p> : null}
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Monthly care</p>
              <select name="care" className="select mt-2" value={care} onChange={(e) => setCare(e.target.value)}>
                <option value="">No care plan for now</option>
                {CARE_PLANS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} — {c.custom ? `from ${eur(c.price)}` : eur(c.price)}/month
                  </option>
                ))}
              </select>
              {carePlan ? <p className="hint">{carePlan.blurb}</p> : null}
            </div>
          </div>
          <p className="hint mt-4">
            Both start only after handover, are invoiced separately from the build, and can be added or dropped later.
          </p>
        </section>
      </div>

      {/* Live quote */}
      <aside className="panel sticky top-20 h-fit p-6">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-gold-500">Your quote</p>
        <h3 className="mt-1 font-display text-lg font-extrabold">{pkg.name}</h3>
        <p className="mt-3 font-display text-2xl font-extrabold accent-text">
          {eur(quote.min)} – {eur(quote.max)}{pkg.openEnded ? '+' : ''}
        </p>
        <p className="text-xs text-steel-500">≈ {usd(quote.min)} – {usd(quote.max)} in USDT · indicative until scope review</p>

        {addons.length ? (
          <ul className="mt-4 space-y-1 border-t border-[color:var(--accent-soft)] pt-3 text-xs">
            {addons.map((a) => {
              const add = ADDONS.find((x) => x.slug === a)!;
              return (
                <li key={a} className="flex justify-between gap-2">
                  <span>+ {add.name}</span>
                  <span className="text-steel-500">{priceRange(add.priceMin, add.priceMax, add.openEnded)}</span>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-5 rounded-lg bg-ivory-100/70 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wide text-steel-500">Milestone schedule</p>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex justify-between"><span>1. Deposit (10%)</span><strong>{eur(quote.deposit)}</strong></div>
            <div className="flex justify-between"><span>2. Production (40%)</span><strong>{eur(quote.production)}</strong></div>
            <div className="flex justify-between"><span>3. Settlement (50%)</span><strong>{eur(quote.settlement)}</strong></div>
          </div>
          <p className="hint mt-2">Calculated on the lower bound. Recalculated automatically when the contract value is confirmed.</p>
        </div>

        {setupPlan || carePlan ? (
          <div className="mt-4 space-y-1.5 border-t border-[color:var(--accent-soft)] pt-3 text-sm">
            {setupPlan ? (
              <div className="flex justify-between">
                <span>Setup (one-time)</span>
                <strong>{setupPlan.custom ? `from ${eur(setupPlan.price)}` : priceRange(setupPlan.price, setupPlan.priceMax ?? setupPlan.price)}</strong>
              </div>
            ) : null}
            {carePlan ? (
              <div className="flex justify-between">
                <span>Care (monthly)</span>
                <strong>{carePlan.custom ? `from ${eur(carePlan.price)}` : eur(carePlan.price)}/mo</strong>
              </div>
            ) : null}
            <p className="hint">Invoiced separately from the build.</p>
          </div>
        ) : null}

        <label className="mt-5 flex cursor-pointer items-start gap-2 text-xs leading-relaxed">
          <input type="checkbox" name="terms" value="1" className="mt-0.5" required />
          <span>
            I accept the <Link href="/terms" className="underline" target="_blank">terms of engagement</Link> and understand
            the 10 / 40 / 50 milestone schedule.
          </span>
        </label>

        <Submit className="btn btn-primary mt-4 w-full" pendingLabel="Opening project…">
          Open project — deposit {eur(quote.deposit)}
        </Submit>
        <p className="hint mt-2 text-center">Nothing is charged now. The deposit is paid from your project page.</p>
      </aside>
    </form>
  );
}
