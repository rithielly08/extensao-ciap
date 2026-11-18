/** Uma entrada do dicionário (ver `src/data/ciap-dictionary.json`). */
export interface CiapEntry {
  /** Código CIAP-2, ex.: "N01". */
  code: string;
  /** Rótulo oficial, ex.: "Cefaleia". */
  label: string;
  /** Termos e expressões (inclusive coloquiais) que levam à sugestão. */
  terms: readonly string[];
}

/** Uma sugestão produzida pelo motor. */
export interface CiapSuggestion {
  code: string;
  label: string;
  /** Termos originais do dicionário que foram encontrados no texto. */
  terms: string[];
}
