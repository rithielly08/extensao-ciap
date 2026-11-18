import { useEffect } from "react";
import { findTextField } from "../dom/fields";

/**
 * Enquanto `active`, intercepta o próximo clique na página e o resolve para um
 * campo de texto. Cliques dentro do painel (`ignore`) são ignorados.
 */
export function useFieldPicker(
  active: boolean,
  ignore: HTMLElement,
  onPick: (field: HTMLElement) => void,
  onMiss: () => void,
) {
  useEffect(() => {
    if (!active) return;

    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Node && ignore.contains(event.target)) return;

      const path = event.composedPath?.() ?? [event.target];
      for (const node of path) {
        const field = node ? findTextField(node) : null;
        if (field) return onPick(field);
      }
      onMiss();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [active, ignore, onPick, onMiss]);
}
