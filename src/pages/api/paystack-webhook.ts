import type { APIRoute } from 'astro';
import { isValidWebhookSignature } from '../../lib/paystack';
import { confirmPayment } from '../../lib/shop';

export const prerender = false;

// Paystack calls this after a payment, even if the buyer closes the tab before
// returning to the site. We re-verify with Paystack rather than trusting the body.
export const POST: APIRoute = async ({ request }) => {
  const raw = await request.text();
  if (!isValidWebhookSignature(raw, request.headers.get('x-paystack-signature'))) {
    return new Response('Invalid signature', { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('Bad payload', { status: 400 });
  }

  const reference = event?.data?.reference;
  if (event?.event === 'charge.success' && typeof reference === 'string') {
    try {
      await confirmPayment(reference);
    } catch (err) {
      console.error('webhook confirm failed', reference, err);
      return new Response('Retry later', { status: 500 });
    }
  }
  return new Response('ok');
};
