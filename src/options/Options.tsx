import { MAX_SUGGESTIONS_RANGE, useSettings } from "../shared/settings";
import "./Options.css";

export function Options() {
  const [settings, update] = useSettings();
  const { min, max } = MAX_SUGGESTIONS_RANGE;

  return (
    <main className="options">
      <h1>Sugestão CIAP-2 no SOAP — Configurações</h1>

      <label className="options-row">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        Sugestões ativadas
      </label>

      <label className="options-row">
        Máximo de sugestões exibidas
        <input
          type="number"
          min={min}
          max={max}
          value={settings.maxSuggestions}
          onChange={(e) => {
            const value = Math.round(Number(e.target.value));
            if (Number.isFinite(value)) update({ maxSuggestions: Math.min(max, Math.max(min, value)) });
          }}
        />
      </label>

      <p className="options-note">
        Apenas estas preferências são guardadas no navegador. O texto do prontuário nunca é
        armazenado nem enviado.
      </p>
    </main>
  );
}
