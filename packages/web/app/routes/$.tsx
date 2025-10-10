import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hostname = url.hostname.replace(/\.$/, '').toLowerCase();

  if (hostname === 'salesdog.click') {
    const redirectUrl = new URL(request.url);
    redirectUrl.protocol = 'https:';
    redirectUrl.hostname = 'www.salesdog.click';
    redirectUrl.port = '';

    return redirect(redirectUrl.toString(), 301);
  }

  throw new Response('Not Found', { status: 404 });
}
