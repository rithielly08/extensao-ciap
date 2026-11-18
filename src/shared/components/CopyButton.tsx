import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

export function CopyButton({ code }: { code: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setState("copied");
    } catch {
      // Sem permissão para a área de transferência: mostra o código para cópia manual.
      setState("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button type="button" className="ciap-btn" onClick={copy}>
      {state === "copied" ? "Copiado!" : state === "failed" ? `Código: ${code}` : `Copiar ${code}`}
    </button>
  );
}
