import { createRoot } from "react-dom/client";
import suggestionStyles from "../shared/components/suggestions.css?inline";
import themeStyles from "../shared/theme.css?inline";
import { Panel } from "./components/Panel";
import panelStyles from "./panel.css?inline";
import { resetHost } from "./dom/placement";

const HOST_ID = "ciap-sugestao-host";

/**
 * O painel vive em um Shadow DOM: o CSS do PEC não vaza para dentro dele e o
 * nosso não vaza para a página.
 */
function mount() {
  if (document.getElementById(HOST_ID)) return; // evita painel duplicado

  const host = document.createElement("div");
  host.id = HOST_ID;
  resetHost(host);

  const shadow = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = [themeStyles, suggestionStyles, panelStyles].join("\n");
  const container = document.createElement("div");
  shadow.append(style, container);

  createRoot(container).render(<Panel host={host} />);
}

mount();
