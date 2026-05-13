import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';

export async function POST(req: NextRequest) {
  try {
    const { subscription, title, body, url } = await req.json();

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidEmail = process.env.VAPID_EMAIL || 'mailto:noreply@jamdai.app';

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    };

    const payload = JSON.stringify({
      title: title || 'JamDai',
      body: body || 'คุณมีการแจ้งเตือนใหม่',
      icon: '/icon-192.png',
      url: url || '/app',
    });

    await webPush.sendNotification(pushSubscription, payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
