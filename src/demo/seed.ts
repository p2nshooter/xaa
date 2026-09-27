import type { DemoState, Deal, Ticket, Task, Invoice, JournalEntry, Contact } from './types';

/** Fictional sample data. Every name, company and address here is invented. */

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();
const dateOnly = (ms: number) => iso(ms).slice(0, 10);

export const SEED_VERSION = 1;

export function seed(): DemoState {
  const now = Date.now();
  const ago = (d: number, h = 0) => iso(now - d * DAY - h * 3_600_000);
  const ahead = (d: number) => dateOnly(now + d * DAY);
  const back = (d: number) => dateOnly(now - d * DAY);

  const A = 'org_northwind';
  const B = 'org_aurora';

  const people = [
    { id: 'p_maya', name: 'Maya Chen', email: 'maya@northwind.example', color: '#2b6bff' },
    { id: 'p_lukas', name: 'Lukas Weber', email: 'lukas@northwind.example', color: '#0f9d74' },
    { id: 'p_sofia', name: 'Sofia Rossi', email: 'sofia@aurora.example', color: '#d9467a' },
    { id: 'p_arif', name: 'Arif Pratama', email: 'arif@northwind.example', color: '#e08a00' },
    { id: 'p_emma', name: 'Emma Brown', email: 'emma@northwind.example', color: '#7c3aed' },
  ];

  const members = [
    { orgId: A, personId: 'p_maya', role: 'owner' as const },
    { orgId: A, personId: 'p_lukas', role: 'admin' as const },
    { orgId: A, personId: 'p_arif', role: 'member' as const },
    { orgId: A, personId: 'p_emma', role: 'viewer' as const },
    { orgId: B, personId: 'p_sofia', role: 'owner' as const },
    { orgId: B, personId: 'p_maya', role: 'admin' as const },
    { orgId: B, personId: 'p_arif', role: 'member' as const },
  ];

  const c = (id: string, orgId: string, name: string, company: string, tags: string[], d: number): Contact => ({
    id, orgId, name, company, tags, createdAt: ago(d),
    email: `${name.split(' ')[0].toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.example`,
    phone: `+49 30 ${String(100000 + d * 7919).slice(0, 6)}`,
  });
  const contacts: Contact[] = [
    c('c1', A, 'Hannah Vogel', 'Brightwave Logistics', ['enterprise'], 60),
    c('c2', A, 'Omar Haddad', 'Cedar Health', ['healthcare'], 55),
    c('c3', A, 'Julia Novak', 'Pinecrest Retail', ['retail', 'priority'], 42),
    c('c4', A, 'Daniel Kim', 'Quanta Robotics', ['manufacturing'], 38),
    c('c5', A, 'Lea Fischer', 'Harbor Finance', ['finance'], 30),
    c('c6', A, 'Marco Bianchi', 'Solace Hotels', ['hospitality'], 22),
    c('c7', A, 'Priya Nair', 'Lumen Education', ['education'], 15),
    c('c8', A, 'Tom Becker', 'Atlas Freight', ['logistics'], 9),
    c('c9', A, 'Nadia Rahman', 'Verde Energy', ['energy', 'priority'], 5),
    c('c10', A, 'Felix Wagner', 'Orbit Media', ['media'], 2),
    c('c11', B, 'Rina Wijaya', 'Sehat Pharmacy', ['partner'], 20),
    c('c12', B, 'Budi Santoso', 'Kasih Insurance', ['insurer'], 12),
    c('c13', B, 'Dewi Lestari', 'Medika Labs', ['lab'], 6),
  ];

  const deal = (id: string, orgId: string, title: string, value: number, stage: Deal['stage'], contactId: string, ownerId: string, closeIn: number, d: number): Deal =>
    ({ id, orgId, title, value, stage, contactId, ownerId, closeDate: closeIn >= 0 ? ahead(closeIn) : back(-closeIn), createdAt: ago(d), notes: [] });
  const deals: Deal[] = [
    deal('d1', A, 'Fleet tracking platform', 84000, 'negotiation', 'c1', 'p_maya', 12, 40),
    deal('d2', A, 'Patient portal rebuild', 56000, 'proposal', 'c2', 'p_lukas', 25, 35),
    deal('d3', A, 'Omnichannel storefront', 42000, 'qualified', 'c3', 'p_arif', 40, 28),
    deal('d4', A, 'Factory telemetry dashboards', 128000, 'proposal', 'c4', 'p_maya', 30, 26),
    deal('d5', A, 'Client onboarding KYC flow', 67000, 'negotiation', 'c5', 'p_lukas', 8, 21),
    deal('d6', A, 'Booking engine', 23000, 'won', 'c6', 'p_arif', -4, 50),
    deal('d7', A, 'Course platform', 31000, 'lead', 'c7', 'p_arif', 60, 10),
    deal('d8', A, 'Freight marketplace MVP', 95000, 'lead', 'c8', 'p_maya', 75, 7),
    deal('d9', A, 'Energy trading portal', 150000, 'qualified', 'c9', 'p_lukas', 45, 4),
    deal('d10', A, 'Media asset library', 18000, 'lost', 'c10', 'p_arif', -10, 33),
    deal('d11', A, 'Support desk migration', 27000, 'won', 'c2', 'p_lukas', -12, 45),
    deal('d12', B, 'Pharmacy loyalty app', 21000, 'proposal', 'c11', 'p_sofia', 18, 14),
    deal('d13', B, 'Claims intake portal', 39000, 'qualified', 'c12', 'p_sofia', 30, 9),
    deal('d14', B, 'Lab results API', 16000, 'won', 'c13', 'p_arif', -2, 25),
  ];
  deals[0].notes.push({ at: ago(3), by: 'p_maya', text: 'Procurement asked for a phased rollout: pilot with 40 trucks first.' });
  deals[4].notes.push({ at: ago(1), by: 'p_lukas', text: 'Legal review done. Waiting on signature from their CFO.' });

  const t = (id: string, orgId: string, n: number, subject: string, requester: string, priority: Ticket['priority'], status: Ticket['status'], hAgo: number, text: string, responded?: number): Ticket => ({
    id, orgId, number: n, subject, requester, priority, status,
    email: `${requester.split(' ')[0].toLowerCase()}@customer.example`,
    createdAt: iso(now - hAgo * 3_600_000),
    firstResponseAt: responded !== undefined ? iso(now - (hAgo - responded) * 3_600_000) : undefined,
    assigneeId: responded !== undefined ? 'p_lukas' : undefined,
    tags: [],
    messages: [{ at: iso(now - hAgo * 3_600_000), from: 'customer', by: requester, text }],
  });
  const tickets: Ticket[] = [
    t('t1', A, 1041, 'Cannot export invoices to CSV', 'Greta Holm', 'high', 'open', 2, 'The export button spins forever on the invoices page. We need this for month-end close today.'),
    t('t2', A, 1040, 'SSO login loops back to sign-in', 'Pavel Novak', 'urgent', 'open', 0.5, 'After the Okta redirect we land on the sign-in page again. The whole team is locked out.'),
    t('t3', A, 1039, 'How do I add a second warehouse?', 'Ines Duarte', 'normal', 'pending', 20, 'We are opening a second location next month. Where do I configure it?', 1.5),
    t('t4', A, 1038, 'Feature request: dark mode', 'Kenji Sato', 'low', 'open', 30, 'Our night shift would love a dark theme.'),
    t('t5', A, 1037, 'Refund for duplicate charge', 'Amara Okafor', 'high', 'solved', 50, 'We were charged twice for September.', 2),
    t('t6', A, 1036, 'API rate limit questions', 'Leon Richter', 'normal', 'open', 30, 'What are the limits on the public API for the Growth plan?'),
    t('t7', A, 1035, 'Webhook signature mismatch', 'Chloe Martin', 'high', 'pending', 8, 'Our verification fails for invoice.paid webhooks since yesterday.', 3),
    t('t8', B, 204, 'Appointment reminders not sent', 'Sari Putri', 'urgent', 'open', 3, 'Patients did not get SMS reminders this morning.'),
    t('t9', B, 203, 'Change clinic opening hours', 'Agus Salim', 'low', 'solved', 70, 'Please update Saturday hours to 08:00–13:00.', 5),
  ];
  tickets[2].messages.push({ at: iso(now - 18.5 * 3_600_000), from: 'agent', by: 'p_lukas', text: 'Hi Ines — go to Settings → Locations → Add location. I have enabled multi-warehouse on your plan.' });
  tickets[4].messages.push({ at: iso(now - 48 * 3_600_000), from: 'agent', by: 'p_lukas', text: 'Refund issued — it will show on your statement in 3–5 days. Sorry for the trouble!' });
  tickets[6].messages.push({ at: iso(now - 5 * 3_600_000), from: 'agent', by: 'p_lukas', text: 'We rotated the signing secret on the 26th. Could you confirm you are using the new secret from Settings → Webhooks?' });

  const kb = [
    { id: 'kb1', orgId: A, category: 'Billing', title: 'Refunds and duplicate charges', body: 'Duplicate charges are refunded in full within 3–5 business days. Agents can issue a refund from the invoice view. Partial refunds need an admin.' },
    { id: 'kb2', orgId: A, category: 'Account', title: 'Setting up single sign-on (SSO)', body: 'SSO supports SAML 2.0 and OpenID Connect. If users loop back to sign-in, check that the redirect URI matches exactly and that the clock skew is under 5 minutes.' },
    { id: 'kb3', orgId: A, category: 'Developers', title: 'API rate limits by plan', body: 'Starter: 10,000 calls per month. Growth: 250,000 calls per month. Enterprise: 5,000,000 calls per month with burst of 50 requests per second.' },
    { id: 'kb4', orgId: A, category: 'Developers', title: 'Verifying webhook signatures', body: 'Each webhook carries an HMAC-SHA256 signature header. Compute the HMAC of the raw body with your signing secret and compare in constant time. Rotating the secret invalidates old signatures.' },
    { id: 'kb5', orgId: A, category: 'Operations', title: 'Exporting data to CSV', body: 'Every list has an Export button. Large exports run in the background and are emailed as a download link when ready.' },
    { id: 'kb6', orgId: B, category: 'Clinic', title: 'Appointment reminder schedule', body: 'Reminders go out by SMS 24 hours and 2 hours before each appointment. Failed SMS are retried three times.' },
  ];

  const projects = [
    { id: 'pr1', orgId: A, name: 'Platform v2', key: 'PLT' },
    { id: 'pr2', orgId: A, name: 'Website relaunch', key: 'WEB' },
    { id: 'pr3', orgId: B, name: 'Clinic app', key: 'CLN' },
  ];
  const task = (id: string, projectId: string, orgId: string, key: string, title: string, status: Task['status'], assigneeId: string | undefined, due: number | undefined, points: number): Task =>
    ({ id, orgId, projectId, key, title, status, assigneeId, due: due === undefined ? undefined : due >= 0 ? ahead(due) : back(-due), points, createdAt: ago(20) });
  const tasks: Task[] = [
    task('k1', 'pr1', A, 'PLT-1', 'Tenant isolation tests', 'done', 'p_lukas', -6, 5),
    task('k2', 'pr1', A, 'PLT-2', 'SSO with OIDC', 'review', 'p_maya', 2, 8),
    task('k3', 'pr1', A, 'PLT-3', 'Usage metering pipeline', 'doing', 'p_arif', 5, 8),
    task('k4', 'pr1', A, 'PLT-4', 'Audit log export', 'todo', 'p_lukas', 9, 3),
    task('k5', 'pr1', A, 'PLT-5', 'API key scopes', 'todo', 'p_arif', 12, 5),
    task('k6', 'pr1', A, 'PLT-6', 'Billing webhooks retry queue', 'backlog', undefined, 18, 5),
    task('k7', 'pr1', A, 'PLT-7', 'Feature flag targeting rules', 'backlog', undefined, 24, 3),
    task('k8', 'pr1', A, 'PLT-8', 'Rate limiter per API key', 'doing', 'p_maya', -1, 5),
    task('k9', 'pr2', A, 'WEB-1', 'New pricing page', 'doing', 'p_emma', 4, 3),
    task('k10', 'pr2', A, 'WEB-2', 'Case studies CMS', 'todo', 'p_arif', 10, 5),
    task('k11', 'pr2', A, 'WEB-3', 'Core Web Vitals pass', 'backlog', undefined, 20, 3),
    task('k12', 'pr3', B, 'CLN-1', 'Online booking flow', 'doing', 'p_sofia', 6, 8),
    task('k13', 'pr3', B, 'CLN-2', 'SMS reminder retries', 'todo', 'p_arif', 3, 3),
    task('k14', 'pr3', B, 'CLN-3', 'Doctor schedule view', 'done', 'p_sofia', -3, 5),
  ];

  const inv = (id: string, orgId: string, number: string, kind: Invoice['kind'], client: string, currency: Invoice['currency'], lines: Invoice['lines'], issuedAgo: number, dueIn: number, sent: boolean, paid: number[]): Invoice => ({
    id, orgId, number, kind, client, currency, lines,
    clientEmail: `accounts@${client.toLowerCase().replace(/[^a-z]/g, '')}.example`,
    issued: back(issuedAgo), due: dueIn >= 0 ? ahead(dueIn) : back(-dueIn),
    sentAt: sent ? ago(issuedAgo) : undefined,
    payments: paid.map((amount, i) => ({ at: ago(Math.max(0, issuedAgo - 5 - i)), amount })),
  });
  const invoices: Invoice[] = [
    inv('i1', A, 'INV-2026-0118', 'invoice', 'Solace Hotels', 'EUR', [{ desc: 'Booking engine — milestone 2', qty: 1, price: 9200, vat: 19 }], 40, -10, true, [10948]),
    inv('i2', A, 'INV-2026-0119', 'invoice', 'Cedar Health', 'EUR', [{ desc: 'Support desk migration', qty: 1, price: 13500, vat: 19 }, { desc: 'Data import', qty: 12, price: 90, vat: 19 }], 35, -5, true, [8000]),
    inv('i3', A, 'INV-2026-0120', 'invoice', 'Harbor Finance', 'USD', [{ desc: 'KYC flow discovery', qty: 5, price: 1400, vat: 0 }], 50, -20, true, []),
    inv('i4', A, 'INV-2026-0121', 'invoice', 'Brightwave Logistics', 'EUR', [{ desc: 'Fleet pilot setup', qty: 1, price: 6400, vat: 19 }], 6, 24, true, []),
    inv('i5', A, 'INV-2026-0122', 'invoice', 'Orbit Media', 'EUR', [{ desc: 'Design sprint', qty: 3, price: 1800, vat: 19 }], 1, 29, false, []),
    inv('i6', A, 'Q-2026-031', 'quote', 'Quanta Robotics', 'EUR', [{ desc: 'Telemetry dashboards — phase 1', qty: 1, price: 42000, vat: 19 }, { desc: 'Operator training (days)', qty: 4, price: 1200, vat: 19 }], 3, 27, true, []),
    inv('i7', B, 'INV-2026-0044', 'invoice', 'Sehat Pharmacy', 'IDR', [{ desc: 'Loyalty app discovery', qty: 1, price: 48_000_000, vat: 11 }], 20, 10, true, [20_000_000]),
    inv('i8', B, 'INV-2026-0043', 'invoice', 'Medika Labs', 'IDR', [{ desc: 'Lab results API', qty: 1, price: 96_000_000, vat: 11 }], 45, -15, true, [106_560_000]),
  ];

  const accounts = [
    { id: 'a_cash', orgId: A, code: '1000', name: 'Operating cash', type: 'asset' as const },
    { id: 'a_settle', orgId: A, code: '1010', name: 'Settlement bank', type: 'asset' as const },
    { id: 'a_w_bright', orgId: A, code: '2001', name: 'Wallet — Brightwave Logistics', type: 'liability' as const },
    { id: 'a_w_harbor', orgId: A, code: '2002', name: 'Wallet — Harbor Finance', type: 'liability' as const },
    { id: 'a_w_solace', orgId: A, code: '2003', name: 'Wallet — Solace Hotels', type: 'liability' as const },
    { id: 'a_equity', orgId: A, code: '3000', name: 'Share capital', type: 'equity' as const },
    { id: 'a_fees', orgId: A, code: '4000', name: 'Fee revenue', type: 'revenue' as const },
    { id: 'a_proc', orgId: A, code: '5000', name: 'Processing costs', type: 'expense' as const },
    { id: 'b_cash', orgId: B, code: '1000', name: 'Operating cash', type: 'asset' as const },
    { id: 'b_equity', orgId: B, code: '3000', name: 'Share capital', type: 'equity' as const },
    { id: 'b_w_patients', orgId: B, code: '2001', name: 'Patient prepaid balances', type: 'liability' as const },
  ];
  const je = (id: string, orgId: string, d: number, memo: string, lines: [string, number, number][], by = 'p_maya'): JournalEntry => {
    const ls = lines.map(([accountId, debit, credit]) => ({ accountId, debit, credit }));
    return { id, orgId, at: ago(d), memo, lines: ls, status: 'posted', createdBy: by, approvedBy: undefined, amount: ls.reduce((s, l) => s + l.debit, 0) };
  };
  const journal: JournalEntry[] = [
    je('j1', A, 60, 'Initial capital', [['a_cash', 250000, 0], ['a_equity', 0, 250000]]),
    je('j2', A, 30, 'Deposit — Brightwave Logistics', [['a_settle', 40000, 0], ['a_w_bright', 0, 40000]], 'p_lukas'),
    je('j3', A, 25, 'Deposit — Harbor Finance', [['a_settle', 18000, 0], ['a_w_harbor', 0, 18000]], 'p_lukas'),
    je('j4', A, 12, 'Transfer Brightwave → Solace', [['a_w_bright', 6500, 0], ['a_w_solace', 0, 6500]], 'p_arif'),
    je('j5', A, 12, 'Transfer fee', [['a_w_bright', 65, 0], ['a_fees', 0, 65]], 'p_arif'),
    je('j6', A, 7, 'Card processor invoice', [['a_proc', 1240, 0], ['a_cash', 0, 1240]]),
    je('j7', B, 40, 'Initial capital', [['b_cash', 500_000_000, 0], ['b_equity', 0, 500_000_000]], 'p_sofia'),
  ];
  journal.push({
    id: 'j8', orgId: A, at: ago(0, 3), memo: 'Transfer Harbor → Brightwave (large)', status: 'held', createdBy: 'p_arif', amount: 12000,
    lines: [{ accountId: 'a_w_harbor', debit: 12000, credit: 0 }, { accountId: 'a_w_bright', debit: 0, credit: 12000 }],
  });

  const docs = [
    { id: 'doc1', orgId: A, addedAt: ago(20), title: 'Refund policy', text: 'Northwind Labs refunds duplicate charges in full within 5 business days.\n\nAnnual plans can be cancelled within 14 days of purchase for a full refund. After 14 days, annual plans are refunded pro rata only when the service was unavailable for more than 24 hours in a month.\n\nRefunds are always returned to the original payment method.' },
    { id: 'doc2', orgId: A, addedAt: ago(15), title: 'Support SLA', text: 'First response targets: urgent tickets within 1 hour, high within 4 hours, normal within 24 hours, low within 72 hours.\n\nUrgent tickets are those where the customer cannot use the product at all, such as a login outage.\n\nEnterprise customers get a named account manager and a monthly service review.' },
    { id: 'doc3', orgId: A, addedAt: ago(10), title: 'Security overview', text: 'All customer data is encrypted at rest with AES-256 and in transit with TLS 1.3.\n\nEach tenant is isolated by organisation ID on every query, and the isolation is covered by automated tests.\n\nAPI keys are stored only as SHA-256 hashes; the full key is shown once at creation.\n\nAudit logs record every change with the actor, action and time, and are kept for 400 days.' },
    { id: 'doc4', orgId: B, addedAt: ago(8), title: 'Clinic FAQ', text: 'Aurora Clinic is open Monday to Friday 07:00–20:00 and Saturday 08:00–13:00.\n\nPatients can reschedule online up to 2 hours before the appointment.' },
  ];
  const evals = [
    { id: 'e1', orgId: A, question: 'How fast do we answer urgent tickets?', expect: '1 hour' },
    { id: 'e2', orgId: A, question: 'How are API keys stored?', expect: 'SHA-256' },
    { id: 'e3', orgId: A, question: 'Can an annual plan be refunded?', expect: '14 days' },
    { id: 'e4', orgId: A, question: 'Which deal is in negotiation with Harbor Finance?', expect: 'KYC' },
  ];

  const apiKeys = [
    { id: 'key1', orgId: A, name: 'Production backend', prefix: 'xaa_live_7Hq2', hash: 'seeded', scopes: ['read', 'write'], createdAt: ago(40), lastUsed: ago(0, 1) },
    { id: 'key2', orgId: A, name: 'Old analytics export', prefix: 'xaa_live_Kp09', hash: 'seeded', scopes: ['read'], createdAt: ago(90), lastUsed: ago(31), revokedAt: ago(30) },
  ];

  const audit = [
    { id: 'au1', orgId: A, at: ago(0, 3), actorId: 'p_arif', action: 'ledger.transfer.held', target: 'Harbor → Brightwave 12,000', ok: true },
    { id: 'au2', orgId: A, at: ago(1), actorId: 'p_lukas', action: 'deal.note', target: 'Client onboarding KYC flow', ok: true },
    { id: 'au3', orgId: A, at: ago(2), actorId: 'p_emma', action: 'invoice.void', target: 'INV-2026-0118', ok: false },
    { id: 'au4', orgId: A, at: ago(3), actorId: 'p_maya', action: 'member.role', target: 'Arif Pratama → member', ok: true },
    { id: 'au5', orgId: B, at: ago(1), actorId: 'p_sofia', action: 'ticket.reply', target: '#203', ok: true },
  ];

  return {
    v: SEED_VERSION,
    startedAt: iso(now),
    theme: 'studio',
    orgs: [
      { id: A, name: 'Northwind Labs', plan: 'growth', brand: '#2b6bff', region: 'EU (Frankfurt)', ledgerLimit: 10000, createdAt: ago(400) },
      { id: B, name: 'Aurora Clinic', plan: 'starter', brand: '#0f9d74', region: 'APAC (Jakarta)', ledgerLimit: 50_000_000, createdAt: ago(120) },
    ],
    people, members, orgId: A, personId: 'p_maya', audit,
    contacts, deals, tickets, kb, projects, tasks, invoices, accounts, journal, apiKeys,
    flags: {
      [A]: { new_dashboard: true, ai_assistant: true, sso_enforced: false, beta_exports: false, usage_alerts: true },
      [B]: { new_dashboard: false, ai_assistant: true, sso_enforced: false, beta_exports: false, usage_alerts: false },
    },
    docs, evals,
    usage: [
      { orgId: A, apiCalls: 48_213, aiTokens: 1_214_500, storageMb: 8_210, aiQuestions: 0 },
      { orgId: B, apiCalls: 3_904, aiTokens: 88_000, storageMb: 640, aiQuestions: 0 },
    ],
    seq: { [`${A}:ticket`]: 1041, [`${B}:ticket`]: 204, [`${A}:invoice`]: 122, [`${B}:invoice`]: 44, [`${A}:quote`]: 31, [`${B}:quote`]: 0, 'pr1': 8, 'pr2': 3, 'pr3': 3 },
    created: 0,
  };
}
