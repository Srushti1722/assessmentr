import { NextRequest, NextResponse } from 'next/server';

// Use NEXT_PUBLIC_CORE_API_URL if defined, otherwise fall back to production API
// This allows local backend testing if the user has the Python agent/API running locally.
const BACKEND_URL = process.env.NEXT_PUBLIC_CORE_API_URL || 'https://api.assessmentr.com/api/v1';

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return proxyRequest(request, params.path);
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  const pathname = request.nextUrl.pathname;
  const proxyPath = pathname.split('/api/backend-proxy/')[1] || '';
  
  let currentUrl = `${BACKEND_URL}/${proxyPath}${request.nextUrl.search}`;
  const originalBody = await request.arrayBuffer();
  const bodyBuffer = originalBody.byteLength > 0 ? Buffer.from(originalBody) : undefined;

  let attempts = 0;
  const maxRedirects = 5;

  while (attempts < maxRedirects) {
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.delete('connection');
    headers.delete('cookie'); // Don't forward Supabase cookies to the core backend
    headers.delete('origin'); // Avoid CORS issues on the core backend
    headers.delete('referer');
    headers.set('host', new URL(currentUrl).host);

    try {
      const response = await fetch(currentUrl, {
        method: request.method,
        headers: headers,
        body: bodyBuffer,
        redirect: 'manual', // Stop fetch from handling redirects automatically
      });

      // If the server redirects, we manually follow it with the original body
      if ([301, 302, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location) {
          currentUrl = new URL(location, currentUrl).toString();
          attempts++;
          continue; // Try again with the NEW URL
        }
      }

      const responseData = await response.arrayBuffer();
      const responseHeaders = new Headers(response.headers);
      
      // Remove headers that might conflict with Next.js's response handling
      responseHeaders.delete('content-encoding');
      responseHeaders.delete('transfer-encoding');

      return new NextResponse(responseData, {
        status: response.status,
        headers: responseHeaders,
      });
    } catch (error: any) {
      console.error(`[Proxy Error] Attempt ${attempts}:`, error);
      return NextResponse.json({ 
        error: 'Proxy failed', 
        details: error.message 
      }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Too many redirects' }, { status: 500 });
}
