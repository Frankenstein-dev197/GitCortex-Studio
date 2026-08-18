# Code-OSS (VS Code) — Architecture Analysis

This is the verified analysis of the Code-OSS engine (microsoft/vscode) that GitCortex Studio is built upon. It was produced by inspecting the real source tree (pinned at `2c314930`, package `code-oss-dev` v1.135.0).

It exists to make every GitCortex transformation decision evidence-based rather than guessed.

## 1. Identity surface (what we rebrand)

`product.json` at the repo root is the identity source of truth. Key fields and their Code-OSS values (to be replaced — see `docs/BRANDING.md`):

| Field | Code-OSS value | GitCortex target |
|-------|----------------|------------------|
| `nameShort` | `Code - OSS` | `GitCortex` |
| `nameLong` | `Code - OSS` | `GitCortex Studio` |
| `applicationName` | `code-oss` | `GitCortex Studio` |
| `dataFolderName` | `.vscode-oss` | `GitCortexStudio` |
| `sharedDataFolderName` | `.vscode-oss-shared` | `GitCortexStudio-Shared` |
| `serverApplicationName` | `code-server-oss` | `gitcortex-server` |
| `tunnelApplicationName` | `code-tunnel-oss` | `gitcortex-tunnel` |
| `win32DirName` | `Microsoft Code OSS` | `GitCortex Studio` |
| `linuxIconName` | `code-oss` | `gitcortex-studio` |
| `darwinBundleIdentifier` | `com.visualstudio.code.oss` | `studio.gitcortex` |
| `urlProtocol` | `code-oss` | `gitcortex` |
| `win32AppUserModelId` | `Microsoft.CodeOSS` | `studio.gitcortex` |
| `win32MutexName` | `vscodeoss` | `gitcortexstudiostable` |

### How `product.json` reaches the app
- `src/vs/platform/product/common/product.ts` resolves `product` from one of: the sandbox preload configuration, the `_VSCODE_PRODUCT_JSON` global, or the bundled `product.json` file.
- `src/vs/platform/product/common/productService.ts` exposes it via `IProductService extends Readonly<IProductConfiguration>`.
- Conclusion: **replacing `product.json` (and the build-time injection of `_VSCODE_PRODUCT_JSON`) is the primary, supported branding seam.** No monkey-patching of internal classes is required for identity.

## 2. Top-level layout

```
src/
├── vs/
│   ├── base/        ← primitives: codicons, async, buffers, cancellation, dom, …
│   ├── platform/   ← cross-cutting platform services (DI-injected)
│   ├── editor/      ← Monaco editor + language-features
│   ├── workbench/   ← the IDE shell (activity bar, sidebar, panel, status)
│   ├── code/        ← process entry points
│   ├── server/      ← remote/server
│   ├── sessions/    ← multi-window sessions
│   └── monaco.d.ts  ← public editor API surface
├── vscode-dts/      ← the public `vscode` extension API typings
build/              ← gulp build pipeline, esbuild/rspack/vite, packaging
extensions/         ← 106 built-in extensions (languages, git, chat, mcp, …)
resources/          ← icons, codicons, media
remote/             ← remote server assets
cli/                ← the `code` CLI (Rust)
gulpfile.mjs → build/gulpfile.ts
```

## 3. Layered architecture (verified)

The codebase is strictly layered:

```
base  →  platform  →  editor  →  workbench
                 ↘            ↗
                   code (process entry)
```

- **base** (`src/vs/base`): framework primitives (codicons, async, lifecycle, dom, process, errors, event). No product knowledge.
- **platform** (`src/vs/platform`): ~100 service areas, each exposing `createDecorator<XxxService>('xxxService')` and consumed through **dependency injection**. Examples: `instantiation`, `product`, `configuration`, `files`, `commands`, `editor`, `terminal`, `debug`, `extensions`, `agentHost`, `chat`, `mcp`, `telemetry`, `log`, `lifecycle`.
- **editor** (`src/vs/editor`): Monaco. `editor.api.ts` exports the public `monaco` API; `editor.all.ts` aggregates contribs.
- **workbench** (`src/vs/workbench`): the IDE shell. `workbench.desktop.main.ts` / `workbench.web.main.ts` are the entry aggregates.
- **code** (`src/vs/code`): process entry points — `electron-main` (`app.ts`, `main.ts`), `electron-browser`, `electron-utility`, `node`, `browser`.

## 4. Workbench internals

### 4.1 `src/vs/workbench/` top level
- `browser/` — `workbench.ts` (the shell), `layout.ts`, `part.ts`, `panecomposite.ts`, `editor.ts`.
- `contrib/` — ~80 feature areas (one folder each). Each is a self-contained contribution bundle.
- `services/` — workbench-level services (composite services above platform services).
- `api/` — the workbench-side extension API implementation.
- `electron-browser/`, `common/`, `test/`.

### 4.2 Notable `contrib` areas (relevant to GitCortex)
- `chat` — the chat surface (inline chat, chat view, code organization).
- `mcp` — Model Context Protocol client integration.
- `terminal` / `terminalContrib` — integrated terminal (xterm.js).
- `debug` — DAP debugger UI.
- `scm` / `git` — source control + Git provider.
- `splash` — splash/loading screen (a branding touchpoint).
- `welcomeGettingStarted`, `welcomeWalkthrough`, `welcomeOnboarding`, `welcomeBanner` — welcome/onboarding (branding touchpoints).
- `extensions` — built-in extensions view UI.
- `notebook`, `testing`, `tasks`, `search`, `markers`, `outline`, `timeline`.

