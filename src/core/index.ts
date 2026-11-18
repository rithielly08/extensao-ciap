import dictionaryJson from "../data/ciap-dictionary.json";
import { createEngine } from "./engine";
import type { CiapEntry } from "./types";

export type { CiapEntry, CiapSuggestion } from "./types";
export { createEngine } from "./engine";
export { normalize } from "./normalize";

export const dictionary: readonly CiapEntry[] = dictionaryJson;

/** Motor pronto para uso, alimentado pelo dicionário JSON do projeto. */
export const engine = createEngine(dictionary);
