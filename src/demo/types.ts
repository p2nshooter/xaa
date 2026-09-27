/** Data model of the XAA Suite demo. Everything is tenant-scoped by orgId. */

export type Role = 'owner' | 'admin' | 'member' | 'viewer';
export type Perm = 'read' | 'write' | 'delete' | 'manage' | 'billing';
export type PlanId = 'starter' | 'growth' | 'enterprise';
export type ModuleId = 'overview' | 'crm' | 'helpdesk' | 'projects' | 'invoices' | 'ledger' | 'ai' | 'admin';
export type ThemeId = 'studio' | 'midnight' | 'aurora' | 'ledger' | 'brutal';

export interface Org {
  id: string;
  name: string;
  plan: PlanId;
  brand: string;
  region: string;
  /** Transfers above this amount are held for a second approver. */
  ledgerLimit: number;
  createdAt: string;
}
export interface Person { id: string; name: string; email: string; color: string }
export interface Member { orgId: string; personId: string; role: Role }
export interface AuditEntry { id: string; orgId: string; at: string; actorId: string; action: string; target: string; ok: boolean }

export interface Contact { id: string; orgId: string; name: string; email: string; company: string; phone: string; tags: string[]; createdAt: string }
export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export interface Note { at: string; by: string; text: string }
export interface Deal {
  id: string; orgId: string; title: string; value: number; stage: DealStage;
  contactId: string; ownerId: string; closeDate: string; createdAt: string; notes: Note[];
}

export type TicketStatus = 'open' | 'pending' | 'solved';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';
export interface TicketMsg { at: string; from: 'customer' | 'agent' | 'note'; by: string; text: string }
export interface Ticket {
  id: string; orgId: string; number: number; subject: string; requester: string; email: string;
  status: TicketStatus; priority: Priority; assigneeId?: string; createdAt: string;
  firstResponseAt?: string; tags: string[]; messages: TicketMsg[];
}
export interface KbArticle { id: string; orgId: string; title: string; body: string; category: string }

export interface Project { id: string; orgId: string; name: string; key: string }
export type TaskStatus = 'backlog' | 'todo' | 'doing' | 'review' | 'done';
export interface Task {
  id: string; orgId: string; projectId: string; key: string; title: string; status: TaskStatus;
  assigneeId?: string; due?: string; points: number; createdAt: string;
}

export type Currency = 'EUR' | 'USD' | 'IDR';
export interface InvoiceLine { desc: string; qty: number; price: number; vat: number }
export interface Invoice {
  id: string; orgId: string; number: string; kind: 'quote' | 'invoice'; client: string; clientEmail: string;
  currency: Currency; lines: InvoiceLine[]; issued: string; due: string; sentAt?: string;
  payments: { at: string; amount: number }[]; void?: boolean;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export interface LedgerAccount { id: string; orgId: string; code: string; name: string; type: AccountType }
export interface JournalLine { accountId: string; debit: number; credit: number }
export interface JournalEntry {
  id: string; orgId: string; at: string; memo: string; lines: JournalLine[];
  status: 'posted' | 'held' | 'rejected'; createdBy: string; approvedBy?: string; amount: number;
}

export interface ApiKey {
  id: string; orgId: string; name: string; prefix: string; hash: string; scopes: string[];
  createdAt: string; lastUsed?: string; revokedAt?: string;
}
export interface Doc { id: string; orgId: string; title: string; text: string; addedAt: string }
export interface EvalCase { id: string; orgId: string; question: string; expect: string }
export interface Usage { orgId: string; apiCalls: number; aiTokens: number; storageMb: number; aiQuestions: number }

export interface DemoState {
  v: number;
  startedAt: string;
  theme: ThemeId;
  orgs: Org[];
  people: Person[];
  members: Member[];
  orgId: string;
  personId: string;
  audit: AuditEntry[];
  contacts: Contact[];
  deals: Deal[];
  tickets: Ticket[];
  kb: KbArticle[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  accounts: LedgerAccount[];
  journal: JournalEntry[];
  apiKeys: ApiKey[];
  flags: Record<string, Record<string, boolean>>;
  docs: Doc[];
  evals: EvalCase[];
  usage: Usage[];
  /** Per-org counters for human-readable numbers (tickets, invoices, task keys). */
  seq: Record<string, number>;
  /** How many records the visitor has created — the demo caps these. */
  created: number;
}