### 4.3 Notable `services` and `platform` areas
- `agentHost` (both in `platform` and `workbench/services`) — **the local Agent Host Protocol (AHP)** runtime. See §6.
- `chat`, `mcp` — chat + MCP platform services.
- `extensions`, `extensionManagement`, `extensionRecommendations` — extension host + gallery.
- `layout`, `panecomposite`, `view` (via `panecomposite`) — the view/container model the new GitCortex UI builds on.
- `editor`, `files`, `terminal`, `configuration`, `command`, `notification`, `statusbar`, `activitybar` (in `browser/parts`).

## 5. Build system (verified)

- **Package manager:** yarn/npm; root `package.json` (`code-oss-dev`, private, `main: ./out/main.js`).
- **Build orchestration:** `gulpfile.mjs` → `build/gulpfile.ts` and the `build/gulpfile.*.ts` family (`.compile`, `.editor`, `.extensions`, `.reh`, `.vscode.linux/win32`, `.vscode.web`).
- **Bundlers:** esbuild (primary, `build/lib/esbuild`), plus rspack and vite in `build/`.
- **Electron:** `@vscode/gulp-electron` + `electron` + `@vscode/test-electron`; `build/lib/electron.ts` resolves the Electron version.
- **TypeScript:** `typescript` + `@typescript/native`; multiple `tsconfig.json` (monaco, vscode-dts, tsec).
- **Test:** `mocha` + `@playwright/test`; `test-browser`, `test-node`, `test-extension`, smoke tests.
- **Key scripts:** `compile` → `compile-client` (`gulp compile`) + `compile-copilot`; `compile-web`; `build-fast` (next-gen); `compile-build` (mangled production); `compile-extensions-build`; `electron`; `monaco-compile-check`.

## 6. The Agent Host — the engine's own AI runtime (verified)

This is the most important finding for GitCortex AI. Code-OSS already ships a **local agent runtime**:

- `src/vs/platform/agentHost/` — platform layer (node, common, browser, electron-main, electron-browser).
- `src/vs/workbench/services/agentHost/` — workbench layer.
- Documents in `src/vs/platform/agentHost/`:
  - `AGENTS.md` — the multi-chat architecture spec. Defines an **orchestrator** that owns session/catalog/persistence and drives every agent harness through a uniform chat-surface seam.
  - `LOCAL_ENDPOINT.md` — the discoverable local endpoint: a WebSocket server on a Unix domain socket (macOS/Linux) or named pipe (Windows), registered under `<userDataPath>/agent-host/local-endpoint/entries/<identity>.json`.
  - `OTEL.md` — OpenTelemetry instrumentation for the agent host.
- Agent harnesses present: **Codex**, **Claude**, **Copilot** (`node/codex/codexAgent.ts`, `node/claude/claudeAgent.ts`, `node/copilot/copilotAgent.ts`), unified through the orchestrator path (`node/agentService.ts`, `node/agentHostStateManager.ts`, `node/agentSideEffects.ts`).
- Core interfaces (`common/agent.ts`): `IAgent`, `IAgentChats`, `IAgentCapabilities`; (`common/agentService.ts`): `IAgentService`, `IAgentConnection`.
- `product.json` carries `agentsTelemetryAppName: "agents"` and a `defaultChatAgent` block (currently GitHub Copilot).

### Implication for GitCortex AI
GitCortex does **not** need to invent an agent runtime from scratch. The correct, minimal-surfaces integration is:

1. Re-point `product.json`'s agent configuration to GitCortex's own transport (default: OpenHands-compatible).
2. Provide a `gitcortex-ai` agent harness that implements `IAgent` / `IAgentCapabilities` and plugs into the existing orchestrator.
3. Expose GitCortex-specific tools (project/files/terminal/tests/deploy) to the orchestrator's tool-calling path — alongside or via the existing `mcp` integration.
4. Use the local Agent Host endpoint so external agent runtimes (e.g. an OpenHands instance) can attach and drive GitCortex.

This keeps us on the engine's supported AI seam and makes "GitCortex drives real software work" a thin harness rather than a parallel runtime.

## 7. Extension model

- The public API surface is `vscode-dts` (`src/vscode-dts`), exposed to extensions as the `vscode` namespace.
- `workbench/api/` implements that API for the desktop and web workbench.
- The extension host process runs extensions; `platform/extensions` + `workbench/services/extensions` manage lifecycle, activation, and the gallery.
- `product.json.extensionsGallery` configures the marketplace service URL. GitCortex ships its own (initially local/curated) marketplace config.

## 8. Transformation strategy (decided)

Based on the above, GitCortex transformations are scoped to:

| Goal | Mechanism |
|------|----------|
| Identity | Replace `product.json`; inject via build `_VSCODE_PRODUCT_JSON`. |
| Themes | Ship `gitcortex-theme` extension contributing color themes. |
| Splash / welcome / window title | Focused patches applied at build time to `contrib/splash`, welcome contribs, electron-main title logic. |
| New dev-facing views | First-party extensions contributing views/commands/menus (Projects, Cloud Workspace, Marketplace, GitCortex AI). |
| AI agent | `gitcortex-ai` harness on the engine's `agentHost` orchestrator + MCP tool surface; default transport OpenHands-compatible. |
| Extension compatibility | Preserve the `vscode` API and gallery plumbing unchanged. |

Everything above avoids forking internal classes and keeps upstream sync a clean rebase.
