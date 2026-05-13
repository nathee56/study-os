import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ service: string }> }
) {
  const { service } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('googleAccessToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized', connectUrl: true }, { status: 401 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    let data;

    switch (service) {
      case 'gmail': {
        // Fetch recent messages
        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=in:inbox', { headers });
        if (!res.ok) throw new Error(await res.text());
        const msgList = await res.json();
        
        const messages = [];
        if (msgList.messages) {
          for (const msg of msgList.messages) {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, { headers });
            if (detailRes.ok) {
              const detail = await detailRes.json();
              const subjectHeader = detail.payload?.headers?.find((h: any) => h.name === 'Subject');
              const fromHeader = detail.payload?.headers?.find((h: any) => h.name === 'From');
              messages.push({
                id: msg.id,
                snippet: detail.snippet,
                subject: subjectHeader?.value || '(No Subject)',
                from: fromHeader?.value || 'Unknown',
                url: `https://mail.google.com/mail/u/0/#inbox/${msg.id}`
              });
            }
          }
        }
        data = { messages };
        break;
      }
      case 'drive': {
        const res = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=5&fields=files(id,name,mimeType,webViewLink)&orderBy=modifiedTime desc', { headers });
        if (!res.ok) throw new Error(await res.text());
        data = await res.json();
        break;
      }
      case 'calendar': {
        const timeMin = new Date().toISOString();
        const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&maxResults=5&orderBy=startTime&singleEvents=true`, { headers });
        if (!res.ok) throw new Error(await res.text());
        data = await res.json();
        break;
      }
      case 'photos': {
        const res = await fetch('https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=5', { headers });
        if (!res.ok) throw new Error(await res.text());
        data = await res.json();
        break;
      }
      default:
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error(`Error fetching from Google ${service}:`, error);
    // If it's a 401/403 from Google, it means scopes are missing or token is invalid
    return NextResponse.json({ error: 'Failed to fetch data, scopes might be missing', connectUrl: true, details: error.message }, { status: 403 });
  }
}
