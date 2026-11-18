import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Build das páginas da extensão (popup e opções).
 * O content script é gerado à parte, em `vite.content.config.ts`, porque
 * precisa ser um único arquivo autocontido (não pode importar chunks).
 */
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    // A limpeza é feita por `npm run clean`, pois dois builds escrevem em dist/.
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
        options: "src/options/index.html",
      },
    },
  },
});
