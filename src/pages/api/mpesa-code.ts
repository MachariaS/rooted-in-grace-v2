import type { APIRoute } from 'astro';
import { supabaseAdmin } from '../../lib/supabase';
import { normalizeMpesaCode } from '../../lib/shop';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// The buyer pastes the code from their M-Pesa confirmation SMS. We only record it;
// the team checks it against their M-Pesa messages and marks the order paid.
export const POST: APIRoute = async ({ request }) => {
  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  const reference = typeof payload?.reference === 'string' ? payload.reference : '';
  const code = normalizeMpesaCode(payload?.code);
  if (!reference) return json({ error: 'Invalid request.' }, 400);
  if (!code) return json({ error: 'That doesn\'t look like an M-Pesa code. It is 10 letters and numbers, e.g. SJK3ABCD12.' }, 400);

  try {
    const { data, error } = await supabaseAdmin()
      .from('orders')
      .update({ mpesa_code: code, mpesa_code_submitted_at: new Date().toISOString(), status: 'awaiting_confirmation' })
      .eq('reference', reference)
      .eq('payment_method', 'manual_mpesa')
      .eq('status', 'pending')
      .select('id')
      .maybeSingle();

    if (error?.code === '23505') {
      return json({ error: 'That M-Pesa code has already been used for another order. Please check it, or contact us.' }, 409);
    }
    if (error) throw error;
    if (!data) return json({ error: 'This order is no longer waiting for payment.', stale: true }, 409);

    return json({ ok: true });
  } catch (err) {
    console.error('mpesa code submit failed', reference, err);
    return json({ error: 'We could not save your code. Please try again in a moment.' }, 500);
  }
};
