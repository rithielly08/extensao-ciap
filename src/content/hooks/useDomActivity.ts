import { useEffect, useState } from "react";

const DEBOUNCE_MS = 170;
const INPUT_EVENTS = ["input", "keyup", "change"] as const;

/**
 * Devolve um contador que avança (com debounce) sempre que o usuário digita ou
 * o DOM da página muda. Mudanças dentro do próprio painel (`ignore`) não contam.
 */
export function useDomActivity(active: boolean, ignore: HTMLElement): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setTick((t) => t + 1), DEBOUNCE_MS);
    };

    for (const type of INPUT_EVENTS) document.addEventListener(type, schedule, true);

    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some(
        (m) =>
          !ignore.contains(m.target) &&
          ![...m.addedNodes, ...m.removedNodes].includes(ignore),
      );
      if (relevant) schedule();
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => {
      clearTimeout(timer);
      for (const type of INPUT_EVENTS) document.removeEventListener(type, schedule, true);
      observer.disconnect();
    };
  }, [active, ignore]);

  return tick;
}
