import {
  decryptI64AsNumber,
  decryptI64Safe,
  decryptStringField,
  decryptStringOrPlaintext,
} from './fields';
import { getDekOrThrow } from './session';

// ─────────────────────────────────────────────────────────────────────
// Raw encrypted response shapes — mirror the Rust DTOs in
// piggy-pulse-api/src/dto/{accounts,categories,vendors,subscriptions,transactions}.rs
// The generated `v2.d.ts` does not yet reflect the *Enc fields so we
// re-declare the subset that the decrypt helpers touch.
// ─────────────────────────────────────────────────────────────────────

export interface EncryptedAccount {
  id: string;
  accountType: 'checking' | 'savings' | 'creditcard' | 'wallet' | 'allowance';
  status: 'active' | 'inactive';
  currencyId: string;
  nameEnc: string;
  colorEnc: string;
  currentBalanceEnc: string;
  spendLimitEnc?: string | null;
  nextTransferAmountEnc?: string | null;
  topUpAmountEnc?: string | null;
  topUpCycle?: string | null;
  topUpDay?: number | null;
  statementCloseDay?: number | null;
  paymentDueDay?: number | null;
}

export interface EncryptedCategory {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  behavior?: 'fixed' | 'variable' | 'subscription' | null;
  parentId?: string | null;
  isSystem: boolean;
  status: 'active' | 'inactive';
  nameEnc: string;
  colorEnc?: string | null;
  iconEnc?: string | null;
  descriptionEnc?: string | null;
}

export interface EncryptedVendor {
  id: string;
  status: 'active' | 'inactive';
  nameEnc: string;
  descriptionEnc?: string | null;
}

export interface EncryptedSubscription {
  id: string;
  categoryId: string;
  vendorId?: string | null;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  billingDay: number;
  nextChargeDate: string;
  status: 'active' | 'cancelled' | 'paused';
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  nameEnc: string;
  billingAmountEnc: string;
}

export interface EncryptedTarget {
  id: string;
  categoryId: string;
  isExcluded: boolean;
  budgetedValueEnc: string;
}

export interface EncryptedTransaction {
  id: string;
  seq: number;
  date: string;
  firstCreatedAt: string;
  fromAccountId: string;
  toAccountId?: string | null;
  categoryId?: string | null;
  vendorId?: string | null;
  amountEnc: string;
  descriptionEnc: string;
}

// ─────────────────────────────────────────────────────────────────────
// Decrypted plaintext shapes the UI actually consumes.
// ─────────────────────────────────────────────────────────────────────

export interface DecryptedAccount {
  id: string;
  accountType: EncryptedAccount['accountType'];
  status: EncryptedAccount['status'];
  currencyId: string;
  name: string;
  color: string;
  currentBalance: number;
  spendLimit: number | null;
  nextTransferAmount: number | null;
  topUpAmount: number | null;
  topUpCycle: string | null;
  topUpDay: number | null;
  statementCloseDay: number | null;
  paymentDueDay: number | null;
}

export interface DecryptedCategory {
  id: string;
  type: EncryptedCategory['type'];
  behavior: EncryptedCategory['behavior'];
  parentId: string | null;
  isSystem: boolean;
  status: EncryptedCategory['status'];
  name: string;
  color: string | null;
  icon: string | null;
  description: string | null;
}

export interface DecryptedVendor {
  id: string;
  status: EncryptedVendor['status'];
  name: string;
  description: string | null;
}

export interface DecryptedSubscription {
  id: string;
  categoryId: string;
  vendorId: string | null;
  billingCycle: EncryptedSubscription['billingCycle'];
  billingDay: number;
  nextChargeDate: string;
  status: EncryptedSubscription['status'];
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  name: string;
  billingAmount: number;
}

export interface DecryptedTarget {
  id: string;
  categoryId: string;
  isExcluded: boolean;
  budgetedValue: number;
}

export interface DecryptedTransaction {
  id: string;
  seq: number;
  date: string;
  firstCreatedAt: string;
  fromAccountId: string;
  toAccountId: string | null;
  categoryId: string | null;
  vendorId: string | null;
  amount: number;
  description: string;
}

// ─────────────────────────────────────────────────────────────────────
// Decryption helpers
// ─────────────────────────────────────────────────────────────────────

function logDecryptFailure(entity: string, id: string, reason: unknown): void {
  // Safe logging: pass variables as separate arguments to avoid format string injection
  console.error('[encryption] skipping', entity, id, ': failed to decrypt', reason);
}

// Map each entity with a fault-tolerant decoder — a single bad row shouldn't
// crash the list. Matches the iOS `compactMap { try? }` pattern.
async function decryptList<T, U>(
  entity: string,
  rows: T[],
  decode: (row: T) => Promise<U>,
  getId: (row: T) => string
): Promise<U[]> {
  const out: U[] = [];
  for (const row of rows) {
    try {
      out.push(await decode(row));
    } catch (err) {
      logDecryptFailure(entity, getId(row), err);
    }
  }
  return out;
}

