import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

const PROXIED_PREFIXES = ['/api/', '/images/'];

export const handle: Handle = async ({ event, resolve }) => {
  const { pathname } = event.url;

  if (pathname === '/api/health') {
    return new Response(JSON.stringify({ status: 'ok' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }

  if (!PROXIED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return resolve(event);
  }

  const apiUrl = env.API_URL ?? 'http://localhost:3000';
  const target = `${apiUrl}${pathname}${event.url.search}`;

  const headers = new Headers(event.request.headers);
  headers.delete('host');

  const res = await fetch(target, {
    method: event.request.method,
    headers,
    body: event.request.body,
    // @ts-expect-error -- Node fetch supports duplex for streaming request bodies
    duplex: 'half',
  });

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
  });
};
