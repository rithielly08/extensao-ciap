export type Placement = "inline" | "floating";

const MOTIVO_LABEL = /^motivo da consulta\s*\(?ciap\s*2\)?/i;

/**
 * Encontra, no mesmo contêiner do campo Subjetivo, o bloco "Motivo da consulta"
 * antes do qual o painel pode ser inserido. Não atravessa Shadow DOM.
 */
function findInlineAnchor(
  field: HTMLElement,
  host: HTMLElement,
): { container: Element; before: Element } | null {
  if (field.getRootNode() !== document) return null;

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const label = node.parentElement;
    if (!label || host.contains(label)) continue;
    if (!MOTIVO_LABEL.test((node.nodeValue ?? "").replace(/\s+/g, " ").trim())) continue;
    if (label.contains(field)) continue;

    // Menor ancestral comum entre o rótulo e o campo.
    let container: Element | null = label;
    while (container && !container.contains(field)) container = container.parentElement;
    if (!container || container === document.body || container === document.documentElement) continue;

    // Filho direto do contêiner que contém o rótulo.
    let before: Element = label;
    while (before.parentElement !== container) before = before.parentElement!;
    if (before === field || before.contains(field)) continue;

    return { container, before };
  }
  return null;
}

/**
 * Posiciona o painel entre o Subjetivo e o "Motivo da consulta".
 * Se a estrutura da página não permitir, ele flutua no canto da tela.
 */
export function placeHost(host: HTMLElement, field: HTMLElement): Placement {
  const anchor = host.isConnected ? findInlineAnchor(field, host) : null;
  if (!anchor) {
    resetHost(host);
    return "floating";
  }
  if (host.parentElement !== anchor.container || host.nextSibling !== anchor.before) {
    anchor.container.insertBefore(host, anchor.before);
  }
  host.dataset.placement = "inline";
  return "inline";
}

/** Devolve o painel ao canto da tela (filho de <body>). */
export function resetHost(host: HTMLElement): void {
  host.dataset.placement = "floating";
  const home = document.body ?? document.documentElement;
  if (host.parentElement !== home) home.appendChild(host);
}
