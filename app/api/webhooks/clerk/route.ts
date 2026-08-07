import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response('WEBHOOK_SECRET is missing', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response('Invalid webhook signature', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, username, image_url } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    if (primaryEmail) {
      try {
        await prisma.user.create({
          data: {
            id: id,
            email: primaryEmail,
            username: username || primaryEmail.split('@')[0],
            avatarUrl: image_url || null,
          },
        });
      } catch (dbErr) {
        console.error('Database write error:', dbErr);
        return new Response('Database error', { status: 500 });
      }
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}