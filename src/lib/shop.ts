import { getCollection, getEntry, type CollectionEntry } from 'astro:content';
import { supabaseAdmin } from './supabase';
import { verifyTransaction } from './paystack';

export type Product = CollectionEntry<'products'>;

export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

export async function getProducts(): Promise<Product[]> {
  return (await getCollection('products')).sort(
    (a, b) => a.data.sortOrder - b.data.sortOrder || a.data.title.localeCompare(b.data.title)
  );
}

export type CartLine = { slug: string; size?: string; quantity: number };

export type PricedLine = {
  slug: string;
  title: string;
  size: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

const MAX_LINES = 30;
const MAX_QTY = 20;

// Prices always come from the catalog, never from the browser.
export async function priceCart(lines: unknown): Promise<{ lines: PricedLine[]; subtotal: number; deliveryFee: number; total: number }> {
  if (!Array.isArray(lines) || lines.length === 0) throw new CheckoutError('Your cart is empty.');
  if (lines.length > MAX_LINES) throw new CheckoutError('Too many items in the cart.');

  const products = new Map((await getProducts()).map((p) => [p.slug, p]));
  const priced: PricedLine[] = [];

  for (const raw of lines as CartLine[]) {
    const product = products.get(String(raw?.slug));
    if (!product) throw new CheckoutError('An item in your cart is no longer available. Please remove it and try again.');
    if (!product.data.inStock) throw new CheckoutError(`${product.data.title} is out of stock.`);

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
      throw new CheckoutError(`Please choose between 1 and ${MAX_QTY} of ${product.data.title}.`);
    }

    let size: string | null = null;
    if (product.data.sizes.length > 0) {
      if (!raw.size || !product.data.sizes.includes(raw.size)) {
        throw new CheckoutError(`Please choose a size for ${product.data.title}.`);
      }
      size = raw.size;
    }

    priced.push({
      slug: product.slug,
      title: product.data.title,
      size,
      unitPrice: product.data.price,
      quantity,
      lineTotal: product.data.price * quantity,
    });
  }

  const settings = await getShopSettings();
  const subtotal = priced.reduce((sum, l) => sum + l.lineTotal, 0);
  const deliveryFee = settings.deliveryFee;
  return { lines: priced, subtotal, deliveryFee, total: subtotal + deliveryFee };
}

export class CheckoutError extends Error {}

export type OrderStatus = 'pending' | 'awaiting_confirmation' | 'paid' | 'failed' | 'fulfilled' | 'cancelled';

export async function getShopSettings() {
  return (await getEntry('settings', 'settings'))!.data;
}

export async function getOrder(reference: string) {
  const { data } = await supabaseAdmin().from('orders').select('*').eq('reference', reference).maybeSingle();
  return data;
}

// Short, readable order number for buyers and the team (the full reference is
// a long random token used in the order page link).
export function orderNumber(reference: string): string {
  return reference.replace(/^RIG-/, '').slice(0, 8).toUpperCase();
}

// M-Pesa transaction codes are 10 letters/digits, e.g. "SJK3ABCD12".
export function normalizeMpesaCode(input: unknown): string | null {
  const code = typeof input === 'string' ? input.replace(/\s+/g, '').toUpperCase() : '';
  return /^[A-Z0-9]{10}$/.test(code) ? code : null;
}

// Confirms a payment with Paystack and records it. Safe to call more than once
// (the order page and the webhook may both run for the same payment).
export async function confirmPayment(reference: string): Promise<{ status: OrderStatus; order: any | null }> {
  const db = supabaseAdmin();
  const { data: order } = await db.from('orders').select('*').eq('reference', reference).maybeSingle();
  if (!order) return { status: 'failed', order: null };
  if (order.payment_method !== 'paystack' || order.status !== 'pending') return { status: order.status, order };

  const tx = await verifyTransaction(reference);
  const amountMatches = tx.amount === order.total * 100 && tx.currency === order.currency;

  if (tx.status === 'success' && amountMatches) {
    const { data: updated } = await db
      .from('orders')
      .update({ status: 'paid', paid_at: tx.paid_at ?? new Date().toISOString(), paystack_status: tx.status })
      .eq('id', order.id)
      .neq('status', 'paid')
      .select()
      .maybeSingle();
    return { status: 'paid', order: updated ?? { ...order, status: 'paid' } };
  }

  if (tx.status === 'failed' || tx.status === 'abandoned' || (tx.status === 'success' && !amountMatches)) {
    await db.from('orders').update({ status: 'failed', paystack_status: tx.status }).eq('id', order.id).neq('status', 'paid');
    return { status: 'failed', order };
  }

  return { status: 'pending', order };
}
