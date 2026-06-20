---
tipo: registro-de-fases
projeto: Specter
status: em-andamento
---
# Registro de Fases — Specter

> Diário técnico por fase: o que foi feito, decisões, versões efetivas e o gate (testes). Cada fase concluída fecha com commit + push.

---

## FASE 1 — Documentação ✅

**Entregue:** `docs/US.md` (29 user stories: 7 core + 22 extras) e `docs/ARQUITETURA.md` (9 seções).

**Processo:**
- `researcher` validou versões/APIs reais (npm registry + crates.io, jun/2026).
- 2 `researchers`-auditores revisaram cada doc em paralelo (o portão).
- Veredito: ambos **APROVADO COM RESSALVAS**, zero bloqueantes.
- Ressalvas aplicadas: opacidade 0.3–1.0, onboarding ≤4 passos, modo inserir/executar padronizado (US-06/09/25), US-29 como fonte única de duração, self-links normalizados, Vite↔plugin-react coerente, `plugin-notification` para US-22, `WDA_MONITOR` vs `WDA_EXCLUDEFROMCAPTURE` explicitados.

**Decisões-chave de arquitetura:**
- Stealth via Win32 `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE=0x11)` — **não** `set_content_protected` (que aplica `WDA_MONITOR`, insuficiente).
- Streaming do PTY por `Channel<Vec<u8>>` (ordering por sessão), não `emit` global.
- Persistência em `%LOCALAPPDATA%` (roaming descartado de propósito).
- No-admin: NSIS `installMode: currentUser` + exe portátil standalone (WebView2).

**Commit:** `docs: FASE 1 — US.md e ARQUITETURA.md aprovados no portao`.

---

## FASE 2.0 — Scaffold + setup de testes ✅

**Entregue:** projeto Tauri 2 + React 19 + Vite + TS + Tailwind 4 funcional, com testes unitários nos dois lados.

**O que foi feito:**
- Baseline via `create-tauri-app 4.6.2` (template `react-ts`, Tauri 2), movido para a raiz e renomeado `_scaffold` → `specter`.
- Tailwind 4 via `@tailwindcss/vite` + `@import "tailwindcss"` e tema base (`--color-accent: #ff5555`).
- Tela base Specter (dark, accent, marca MChiodi) — base visual da US-07.
- Vitest + Testing Library (jsdom) com `setup.ts` e 2 testes de `App`.
- `cargo test` com teste de fumaça no `lib.rs`.
- `tauri.conf.json`: `productName Specter`, `bundle.targets: ["nsis"]`, `nsis.installMode: currentUser` (US-05).
- `.gitignore` cobrindo `node_modules`, `dist`, `target`.

**Versões efetivas (resolvidas no `pnpm install`):**
`react 19.2.7` · `@tauri-apps/api 2.11.1` · `@tauri-apps/cli 2.11.3` · `tailwindcss 4.3.1` · `@tailwindcss/vite 4.3.1` · `vite 7.3.5` · `@vitejs/plugin-react 4.7.0` · `typescript 5.8.3` · `vitest 3.2.6` · `jsdom 26.1.0`.

**Decisão:** adotado o baseline coerente do gerador (plugin-react 4.7.0, TS 5.8.3) em vez das versões bleeding-edge isoladas (plugin-react 6, TS 6) — garante build verde no gate. Migração = follow-up.

**Gate (testes 100% + lógica sem erro):**
- `pnpm typecheck` (tsc strict) — sem erros.
- `pnpm test` (Vitest) — **2/2 verdes**.
- `cargo test` — **1/1 verde** (build inicial 3m24s; tauri 2.11 + webview2-com compilados).

---
