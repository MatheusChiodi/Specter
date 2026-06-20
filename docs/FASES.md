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

## FASE 2.1 — Backend core Rust ✅

**Entregue:** módulos Rust por responsabilidade, todos ≤400 linhas, com testes.
- `pty/` — ConPTY via `portable-pty 0.9`: `PtyManager` (spawn/write/resize/close/list/close_all), uma PTY por sessão, streaming da saída por callback (US-01/10/23/27).
- `capture/` — stealth Win32 (`windows 0.62`): `apply_stealth` com `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)` + detecção de build via `RtlGetVersion` (US-04).
- `commands/` — 6 comandos Tauri: `pty_spawn` (com `Channel<Vec<u8>>`), `pty_write/resize/close/list`, `apply_capture_exclusion`.
- `error.rs` — `SpecterError` serializável; `lib.rs` com `manage(PtyManager)` + `generate_handler`.

**Decisões:**
- Escopo das **janelas launcher/panel movido para a 2.2** (anda junto com a UI).
- HWND passado como **ponteiro bruto** (`hwnd().0`) para desacoplar da versão da crate `windows` do Tauri.
- Streaming por **callback → `Channel`** (não `emit` global): ordering por sessão.
- `Drop for PtyManager` → `close_all` (sem processos órfãos no shutdown).

**Versões:** `portable-pty 0.9.0` · `windows 0.62` (features `Win32_Foundation`, `Win32_UI_WindowsAndMessaging`, `Win32_System_SystemInformation`, `Wdk_System_SystemServices`).

**Gate:** `cargo test` — **8/8 verdes, 0 warnings**.

**Aprendizado:** teste de PTY não deve acoplar ao *rendering* do ConPTY (texto renderizado depende de timing/DSR). Validamos o nosso código — spawn/stream/write/resize/close — não o redraw do Windows.

---
