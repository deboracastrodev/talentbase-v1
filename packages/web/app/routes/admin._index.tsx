/**
 * Admin Dashboard Index
 *
 * Redirects to /admin/users as the default admin page.
 */

import { redirect } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect to users management page
  return redirect('/admin/users');
}

export default function AdminIndex() {
  // This component won't render due to redirect in loader
  return null;
}
