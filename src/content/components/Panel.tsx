import { useCallback, useEffect, useMemo, useState } from "react";
import { engine } from "../../core";
import { SuggestionList } from "../../shared/components/SuggestionList";
import { VERSION } from "../../shared/manifest";
import { useSettings } from "../../shared/settings";
import { describeField, readFieldText } from "../dom/fields";
import { type Placement, placeHost, resetHost } from "../dom/placement";
import { useDomActivity } from "../hooks/useDomActivity";
import { useFieldPicker } from "../hooks/useFieldPicker";
import { useHref } from "../hooks/useHref";
import { NOTICES, usePanelState } from "../hooks/usePanelState";

/** Frase fictícia usada pelo botão "Testar sugestão". Nunca vai ao prontuário. */
const TEST_PHRASE = "Paciente relata dor de cabeça.";

const SOAP_PATH = /\/soap(?:\/|$)/i;

export function Panel({ host }: { host: HTMLElement }) {
  const [settings, updateSettings] = useSettings();
  const href = useHref();
  const onSoapPage = SOAP_PATH.test(new URL(href).pathname);

  const [state, dispatch] = usePanelState();
  const [collapsed, setCollapsed] = useState(false);
  const [placement, setPlacement] = useState<Placement>("floating");

  // Ao habilitar/desabilitar ou navegar, o vínculo com o campo é descartado.
  const [seen, setSeen] = useState({ enabled: settings.enabled, href });
  if (seen.enabled !== settings.enabled || seen.href !== href) {
    setSeen({ enabled: settings.enabled, href });
    const notice = seen.enabled !== settings.enabled
      ? settings.enabled ? "reselect" : "disabled"
      : "navigated";
    dispatch({ type: "reset", notice });
  }

  const linked = state.mode === "linked" ? state.field : null;
  const tick = useDomActivity(settings.enabled && onSoapPage && linked !== null, host);

  const pick = useCallback((field: HTMLElement) => dispatch({ type: "picked", field }), [dispatch]);
  const miss = useCallback(() => dispatch({ type: "missed" }), [dispatch]);
  useFieldPicker(settings.enabled && onSoapPage && state.selecting, host, pick, miss);

  // O PEC pode recriar o campo; nesse caso é preciso selecioná-lo de novo.
  useEffect(() => {
    if (linked && !linked.isConnected) dispatch({ type: "reset", notice: "recreated" });
  }, [linked, tick, dispatch]);

  // Mantém o painel entre o Subjetivo e o "Motivo da consulta" enquanto houver campo.
  useEffect(() => {
    if (!linked) return;
    setPlacement(placeHost(host, linked));
  }, [linked, tick, host]);
  useEffect(() => {
    if (!linked) return;
    return () => resetHost(host);
  }, [linked, host]);

  // `tick` força nova leitura do campo a cada digitação ou mudança no DOM.
  const fieldText = useMemo(() => readFieldText(linked), [linked, tick]);
  const text = state.mode === "test" ? TEST_PHRASE : fieldText;
  const suggestions = useMemo(() => engine.suggest(text), [text]);

  if (!onSoapPage) return null;

  const hasResult = state.mode !== "idle";
  const compact = linked !== null && placement === "inline";
  const source = linked ? describeField(linked) : "Teste local";
  const notice = settings.enabled ? NOTICES[state.notice] : NOTICES.disabled;

  const selectLabel = state.selecting
    ? "Cancelar seleção"
    : state.mode === "linked"
      ? "Trocar campo"
      : "Selecionar Subjetivo";

  return (
    <section className="ciap-panel" aria-label="Sugestões CIAP-2">
      <header className="ciap-top">
        <strong>CIAP-2 • SOAP{VERSION && ` v${VERSION}`}</strong>
        <button
          type="button"
          className="ciap-btn ciap-min"
          aria-label={collapsed ? "Expandir painel" : "Minimizar painel"}
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "+" : "−"}
        </button>
      </header>

      {!collapsed && (
        <div className="ciap-body">
          {!compact && (
            <>
              <div className="ciap-actions">
                <button
                  type="button"
                  className="ciap-btn"
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                >
                  {settings.enabled ? "Desabilitar" : "Habilitar"}
                </button>
                <button
                  type="button"
                  className="ciap-btn"
                  disabled={!settings.enabled}
                  onClick={() =>
                    dispatch({ type: state.selecting ? "cancelSelecting" : "startSelecting" })
                  }
                >
                  {selectLabel}
                </button>
                <button
                  type="button"
                  className="ciap-btn"
                  disabled={!settings.enabled}
                  onClick={() => dispatch({ type: "testing" })}
                >
                  Testar sugestão
                </button>
              </div>
              <div className="ciap-status">{notice}</div>
            </>
          )}

          {settings.enabled && hasResult && (
            <>
              {!compact && (
                <div className="ciap-debug" aria-live="polite">
                  Origem: {source} • Texto lido: {text.length} caractere(s) • Termo reconhecido:{" "}
                  {suggestions.length > 0 ? "sim" : "não"}
                </div>
              )}
              <div className={compact ? "ciap-result is-scrollable" : "ciap-result"}>
                <SuggestionList
                  suggestions={suggestions}
                  max={settings.maxSuggestions}
                  compact={compact}
                  emptyMessage={
                    text.length
                      ? "Nenhuma correspondência no dicionário atual."
                      : "Não consegui ler o texto do campo. Selecione novamente a caixa onde digita."
                  }
                />
              </div>
            </>
          )}

          {!compact && (
            <small className="ciap-footnote">
              Processamento local. Não envia nem armazena dados clínicos. A decisão é do
              profissional.
            </small>
          )}
        </div>
      )}
    </section>
  );
}
