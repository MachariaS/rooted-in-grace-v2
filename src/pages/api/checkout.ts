import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';
import { priceCart, CheckoutError, getShopSettings } from '../../lib/shop';
import { supabaseAdmin } from '../../lib/supabase';
import { initializeTransaction } from '../../lib/paystack';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function field(value: unknown, max: number, required = true): string {
  const s = typeof value === 'string' ? value.trim() : '';
  if (required && !s) throw new CheckoutError('Please fill in all required delivery details.');
  if (s.length > max) throw new CheckoutError('One of the delivery details is too long.');
  return s;
}

export const POST: APIRoute = async ({ request }) => {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  try {
    const c = payload?.customer ?? {};
    const customer = {
      name: field(c.name, 120),
      email: field(c.email, 200),
      phone: field(c.phone, 30),
      address: field(c.address, 300),
      town: field(c.town, 80),
      notes: field(c.notes, 500, false),
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new CheckoutError('Please enter a valid email address.');
    if (!/^[+\d][\d\s-]{6,}$/.test(customer.phone)) throw new CheckoutError('Please enter a valid phone number.');

    const settings = await getShopSettings();
    const paymentMethod = settings.paymentMode;
    if (paymentMethod === 'manual_mpesa' && !settings.mpesaNumber?.trim()) {
      throw new CheckoutError("Checkout isn't open just yet. Please check back soon.");
    }

    const cart = await priceCart(payload?.lines);
    const reference = `RIG-${randomUUID()}`;
    const db = supabaseAdmin();

    const { data: order, error } = await db
      .from('orders')
      .insert({
        reference,
        status: 'pending',
        payment_method: paymentMethod,
        customer_name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        town: customer.town,
        notes: customer.notes || null,
        subtotal: cart.subtotal,
        delivery_fee: cart.deliveryFee,
        total: cart.total,
        currency: 'KES',
      })
      .select('id')
      .single();
    if (error || !order) throw error ?? new Error('Order insert returned nothing');

    const { error: itemsError } = await db.from('order_items').insert(
      cart.lines.map((l) => ({
        order_id: order.id,
        product_slug: l.slug,
        title: l.title,
        size: l.size,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.lineTotal,
      }))
    );
    if (itemsError) {
      await db.from('orders').delete().eq('id', order.id);
      throw itemsError;
    }

    const origin = new URL(request.url).origin;
    const orderUrl = `${origin}/shop/order/?reference=${encodeURIComponent(reference)}`;
    if (paymentMethod === 'manual_mpesa') return json({ url: orderUrl });

    const tx = await initializeTransaction({
      email: customer.email,
      amountKes: cart.total,
      reference,
      callbackUrl: `${origin}/shop/order/`,
      metadata: { order_id: order.id },
    });

    return json({ url: tx.authorization_url });
  } catch (err) {
    if (err instanceof CheckoutError) return json({ error: err.message }, 400);
    console.error('checkout failed', err);
    return json({ error: 'We could not start your payment. Please try again in a moment.' }, 500);
  }
};
