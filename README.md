# Specter

> Terminal flutuante **stealth** + launcher de **Claude Code**. Botão flutuante always-on-top, **invisível em compartilhamento de tela**, roda em PC corporativo ou pessoal **sem admin** (`.exe` per-user + portátil).

Local-first, zero-backend. Tudo roda na máquina.

---

## Status das fases

| Fase | Descrição | Estado |
|------|-----------|--------|
| **FASE 1** | Documentação (`US.md` + `ARQUITETURA.md`) + portão de auditoria | ✅ **Finalizada** |
| **FASE 2.0** | Scaffold (Tauri 2 + React 19 + Vite + TS + Tailwind 4) + setup de testes | ✅ **Finalizada** |
| **FASE 2.1** | Backend core Rust (PTY/ConPTY, stealth, commands) + testes | ✅ **Finalizada** |
| **FASE 2.2** | Frontend core (terminal, botão flutuante, painel, seletor de pasta) + testes | ✅ **Finalizada** |
| **FASE 2.3** | Produtividade (paleta, snippets, histórico, perfis, autocomplete, cheat sheet, quick actions) + testes | ✅ **Finalizada** |
| **FASE 2.4** | Janela/stealth (atalho global, boss key, opacidade, temas) + testes | ✅ **Finalizada** |
| **FASE 2.5** | Sessões (abas, split, busca, log, notificação, processos, ambiente) + testes | ✅ **Finalizada** |
| **FASE 2.6** | Empacotamento no-admin (NSIS currentUser) + portátil | ✅ **Finalizada** |

> **Gate de cada fase:** só avança com **testes unitários 100% verdes** e lógica sem erro. Ao concluir: README atualizado + commit + push.

---

## Stack

- **Shell desktop:** Tauri `2.11.3` (per-user sem admin, multi-janela, always-on-top, Win32 via Rust)
- **Frontend:** React `19.2.7` + Vite `7.x` + TypeScript `6.x` (strict, zero `any`) + Tailwind CSS `4.3.1`
- **Terminal:** `@xterm/xterm` `6.0.0` (+ addons fit/web-links/search)
- **PTY (Rust):** `portable-pty` `0.9.0` (ConPTY)
- **Stealth (Rust):** crate `windows` `0.62` — `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)`
- **Persistência:** JSON em `%LOCALAPPDATA%/com.mchiodi.specter/`

## Estrutura

```
docs/        US.md · ARQUITETURA.md (fonte de verdade da implementação)
src/         frontend React (component-per-folder)
src-tauri/   backend Rust (pty/ windows/ capture/ commands/ persistence/ …)
```

## Produtividade (FASE 2.3)

Módulos em `src/components/`, persistidos via `src/store/persist.ts` (JSON na store per-user):

| Módulo | US | O que faz |
|--------|----|-----------|
| `CommandPalette/` | US-06 | Paleta de pré-comandos categorizada, busca textual, CRUD; clique insere ou executa (por `mode`). |
| `History/` | US-08 | Histórico de comandos (cwd + timestamp), busca, reexecução, limpar total/por entrada. |
| `Snippets/` | US-09 | Snippets/favoritos com rótulo, categoria e modo; placeholders `{nome}` preenchidos antes de acionar. |
| `Profiles/` | US-12 | Perfis de projeto (nome + path + comandos de init + `.env` opcional); `onOpen` abre a sessão pronta. |
| `Autocomplete/` | US-24 | Sugestões por prefixo a partir de histórico/snippets, navegáveis por teclado. |
| `CheatSheet/` | US-25 | Cheat sheet do Claude Code, categorizado e pesquisável, com copiar/inserir. |
| `QuickActions/` | US-26 | Ações sobre o cwd (Explorer, VS Code, copiar path), desabilitadas com tooltip quando a dependência falta. |

## Instalação e uso (sem admin)

Dois formatos, **nenhum exige administrador** (US-05):

1. **Instalador per-user (NSIS):** execute `Specter_0.1.0_x64-setup.exe`. Instala em `%LOCALAPPDATA%`, registra em HKCU, sem UAC nem PATH global.
2. **Portátil:** copie `src-tauri/target/release/specter.exe` para qualquer pasta e execute. Não instala nada (depende do WebView2, já presente no Windows 10+/11).

### Build local

```pwsh
pnpm install          # dependências do front
pnpm test             # testes do front (Vitest)
cargo test --manifest-path src-tauri/Cargo.toml   # testes do backend
pnpm tauri dev        # desenvolvimento
pnpm tauri build      # gera o instalador NSIS + o exe portátil
```

Artefatos do build em `src-tauri/target/release/` (exe portátil) e
`src-tauri/target/release/bundle/nsis/` (instalador).

## Documentação

- [`docs/US.md`](docs/US.md) — 29 user stories (7 core + 22 extras) com critérios de aceite.
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — decisões técnicas, versões, fluxos, riscos, rastreabilidade.

---

**MChiodi** · dark glassmorphism · accent `#FF5555`
