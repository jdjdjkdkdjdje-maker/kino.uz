import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const backend = process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000';
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/' };

async function proxy(request: NextRequest, segments: string[]) {
  const store = await cookies();
  const target = `${backend}/api/v1/${segments.join('/')}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  headers.set('accept', 'application/json');
  const access = store.get('kinotv_admin_access')?.value;
  if (access) headers.set('authorization', `Bearer ${access}`);
  const body = ['GET','HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();
  let response = await fetch(target, { method: request.method, headers, body, cache: 'no-store' });

  if (response.status === 401 && !segments.includes('auth') && store.get('kinotv_admin_refresh')?.value) {
    const refreshResponse = await fetch(`${backend}/api/v1/auth/refresh`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refreshToken: store.get('kinotv_admin_refresh')!.value }), cache: 'no-store' });
    if (refreshResponse.ok) {
      const tokens = await refreshResponse.json();
      store.set('kinotv_admin_access', tokens.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
      store.set('kinotv_admin_refresh', tokens.refreshToken, { ...cookieOptions, maxAge: 30 * 86400 });
      headers.set('authorization', `Bearer ${tokens.accessToken}`);
      response = await fetch(target, { method: request.method, headers, body, cache: 'no-store' });
    }
  }

  const responseBody = await response.arrayBuffer();
  const outgoing = new NextResponse(responseBody, { status: response.status, headers: { 'content-type': response.headers.get('content-type') || 'application/json' } });
  if (segments.join('/') === 'auth/admin/login' && response.ok) {
    const data = JSON.parse(new TextDecoder().decode(responseBody));
    outgoing.cookies.set('kinotv_admin_access', data.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
    outgoing.cookies.set('kinotv_admin_refresh', data.refreshToken, { ...cookieOptions, maxAge: 30 * 86400 });
  }
  if (segments.join('/') === 'auth/logout') {
    outgoing.cookies.set('kinotv_admin_access', '', { ...cookieOptions, maxAge: 0 });
    outgoing.cookies.set('kinotv_admin_refresh', '', { ...cookieOptions, maxAge: 0 });
  }
  return outgoing;
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return proxy(request, (await context.params).path); }
export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return proxy(request, (await context.params).path); }
export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return proxy(request, (await context.params).path); }
export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return proxy(request, (await context.params).path); }
export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) { return proxy(request, (await context.params).path); }
