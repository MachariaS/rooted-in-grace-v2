import { createHmac, timingSafeEqual } from 'node:crypto';
import { serverEnv } from './env';

const API = 'https://api.paystack.co';

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${serverEnv('PAYSTACK_SECRET_KEY')}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.status) {
    throw new Error(`Paystack ${path} failed: ${body.message ?? res.status}`);
  }
  return body.data as T;
}

// Amounts are whole shillings in our code; Paystack wants the subunit (x100).
export function initializeTransaction(opts: {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return call<{ authorization_url: string; reference: string }>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountKes * 100,
      currency: 'KES',
      reference: opts.reference,
      callback_url: opts.callbackUrl,
      channels: ['mobile_money', 'card'],
      metadata: opts.metadata,
    }),
  });
}

export type VerifiedTransaction = {
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
};

export function verifyTransaction(reference: string) {
  return call<VerifiedTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = createHmac('sha512', serverEnv('PAYSTACK_SECRET_KEY')).update(rawBody).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
