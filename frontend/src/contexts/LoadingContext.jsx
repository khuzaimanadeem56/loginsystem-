import { createContext, useState, useRef, useCallback } from 'react';

export const LoadingContext = createContext({ loading: false, setLoading: () => {} });

// Minimum and maximum time (ms) the loader should remain visible
// MIN prevents flicker, MAX ensures the loader hides after a short interval
// Reduced durations for snappier UX per user request
const MIN_DISPLAY_MS = 100; // 0.1s
const MAX_DISPLAY_MS = 300; // 0.3s

export function LoadingProvider({ children }) {
  const [loading, setLoadingState] = useState(false);
  const startRef = useRef(0);
  const timeoutRef = useRef(null);

  const setLoading = useCallback((value) => {
    if (value) {
      // show loader
      startRef.current = Date.now();
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
      // clear any existing auto-hide
      if (timeoutRef.current) { clearTimeout(timeoutRef.current); }
      setLoadingState(true);
      // ensure loader does not stay longer than MAX_DISPLAY_MS
      timeoutRef.current = setTimeout(() => {
        setLoadingState(false);
        timeoutRef.current = null;
      }, MAX_DISPLAY_MS);
    } else {
      // hide loader but ensure minimum display time
      const elapsed = Date.now() - (startRef.current || 0);
      const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
      if (remaining > 0) {
        // If there was an auto-hide scheduled, clear it and reschedule for remaining time
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
        timeoutRef.current = setTimeout(() => {
          setLoadingState(false);
          timeoutRef.current = null;
        }, remaining);
      } else {
        // clear any auto-hide since we're hiding now
        if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
        setLoadingState(false);
      }
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
