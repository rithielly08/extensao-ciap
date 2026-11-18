import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  // O PEC é uma SPA e a navegação via pushState não é visível a content scripts.
  const timer = setInterval(onChange, 500);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
    clearInterval(timer);
  };
}

/** URL atual da página, atualizada em navegações da SPA. */
export function useHref(): string {
  return useSyncExternalStore(subscribe, () => location.href);
}
