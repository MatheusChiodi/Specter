# Specter

> Terminal flutuante **stealth** + launcher de **Claude Code**. Botão flutuante always-on-top, **invisível em compartilhamento de tela**, roda em PC corporativo ou pessoal **sem admin** (`.exe` per-user + portátil).

Local-first, zero-backend. Tudo roda na máquina.

---

## Status das fases

| Fase | Descrição | Estado |
|------|-----------|--------|
| **FASE 1** | Documentação (`US.md` + `ARQUITETURA.md`) + portão de auditoria | ✅ **Finalizada** |
| **FASE 2.0** | Scaffold (Tauri 2 + React 19 + Vite + TS + Tailwind 4) + setup de testes | ✅ **Finalizada** |
| FASE 2.1 | Backend core Rust (PTY/ConPTY, stealth, janelas, commands) + testes | ⏳ |
| FASE 2.2 | Frontend core (terminal, botão flutuante, painel, seletor de pasta) + testes | ⏳ |
| FASE 2.3 | Produtividade (paleta, snippets, histórico, perfis, cheat sheet…) + testes | ⏳ |
| FASE 2.4 | Janela/stealth (atalho global, boss key, opacidade, temas) + testes | ⏳ |
| FASE 2.5 | Sessões (abas, split, busca, log, notificação, processos, ambiente) + testes | ⏳ |
| FASE 2.6 | Empacotamento no-admin (NSIS currentUser) + portátil | ⏳ |

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

## Documentação

- [`docs/US.md`](docs/US.md) — 29 user stories (7 core + 22 extras) com critérios de aceite.
- [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md) — decisões técnicas, versões, fluxos, riscos, rastreabilidade.

---

**MChiodi** · dark glassmorphism · accent `#FF5555`
