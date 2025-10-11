/**
 * Hook to detect if the component is hydrated (client-side)
 *
 * Prevents hydration mismatches in SSR environments like Remix.
 * Returns false during SSR, true after client-side hydration.
 *
 * @example
 * const hydrated = useHydrated();
 * if (!hydrated) return null; // Skip rendering until hydrated
 */

import { useEffect, useState } from 'react';

export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
