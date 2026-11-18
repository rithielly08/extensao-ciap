import { useMemo, useState } from "react";
import { engine } from "../core";
import { SuggestionList } from "../shared/components/SuggestionList";
import { browser } from "../shared/browser";
import { VERSION } from "../shared/manifest";
import { useSettings } from "../shared/settings";
import "./App.css";

export function App() {
  const [settings, update] = useSettings();
  const [text, setText] = useState("");
  const suggestions = useMemo(() => engine.suggest(text), [text]);

  return (
    <main className="popup">
      <header className="popup-header">
        <h1>Sugestão CIAP-2</h1>
        <span className="popup-version">v{VERSION}</span>
      </header>

      <label className="popup-toggle">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        Sugestões ativadas no SOAP
      </label>

      <section className="popup-tester">
        <label htmlFor="tester">Testar o dicionário</label>
        <textarea
          id="tester"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex.: dor de cabeça e febre desde ontem"
        />
        {text.trim() && (
          <SuggestionList
            suggestions={suggestions}
            max={settings.maxSuggestions}
            emptyMessage="Nenhuma correspondência no dicionário atual."
          />
        )}
        <small>Use apenas frases fictícias. Nada é enviado ou armazenado.</small>
      </section>

      <button type="button" className="ciap-btn" onClick={() => browser.runtime.openOptionsPage()}>
        Configurações
      </button>
    </main>
  );
}
