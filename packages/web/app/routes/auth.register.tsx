/**
 * Auth Register Layout Route
 *
 * This layout wraps all /auth/register/* routes.
 * Simply renders the child routes without additional wrapper.
 */

import { Outlet } from '@remix-run/react';

export default function AuthRegisterLayout() {
  return <Outlet />;
}
