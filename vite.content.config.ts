import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Build do content script como um único IIFE (content/index.js).
 * O CSS do painel é importado com `?inline` e injetado no Shadow DOM.
 */
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  publicDir: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      mode === "development" ? "development" : "production",
    ),
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    sourcemap: mode === "development",
    minify: mode !== "development",
    lib: {
      entry: "src/content/index.tsx",
      name: "CiapSugestao",
      formats: ["iife"],
      fileName: () => "content/index.js",
    },
  },
}));
