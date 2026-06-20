import type { JSX } from "react";
import "./styles/index.css";

/**
 * Tela base do Specter (scaffold). As janelas launcher/panel e o terminal
 * entram nas próximas fases — aqui só a identidade visual mínima (US-07).
 */
function App(): JSX.Element {
  return (
    <main className="flex h-screen flex-col items-center justify-center gap-3 text-gray-200">
      <h1 className="text-4xl font-bold tracking-tight">
        Spec<span className="text-[var(--color-accent)]">ter</span>
      </h1>
      <p className="text-sm text-gray-400">
        Terminal flutuante stealth — scaffold pronto.
      </p>
      <span className="text-xs text-gray-600">MChiodi</span>
    </main>
  );
}

export default App;
