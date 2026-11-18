import { escapeRegExp, normalize } from "./normalize";
import type { CiapEntry, CiapSuggestion } from "./types";

/**
 * Correspondência lexical local, sem diagnóstico automático.
 * Termos coloquiais são heurísticas; revisão clínica institucional necessária.
 */

/** Quantos caracteres antes do termo são examinados em busca de negação. */
const NEGATION_WINDOW = 42;

/**
 * Negação/hipótese próxima (até 3 palavras antes do termo) impede a sugestão.
 * Opera sobre texto já normalizado (sem acentos, minúsculo).
 */
const NEGATION =
  /(?:^|\b)(?:nega|negou|sem|nao|ausencia de|descarta|descartou|suspeita de|possivel)(?:\s+\w+){0,3}\s*$/;

const SEGMENT_SEPARATOR = /[.!?;\n]/;

interface CompiledEntry {
  entry: CiapEntry;
  patterns: { original: string; regex: RegExp }[];
}

export interface CiapEngine {
  suggest(text: string): CiapSuggestion[];
}

/**
 * Cria um motor a partir de um dicionário. As expressões regulares são
 * compiladas uma única vez, não a cada chamada de `suggest`.
 */
export function createEngine(dictionary: readonly CiapEntry[]): CiapEngine {
  const compiled: CompiledEntry[] = dictionary.map((entry) => ({
    entry,
    patterns: entry.terms.map((original) => ({
      original,
      regex: new RegExp(
        `(?:^|[^a-z0-9])(${escapeRegExp(normalize(original))})(?![a-z0-9])`,
        "g",
      ),
    })),
  }));

  function suggest(text: string): CiapSuggestion[] {
    const results = new Map<string, CiapSuggestion>();

    for (const segment of String(text ?? "").split(SEGMENT_SEPARATOR)) {
      const clause = normalize(segment);
      if (!clause) continue;

      for (const { entry, patterns } of compiled) {
        for (const { original, regex } of patterns) {
          for (const match of clause.matchAll(regex)) {
            const before = clause.slice(
              Math.max(0, match.index - NEGATION_WINDOW),
              match.index,
            );
            if (NEGATION.test(before)) continue;

            let current = results.get(entry.code);
            if (!current) {
              current = { code: entry.code, label: entry.label, terms: [] };
              results.set(entry.code, current);
            }
            if (!current.terms.includes(original)) current.terms.push(original);
          }
        }
      }
    }

    return [...results.values()];
  }

  return { suggest };
}
