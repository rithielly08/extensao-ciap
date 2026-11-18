/** Elementos que podem ser o campo de texto do Subjetivo. */
const FIELD_SELECTOR = [
  "textarea",
  'input[type="text"]',
  "input:not([type])",
  '[contenteditable="true"]',
  '[contenteditable=""]',
  '[role="textbox"]',
  ".ql-editor",
  ".ProseMirror",
  ".cke_editable",
].join(",");

const EXCLUDED_INPUT_TYPES = new Set(["hidden", "password", "search", "email", "number"]);

/** Procura o campo de texto correspondente a um nó clicado. */
export function findTextField(target: EventTarget): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  let el: Element | null = target.closest(FIELD_SELECTOR) ?? target.querySelector(FIELD_SELECTOR);
  if (!el && target instanceof HTMLElement && target.isContentEditable) el = target;
  if (!(el instanceof HTMLElement)) return null;

  if (el instanceof HTMLInputElement && EXCLUDED_INPUT_TYPES.has(el.type)) return null;
  return el;
}

/** Lê o texto atual do campo (input/textarea ou editor rico). */
export function readFieldText(el: HTMLElement | null): string {
  if (!el?.isConnected) return "";
  try {
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) return el.value ?? "";

    const nested = el.matches('[contenteditable], [role="textbox"]')
      ? el
      : el.querySelector<HTMLElement>('[contenteditable], textarea, [role="textbox"]');
    if (nested && nested !== el) return readFieldText(nested);

    return el.innerText || el.textContent || "";
  } catch {
    return "";
  }
}

/** Descrição curta do tipo de campo, para o texto de diagnóstico. */
export function describeField(el: HTMLElement): string {
  return el.tagName.toLowerCase() + (el.isContentEditable ? " (editável)" : "");
}
