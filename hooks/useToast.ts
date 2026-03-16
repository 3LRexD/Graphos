import { useState, useCallback } from "react";

/**
 * Lightweight toast notification hook.
 *
 * Returns the current toast message (or null) plus a `showToast` function.
 * The message auto-clears after `ms` milliseconds (default 3 500).
 */
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string, ms = 3500) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  }, []);

  return { toast, showToast };
}