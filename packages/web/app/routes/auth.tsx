/**
 * Auth Layout Route
 *
 * This layout is automatically applied to all routes under /auth/*
 * Simply renders child routes without additional wrapper.
 */

import { Outlet } from '@remix-run/react';

export default function AuthLayout() {
  return <Outlet />;
}
