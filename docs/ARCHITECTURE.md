# GitCortex Studio â Architecture

This document describes the product architecture of GitCortex Studio and how it relates to the Code-OSS (Visual Studio Code) engine it is built upon.

## 1. Design principles

1. **Preserve the editing core.** Monaco, the extension host, terminal, debugger, and SCM are inherited unchanged from Code-OSS. We never fork-and-cripple.
2. **Transform the product layer, not the engine.** Rebranding, new views, and the AI pipeline live in a thin, well-defined product layer on top of the engine.
3. **Keep upstream sync possible.** The Code-OSS base is imported as a versioned snapshot so security and feature updates can flow in.
4. **AI is a first-class citizen.** The agent pipeline is wired into the workbench as a platform service, not an afterthought extension.

## 2. Layered architecture

```
ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
â  PRODUCT LAYER  â  GitCortex Studio                     â
â  ââââââââââââââ ââââââââââââââ ââââââââââââââââââââââââ â
â  â Branding   â â New UI     â â GitCortex AI Agent   â â
â  â product.jsonâ â Projects,  â â UserâAIâProjectâ     â â
â  â themes,    â â Cloud, AI, â â FilesâTerminalâ      â â
â  â splash     â â Marketplaceâ â TestsâDeploy         â â
â  ââââââââââââââ ââââââââââââââ ââââââââââââââââââââââââ â
ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â  EXTENSION LAYER  â  GitCortex Extension Platform        â
â  gitcortex-ai Â· gitcortex-theme Â· gitcortex-tools       â
â  + compatibility with existing VS Code extensions        â
ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ¤
â  ENGINE LAYER  â  Code-OSS (microsoft/vscode)           â
â  Workbench Â· Monaco Editor Â· Terminal Â· Debugger Â· SCM   â
â  Services Â· Extension Host Â· Build system                â
ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
```

### 2.1 Engine layer (inherited, unmodified)

The Code-OSS engine provides:

- **Monaco Editor** â diff editor, multi-cursor, language services, IntelliSense.
- **Workbench** â activity bar, sidebar, panel, status bar, command palette.
- **Integrated terminal** â xterm.js + node-pty.
- **Debugger** â Debug Adapter Protocol (DAP) implementation.
- **Source control** â Git SCM provider + pluggable SCM model.
- **Extension host** â the full extension API surface (`vscode` namespace).
- **Services** â `IInstantiationService`, `IFileService`, `IEditorService`, `ITerminalService`, `IConfigurationService`, etc.
- **Build system** â gulp tasks, esbuild bundling, electron-builder packaging.

### 2.2 Extension layer (GitCortex Extension Platform)

Three first-party extensions ship with GitCortex Studio:

| Extension | Purpose |
|-----------|---------|
| `gitcortex-ai` | The AI agent host: chat UI, agent loop, tool calling, project/context access. |
| `gitcortex-theme` | The GitCortex theme family (dark + light). |
| `gitcortex-tools` | Developer tooling: project scaffolding, cloud workspace glue, deploy helpers. |

All three target the standard `vscode` extension API so they remain compatible with the wider extension ecosystem. A future `gitcortex-marketplace` service will provide a curated marketplace.

### 2.3 Product layer (GitCortex-specific)

- **Branding** â `product/product.json`, application name, icons, splash, default themes, window titles.
- **New UI** â developer-facing views (Projects, GitCortex AI, Cloud Workspace, Extensions, Marketplace, Terminal, Source Control) composed from workbench primitives.
- **AI Agent** â a workbench-integrated service that orchestrates the UserâAIâProjectâFilesâTerminalâTestsâDeploy pipeline.

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
   |
   v
+----------------------------+
| GitCortex AI Orchestrator  |   <- workbench service
+----------------------------+
   |  tools (capabilities)
   +-- Project: open/create/inspect
   +-- Files:   read/write/edit/grep
   +-- Terminal: run commands
   +-- Tests:   run test suites
   +-- Deploy:  trigger deploy flows
   v
LLM backend (pluggable; OpenHands-compatible)
```

The orchestrator is transport-agnostic. The default transport targets an OpenHands-compatible agent runtime so GitCortex can drive real software work.

### 4.4 Native editor integration

GitCortex AI is wired into the existing workbench  no new shell:
- **Activity-bar panel**  the AI conversation/run-log webview.
- **Editor context menu**  Explain Selection, Refactor Selection, Run on File, Generate from Comment, Fix Problems (visible only when relevant, e.g. selection-based entries require `editorHasSelection`).
- **Explorer context menu**  Run on File.
- **Command Palette**  all AI commands under the `GitCortex AI` category.
- **Keybindings**  `Ctrl/Cmd+Shift+G` (open AI), `+G E` (explain), `+G R` (refactor).

The selection/diagnostics are attached to the prompt, so a live model endpoint can act immediately without the user re-pasting context.

### 4.5 Extension marketplace (Open VSX)

The engine's built-in Extensions view is enabled by setting `product.json`'s
`extensionsGallery` field to **Open VSX** (`https://open-vsx.org/vscode/gallery`)
via `build/gitcortex/brand.ts`. Open VSX serves VSIX packages in the same
format as the Microsoft marketplace, so existing VS Code extensions install
and run unchanged  keeping GitCortex Studio open-source and license-clean.

The `gitcortex-marketplace` extension contributes a curated activity-bar entry
that delegates to the engine's own `workbench.extensions.*` commands, so the
browsing/install UX stays the familiar VS Code one.

## 5. Build system

GitCortex wraps the Code-OSS build in a thin layer under `build/`:

- `build/gitcortex/install.ts` â dependency install wrapper.
- `build/gitcortex/compile.ts` â workbench + extensions compile.
- `build/gitcortex/package.ts` â electron packaging with GitCortex branding.
- `build/gitcortex/launch.ts` â launch the dev build.

Top-level npm scripts (`yarn install`, `yarn compile`, `yarn launch`) delegate to these.

## 6. What we intentionally do not change

- The `vscode` extension API namespace and its stability guarantees.
- The DAP and LSP protocol implementations.
- The Monaco editor core.
- The terminal front-end (xterm.js).

Changing these would break compatibility and is explicitly out of scope. We build *on* them.
