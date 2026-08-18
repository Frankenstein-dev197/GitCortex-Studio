# Changelog

All notable changes to GitCortex Studio are documented here. The format is based
on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Pending
- Full Electron GUI build validation (CI, not sandbox).
- First published release artifacts.

## [0.1.0] — 2026-08-18

First public foundational release of GitCortex Studio — a rebranded,
AI-native Code-OSS fork that **preserves the VS Code Workbench** and layers a
proprietary product on top via the standard extension contribution model and
`product.json` config. No engine classes are patched.

### Added — Branding & product layer
- `build/gitcortex/brand.ts`: idempotent branding engine (27 patches) —
  application name/ID, data dir, data directory name, default extensions,
  source strings, and JSON merges for fields absent upstream.
- `extensionsGallery` → **Open VSX** so existing VS Code extensions install
  unchanged (license-clean).
- `onboardingThemes` → GitCortex Dark/Light surface in the first-run picker.
- `gitcortex/` product layer doc; `docs/ARCHITECTURE.md` §4.4 (native editor
  integration) and §4.5 (Open VSX marketplace).

### Added — GitCortex AI (native editor integration)
- Activity-bar chat panel (conversation + run log webview).
- Editor context menu: Explain / Refactor Selection, Run on File, Generate
  from Comment, Fix Problems (gated by `editorHasSelection`/`editorIsOpen`).
- Explorer context menu + editor title bar entry.
- Command Palette entries; keybindings (`Ctrl/Cmd+Shift+G`, `…+G E`, `…+G R`).
- Selection/diagnostics auto-attached to the prompt.
- **Native Agent Host Protocol (AHP) transport** (default): discovers the
  engine's own agent host endpoint in the local registry, connects over
  WebSocket with the connection token, performs the AHP `initialize`
  handshake (`protocolVersions: ["0.8.0"]`), creates a session, and dispatches
  the user message — the engine runs the real agent (model, tools, terminal,
  file system). Falls back to a local planner when no endpoint is discoverable.
- 7 built-in tools: `project.open`, `file.read`, `file.write`, `file.search`,
  `terminal.run`, `tests.run`, `deploy.run`.
- Pluggable transports: `ahp` (native, default), `openhands`, `openai-compatible`.
- Public `gitcortex.ai` API for other extensions to register custom tools.

### Added — Extension platform
- `extensions/gitcortex-ai` — AI agent (above).
- `extensions/gitcortex-theme` — GitCortex Dark & Light themes.
- `extensions/gitcortex-tools` — Projects + Cloud Workspace views, deploy helper.
- `extensions/gitcortex-marketplace` — curated activity-bar entry delegating to
  the engine's own `workbench.extensions.*` commands (familiar VS Code UX).

### Engine base
- Code-OSS (`microsoft/vscode`) imported as a versioned snapshot under
  `code-oss/` so upstream security/feature updates can flow in. The Workbench,
  Monaco, terminal, debugger, and SCM are inherited unchanged.

### Known limitations
- The full Electron GUI build is not validated in this release (requires a
  display + ~30–60 min native compile). Headless gate passes: TypeScript
  compilation, AI agent smoke test (12 steps), branding dry-run (idempotent).

[Unreleased]: https://github.com/Frankenstein-dev197/GitCortex-Studio/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Frankenstein-dev197/GitCortex-Studio/releases/tag/v0.1.0
