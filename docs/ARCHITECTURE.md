# GitCortex Studio — Architecture

This document describes the product architecture of GitCortex Studio and how it relates to the Code-OSS (Visual Studio Code) engine it is built upon.

## 1. Design principles

1. **Preserve the editing core.** Monaco, the extension host, terminal, debugger, and SCM are inherited unchanged from Code-OSS. We never fork-and-cripple.
2. **Transform the product layer, not the engine.** Rebranding, new views, and the AI pipeline live in a thin, well-defined product layer on top of the engine.
3. **Keep upstream sync possible.** The Code-OSS base is imported as a versioned snapshot so security and feature updates can flow in.
4. **AI is a first-class citizen.** The agent pipeline is wired into the workbench as a platform service, not an afterthought extension.

## 2. Layered architecture

```
┌──────────────────────────────────────────────────────────┐
│  PRODUCT LAYER  —  GitCortex Studio                     │
│  ┌────────────┐ ┌────────────┐ ┌──────────────────────┐ │
│  │ Branding   │ │ New UI     │ │ GitCortex AI Agent   │ │
│  │ product.json│ │ Projects,  │ │ User→AI→Project→     │ │
│  │ themes,    │ │ Cloud, AI, │ │ Files→Terminal→      │ │
│  │ splash     │ │ Marketplace│ │ Tests→Deploy         │ │
│  └────────────┘ └────────────┘ └──────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│  EXTENSION LAYER  —  GitCortex Extension Platform        │
│  gitcortex-ai · gitcortex-theme · gitcortex-tools       │
│  + compatibility with existing VS Code extensions        │
├──────────────────────────────────────────────────────────┤
│  ENGINE LAYER  —  Code-OSS (microsoft/vscode)           │
│  Workbench · Monaco Editor · Terminal · Debugger · SCM   │
│  Services · Extension Host · Build system                │
└──────────────────────────────────────────────────────────┘
```

### 2.1 Engine layer (inherited, unmodified)

The Code-OSS engine provides:

- **Monaco Editor** — diff editor, multi-cursor, language services, IntelliSense.
- **Workbench** — activity bar, sidebar, panel, status bar, command palette.
- **Integrated terminal** — xterm.js + node-pty.
- **Debugger** — Debug Adapter Protocol (DAP) implementation.
- **Source control** — Git SCM provider + pluggable SCM model.
- **Extension host** — the full extension API surface (`vscode` namespace).
- **Services** — `IInstantiationService`, `IFileService`, `IEditorService`, `ITerminalService`, `IConfigurationService`, etc.
- **Build system** — gulp tasks, esbuild bundling, electron-builder packaging.

### 2.2 Extension layer (GitCortex Extension Platform)

Three first-party extensions ship with GitCortex Studio:

| Extension | Purpose |
|-----------|---------|
| `gitcortex-ai` | The AI agent host: chat UI, agent loop, tool calling, project/context access. |
| `gitcortex-theme` | The GitCortex theme family (dark + light). |
| `gitcortex-tools` | Developer tooling: project scaffolding, cloud workspace glue, deploy helpers. |

All three target the standard `vscode` extension API so they remain compatible with the wider extension ecosystem. A future `gitcortex-marketplace` service will provide a curated marketplace.

### 2.3 Product layer (GitCortex-specific)

- **Branding** — `product/product.json`, application name, icons, splash, default themes, window titles.
- **New UI** — developer-facing views (Projects, GitCortex AI, Cloud Workspace, Extensions, Marketplace, Terminal, Source Control) composed from workbench primitives.
- **AI Agent** — a workbench-integrated service that orchestrates the User→AI→Project→Files→Terminal→Tests→Deploy pipeline.

## 3. Code-OSS import & sync model

The engine is imported as a **versioned upstream snapshot** rather than a live submodule pointing at `microsoft/vscode` main. This keeps the build reproducible and lets us rebase upstream updates deliberately.

- The Code-OSS source lives under a `code-oss/` subtree (imported via the procedure in `CODE-OSS-UPSTREAM.md`).
- GitCortex product code (`src/`, `extensions/`, `product/`, `resources/`) sits alongside it and is the only tree we edit freely.
- A `patches/` directory carries focused modifications to upstream files (e.g. product name, default theme) applied by the build, so the upstream tree stays close to pristine and syncs stay clean.

## 4. Key subsystems

### 4.1 Product configuration
`product/product.json` is the single source of truth for: application name, application ID, data directory name, default extensions, branding URLs, and the AI agent configuration endpoint.

### 4.2 Workbench integration points
GitCortex product code hooks into the engine through stable, well-documented seams:
- **Contributions** via `package.json` `contributes` (views, commands, menus, themes).
- **Services** consumed through dependency injection (`IEditorService`, `ITerminalService`, `ISCMService`).
- **Commands** registered on startup.

This keeps us on the supported extension API surface rather than monkey-patching internal classes.

### 4.3 GitCortex AI Agent
See [`AI_AGENT.md`](./AI_AGENT.md) for the full design. Summary:

```
User input
   │
   ▼
┌───────────────────────────┐
│ GitCortex AI Orchestrator│   ← workbench service
└───────────────────────────┘
   │  tools (capabilities)
   ├─ Project: open/create/inspect
   ├─ Files:   read/write/edit/grep
   ├─ Terminal: run commands
   ├─ Tests:   run test suites
   └─ Deploy:  trigger deploy flows
   ▼
LLM backend (pluggable; OpenHands-compatible)
```

The orchestrator is transport-agnostic. The default transport targets an OpenHands-compatible agent runtime so GitCortex can drive real software work.

## 5. Build system

GitCortex wraps the Code-OSS build in a thin layer under `build/`:

- `build/gitcortex/install.ts` — dependency install wrapper.
- `build/gitcortex/compile.ts` — workbench + extensions compile.
- `build/gitcortex/package.ts` — electron packaging with GitCortex branding.
- `build/gitcortex/launch.ts` — launch the dev build.

Top-level npm scripts (`yarn install`, `yarn compile`, `yarn launch`) delegate to these.

## 6. What we intentionally do not change

- The `vscode` extension API namespace and its stability guarantees.
- The DAP and LSP protocol implementations.
- The Monaco editor core.
- The terminal front-end (xterm.js).

Changing these would break compatibility and is explicitly out of scope. We build *on* them.
