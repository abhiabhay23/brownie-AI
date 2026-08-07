import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing WEBHOOK_SECRET');
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
    console.error('Verification failed:', err);
    return new Response('Invalid webhook signature', { status: 400 });
  }

  if (evt.type === 'user.created') {
    const { id, email_addresses, username, first_name, image_url } = evt.data;
    const primaryEmail = email_addresses[0]?.email_address;

    if (primaryEmail) {
      try {
        const { prisma } = await import('@/lib/prisma');

        // Safe fallback for username if not provided during sign-up
        const fallbackUsername = username || first_name || primaryEmail.split('@')[0];

        await prisma.user.upsert({
          where: { id: id },
          update: {
            email: primaryEmail,
            username: fallbackUsername,
            avatarUrl: image_url || null,
          },
          create: {
            id: id,
            email: primaryEmail,
            username: fallbackUsername,
            avatarUrl: image_url || null,
          },
        });
        console.log(`User ${id} synced successfully to Neon.`);
      } catch (dbErr) {
        console.error('Prisma Error during webhook:', dbErr);
        return new Response('Database insertion error', { status: 500 });
      }
    }
  }

  return new Response('Webhook processed successfully', { status: 200 });
}