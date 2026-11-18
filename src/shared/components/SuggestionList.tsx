import type { CiapSuggestion } from "../../core";
import { CopyButton } from "./CopyButton";

interface Props {
  suggestions: CiapSuggestion[];
  /** Máximo de itens exibidos; o restante vira um aviso. */
  max: number;
  /** Versão enxuta: sem a linha "Identificado: …". */
  compact?: boolean;
  /** Mensagem quando não há sugestões. */
  emptyMessage: string;
}

export function SuggestionList({ suggestions, max, compact = false, emptyMessage }: Props) {
  if (suggestions.length === 0) {
    return <div className="ciap-empty">{emptyMessage}</div>;
  }

  const visible = suggestions.slice(0, max);
  const hidden = suggestions.length - visible.length;

  return (
    <ul className="ciap-list" aria-live="polite">
      {visible.map((s) => (
        <li key={s.code} className="ciap-item">
          <strong className="ciap-item-title">
            {s.code} — {s.label}
          </strong>
          <CopyButton code={s.code} />
          {!compact && <small className="ciap-item-terms">Identificado: {s.terms.join(", ")}</small>}
        </li>
      ))}
      {hidden > 0 && (
        <li className="ciap-more">
          +{hidden} sugestão(ões). Revise o texto.
        </li>
      )}
    </ul>
  );
}
