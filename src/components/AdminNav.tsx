import Link from 'next/link';

/** Studio desk sections. One place, so every admin page carries the same set. */
export function AdminNav({ current, newLeads = 0 }: { current: string; newLeads?: number }) {
  const items: { href: string; label: string; badge?: number }[] = [
    { href: '/portal/admin', label: 'Overview' },
    { href: '/portal/admin/leads', label: 'Enquiries', badge: newLeads },
    { href: '/portal/admin/payments', label: 'Payment destinations' },
    { href: '/portal/admin/settings', label: 'Settings' },
  ];
  return (
    <nav className="mb-8 flex flex-wrap gap-2 border-b border-[color:var(--line)] pb-4">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`btn btn-sm ${current === i.href ? 'btn-dark' : 'btn-ghost'}`}
        >
          {i.label}
          {i.badge ? <span className="badge badge-amber ml-1">{i.badge}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
