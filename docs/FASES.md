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

## FASE 2.2 — Frontend core ✅

**Entregue:** as duas janelas, a camada IPC tipada e os componentes core, ligando o front ao backend da 2.1.
- **Rust** `windowing/`: janelas `launcher` (56px) e `panel` em `tauri.conf.json`; comando `toggle_panel` (US-03); `apply_stealth_all` no `setup` (US-04); plugin-dialog registrado.
- **IPC** `src/ipc/` (tipado, zero `any`): `ptySpawn/Write/Resize/Close/List`, `togglePanel`, `applyCaptureExclusion` + `types/ipc.ts`.
- **Componentes** (component-per-folder): `Terminal` (xterm + 3 addons, lifecycle StrictMode-safe — US-01), `Launcher` (botão arrastável — US-03), `FolderPicker` (dialog nativo — US-02), `Panel` (composição + banner de stealth — US-07/04).
- `main.tsx` serve um único bundle para as duas janelas, decidindo o render pelo **label**.

**Orquestração (fan-out real):** 3 agentes executores em paralelo (`term-dev`, `launcher-dev`, `folder-dev`) construíram os componentes com seus testes **enquanto** o `cargo test` recompilava. O lead revisou o código, integrou `Panel`/`App` e rodou o gate consolidado.

**Decisões:**
- Módulo Rust `windowing` (não `windows`) para não colidir com a crate `windows`.
- Terminal **remonta via `key={cwd}`** ao trocar a pasta → nova sessão no cwd (US-02).
- `HWND`/stealth aplicado no `setup` e reexposto por comando (banner informa se não suportado).

**Versões:** `@xterm/xterm 6.0.0` · `addon-fit 0.11` · `addon-web-links 0.12` · `addon-search 0.16` · `@tauri-apps/plugin-dialog 2.7.1`.

**Gate:** front `tsc` strict limpo + **13/13** testes (Terminal 3, Launcher 2, FolderPicker 4, Panel 3, App 1); back `cargo test` **8/8**.

---

## FASE 2.3 — Produtividade ✅

**Entregue:** 6 features de produtividade + fundação de persistência, integradas no Panel.

- **Fundação Rust:** `persistence/` (store `get/set/remove` JSON em `%LOCALAPPDATA%`, com `sanitize` de chave) e `actions/` (`open_in_explorer`, `open_in_vscode`). **Front:** `ipc/store.ts`, `ipc/actions.ts`, `store/persist.ts` (`loadJson/saveJson` tipados).
- **Componentes** (component-per-folder, persistidos): `CommandPalette` (US-06), `Snippets` com placeholders `{nome}` (US-09), `History` (US-08), `Autocomplete` por prefixo (US-24), `Profiles` (US-12), `CheatSheet` (US-25), `QuickActions` (US-26).
- **Integração:** `Terminal` expõe handle imperativo (`runCommand`/`insertText`) via **ref-como-prop do React 19**; `Panel` ganhou toolbar que abre cada ferramenta num painel lateral e fia `onInsert`/`onRun` ao terminal; perfis rodam os `initCommands` em ordem no spawn da sessão (US-12).

**Orquestração (fan-out de 6 agentes):** `cmd-dev`, `snip-dev`, `hist-dev`, `prof-dev`, `cheat-dev`, `qa-dev` em paralelo durante o `cargo test`.

**Aprendizado:** 2 agentes (`cmd-dev`, `snip-dev`) sinalizaram `idle/available` **sem terminar** (faltavam o componente/testes). O **gate do lead** (rodar a suíte + conferir a árvore) detectou as lacunas — não confiar no "idle" do agente como prova de conclusão; o que garante 100% é o gate. Os agentes retomaram e o lead consolidou.

**Versões:** sem novas deps de runtime no front; backend reusa `serde_json` + Tauri path API.

**Gate:** front `tsc` strict + **56/56** testes (12 arquivos); back `cargo test` **11/11** (8 + 3 de persistência), 0 warnings.

---

## FASE 2.4 — Janela/stealth ✅

**Entregue:** US-13 (atalho global), US-14 (boss key), US-15 (always-on-top), US-16 (opacidade), US-17 (temas).

- **Rust:** `windowing` ganhou `set_panel_always_on_top`, `hide_all`, `show_all`; plugin `tauri-plugin-global-shortcut` registrado; capability com permissões `global-shortcut:*`.
- **Front:** `types/settings.ts` + `store/settings.ts` (`useSettings`, persiste `settings.json`); `Settings` (UI controlada) + `useTheme` (aplica `data-theme`/`--color-accent`); `hooks/useShortcuts` (registra atalhos via plugin JS, dispara só em `Pressed`, refs nos callbacks).
- **Integração:** `Panel` chama `useSettings`/`useTheme`/`useShortcuts`, aplica `opacity` no container, ganhou aba **Config**; toggle e boss key ligados a `togglePanel`/`hideAll`. Tema claro no `index.css` (`[data-theme="light"]`).

**Orquestração:** 2 agentes (`settings-dev`, `shortcut-dev`) em paralelo durante o `cargo test`.

**Aprendizado (reviewer catch):** o `tsc` strict pegou **TS1448** — o componente `Settings` colidia com o `import type { Settings }` sob `isolatedModules`, tornando o `export { default }` ambíguo. Os 66 testes passavam (esbuild ignora tipos); só o typecheck detectou. Corrigido com alias (`Settings as AppSettings`). Reforça por que o gate tem **typecheck + testes**.

**Gate:** front `tsc` strict + **66/66** testes (14 arquivos: +Settings 5, +useShortcuts 5); back `cargo test` **11/11**, 0 warnings.

---