export async function decryptAccount(raw: EncryptedAccount): Promise<DecryptedAccount> {
  const dek = getDekOrThrow();
  const [name, color, currentBalance, spendLimit, nextTransferAmount, topUpAmount] =
    await Promise.all([
      decryptStringField(dek, raw.nameEnc),
      decryptStringField(dek, raw.colorEnc),
      decryptI64AsNumber(dek, raw.currentBalanceEnc),
      raw.spendLimitEnc ? decryptI64Safe(dek, raw.spendLimitEnc) : Promise.resolve(null),
      raw.nextTransferAmountEnc
        ? decryptI64Safe(dek, raw.nextTransferAmountEnc)
        : Promise.resolve(null),
      raw.topUpAmountEnc ? decryptI64Safe(dek, raw.topUpAmountEnc) : Promise.resolve(null),
    ]);
  return {
    id: raw.id,
    accountType: raw.accountType,
    status: raw.status,
    currencyId: raw.currencyId,
    name,
    color,
    currentBalance,
    spendLimit: spendLimit === null ? null : Number(spendLimit),
    nextTransferAmount: nextTransferAmount === null ? null : Number(nextTransferAmount),
    topUpAmount: topUpAmount === null ? null : Number(topUpAmount),
    topUpCycle: raw.topUpCycle ?? null,
    topUpDay: raw.topUpDay ?? null,
    statementCloseDay: raw.statementCloseDay ?? null,
    paymentDueDay: raw.paymentDueDay ?? null,
  };
}

export function decryptAccounts(rows: EncryptedAccount[]): Promise<DecryptedAccount[]> {
  return decryptList('account', rows, decryptAccount, (r) => r.id);
}

export async function decryptCategory(raw: EncryptedCategory): Promise<DecryptedCategory> {
  const dek = getDekOrThrow();
  // System categories (Transfer) may have legacy plaintext in the encrypted
  // column — fall back to raw UTF-8 rather than dropping the row.
  const [name, color, icon, description] = await Promise.all([
    raw.isSystem
      ? decryptStringOrPlaintext(dek, raw.nameEnc)
      : decryptStringField(dek, raw.nameEnc),
    raw.colorEnc
      ? raw.isSystem
        ? decryptStringOrPlaintext(dek, raw.colorEnc)
        : decryptStringField(dek, raw.colorEnc)
      : Promise.resolve(null),
    raw.iconEnc
      ? raw.isSystem
        ? decryptStringOrPlaintext(dek, raw.iconEnc)
        : decryptStringField(dek, raw.iconEnc)
      : Promise.resolve(null),
    raw.descriptionEnc
      ? decryptStringField(dek, raw.descriptionEnc).catch(() => null)
      : Promise.resolve(null),
  ]);
  return {
    id: raw.id,
    type: raw.type,
    behavior: raw.behavior ?? null,
    parentId: raw.parentId ?? null,
    isSystem: raw.isSystem,
    status: raw.status,
    name,
    color: color ?? null,
    icon: icon ?? null,
    description: description ?? null,
  };
}

export function decryptCategories(rows: EncryptedCategory[]): Promise<DecryptedCategory[]> {
  return decryptList('category', rows, decryptCategory, (r) => r.id);
}

export async function decryptVendor(raw: EncryptedVendor): Promise<DecryptedVendor> {
  const dek = getDekOrThrow();
  const [name, description] = await Promise.all([
    decryptStringField(dek, raw.nameEnc),
    raw.descriptionEnc
      ? decryptStringField(dek, raw.descriptionEnc).catch(() => null)
      : Promise.resolve(null),
  ]);
  return {
    id: raw.id,
    status: raw.status,
    name,
    description: description ?? null,
  };
}

export function decryptVendors(rows: EncryptedVendor[]): Promise<DecryptedVendor[]> {
  return decryptList('vendor', rows, decryptVendor, (r) => r.id);
}

export async function decryptSubscription(
  raw: EncryptedSubscription
): Promise<DecryptedSubscription> {
  const dek = getDekOrThrow();
  const [name, billingAmount] = await Promise.all([
    decryptStringField(dek, raw.nameEnc),
    decryptI64AsNumber(dek, raw.billingAmountEnc),
  ]);
  return {
    id: raw.id,
    categoryId: raw.categoryId,
    vendorId: raw.vendorId ?? null,
    billingCycle: raw.billingCycle,
    billingDay: raw.billingDay,
    nextChargeDate: raw.nextChargeDate,
    status: raw.status,
    cancelledAt: raw.cancelledAt ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    name,
    billingAmount,
  };
}

export function decryptSubscriptions(
  rows: EncryptedSubscription[]
): Promise<DecryptedSubscription[]> {
  return decryptList('subscription', rows, decryptSubscription, (r) => r.id);
}

export async function decryptTarget(raw: EncryptedTarget): Promise<DecryptedTarget> {
  const dek = getDekOrThrow();
  const budgetedValue = await decryptI64AsNumber(dek, raw.budgetedValueEnc);
  return {
    id: raw.id,
    categoryId: raw.categoryId,
    isExcluded: raw.isExcluded,
    budgetedValue,
  };
}

export function decryptTargets(rows: EncryptedTarget[]): Promise<DecryptedTarget[]> {
  return decryptList('target', rows, decryptTarget, (r) => r.id);
}

export async function decryptTransaction(raw: EncryptedTransaction): Promise<DecryptedTransaction> {
  const dek = getDekOrThrow();
  const [amount, description] = await Promise.all([
    decryptI64AsNumber(dek, raw.amountEnc),
    decryptStringField(dek, raw.descriptionEnc),
  ]);
  return {
    id: raw.id,
    seq: raw.seq,
    date: raw.date,
    firstCreatedAt: raw.firstCreatedAt,
    fromAccountId: raw.fromAccountId,
    toAccountId: raw.toAccountId ?? null,
    categoryId: raw.categoryId ?? null,
    vendorId: raw.vendorId ?? null,
    amount,
    description,
  };
}

export function decryptTransactions(rows: EncryptedTransaction[]): Promise<DecryptedTransaction[]> {
  return decryptList('transaction', rows, decryptTransaction, (r) => r.id);
}
