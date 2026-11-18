import { useCallback, useEffect, useState } from "react";
import { browser } from "./browser";

export interface Settings {
  /** Liga/desliga a leitura do campo e as sugestões. */
  enabled: boolean;
  /** Máximo de sugestões exibidas por vez. */
  maxSuggestions: number;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  maxSuggestions: 8,
};

export const MAX_SUGGESTIONS_RANGE = { min: 1, max: 20 } as const;

const STORAGE_KEY = "settings";

/** Só guarda preferências. Nenhum texto clínico é armazenado. */
export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await browser.storage.local.get(STORAGE_KEY);
    return { ...DEFAULT_SETTINGS, ...(stored[STORAGE_KEY] as Partial<Settings>) };
  } catch {
    // Fora do contexto da extensão (ou extensão recarregada): usa os padrões.
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  try {
    const current = await loadSettings();
    await browser.storage.local.set({ [STORAGE_KEY]: { ...current, ...patch } });
  } catch {
    /* extensão recarregada: ignora */
  }
}

/** Lê as configurações, mantém-nas sincronizadas entre popup, opções e páginas. */
export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    loadSettings().then((s) => !cancelled && setSettings(s));

    const onChanged = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        setSettings({ ...DEFAULT_SETTINGS, ...changes[STORAGE_KEY].newValue });
      }
    };
    try {
      browser.storage.onChanged.addListener(onChanged);
    } catch {
      /* sem storage disponível */
    }
    return () => {
      cancelled = true;
      try {
        browser.storage.onChanged.removeListener(onChanged);
      } catch {
        /* ignora */
      }
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
    void saveSettings(patch);
  }, []);

  return [settings, update] as const;
}
