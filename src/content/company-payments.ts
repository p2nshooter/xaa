import type { PaymentMethodInput } from '@/server/settings';

/**
 * The company's own payment destinations, taken from the ulyah.com repository
 * (apps/web/src/components/CryptoDonationSection.tsx), where they are already
 * published. Imported into the portal with one click from the admin
 * "Payment destinations" page; every address is then stored AES-GCM encrypted
 * in the database and managed from that page like any other destination.
 */

const BNI = {
  bankName: 'PT Bank Negara Indonesia (Persero) Tbk. — wondr by BNI',
  holder: 'YUSRON EFENDI',
  swift: 'BNINIDJA',
  bankCountry: 'Indonesia',
};

/** wondr by BNI multicurrency accounts. The first six are switched on. */
const BNI_ACCOUNTS: { ccy: string; number: string; active: boolean }[] = [
  { ccy: 'EUR', number: '2090571542', active: true },
  { ccy: 'USD', number: '2090571495', active: true },
  { ccy: 'IDR', number: '2090571484', active: true },
  { ccy: 'GBP', number: '2090571520', active: true },
  { ccy: 'AUD', number: '2090571519', active: true },
  { ccy: 'SGD', number: '2090571508', active: true },
  { ccy: 'CNY', number: '2090571531', active: false },
  { ccy: 'HKD', number: '2090571553', active: false },
  { ccy: 'JPY', number: '2090571564', active: false },
  { ccy: 'MYR', number: '2090571575', active: false },
  { ccy: 'SAR', number: '2090571586', active: false },
  { ccy: 'KRW', number: '2090571597', active: false },
  { ccy: 'THB', number: '2090571609', active: false },
];

export const COMPANY_PAYMENT_METHODS: PaymentMethodInput[] = [
  { kind: 'crypto', label: 'USDT · TRC20 (Tron)', network: 'TRC20', currency: 'USDT', address: 'TNo8jgJqmnUGAPUDb159cC8uhAeFDP8keW', sortOrder: 1 },
  { kind: 'crypto', label: 'USDT / BNB · BEP20 (BNB Smart Chain)', network: 'BEP20', currency: 'USDT', address: '0x1bed722b27b3d2bdab3dfe06ea75b84a3a824f3d', sortOrder: 2 },
  { kind: 'crypto', label: 'Bitcoin (BTC)', network: 'Bitcoin', currency: 'BTC', address: '1AzqohLY6XPGbabHmMhstYMPFUThoiBnya', sortOrder: 3 },
  { kind: 'crypto', label: 'Solana (SOL)', network: 'Solana', currency: 'SOL', address: 'CUnEGFRZvMu8xieLdiM9oHXa5dzS9xJVvNnEiyXRaogD', sortOrder: 4 },
  { kind: 'crypto', label: 'Dogecoin (DOGE)', network: 'Dogecoin', currency: 'DOGE', address: 'DJUK77iDsus6URWcwNZnsqAyESUr426Df3', sortOrder: 5 },
  ...BNI_ACCOUNTS.map((a, i): PaymentMethodInput => ({
    kind: 'bank',
    label: `BNI · ${a.ccy} account`,
    currency: a.ccy,
    address: a.number,
    instructions: `Transfer to Bank BNI, Indonesia — bank code 009, SWIFT ${BNI.swift}. Account holder: ${BNI.holder}. Use your invoice number as the transfer reference.`,
    active: a.active,
    sortOrder: 10 + i,
    ...BNI,
  })),
];
