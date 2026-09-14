import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile(): boolean {
  return React.useSyncExternalStore(
    (callback: () => void): (() => void) => {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      mql.addEventListener("change", callback);
      return (): void => {
        mql.removeEventListener("change", callback);
      };
    },
    (): boolean => window.innerWidth < MOBILE_BREAKPOINT,
    (): boolean => false
  );
}
