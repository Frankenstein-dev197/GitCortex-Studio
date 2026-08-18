# GitCortex Studio — Agent Memory

Repository-specific context for AI agents working on GitCortex Studio.

## What this project is
GitCortex Studio is a professional developer IDE built on the Code-OSS (microsoft/vscode) engine. It adds its own identity (branding), a developer-first UI, and a GitCortex AI agent, while preserving the full editing/terminal/debug/extension core of Code-OSS.

## Key facts (verified against real source)
- Code-OSS repo: https://github.com/microsoft/vscode — root `package.json` name is `code-oss-dev`.
- Identity source of truth: `product.json` at upstream root. Loaded via `src/vs/platform/product/common/product.ts` (from `_VSCODE_PRODUCT_JSON` global or sandbox preload) and exposed as `IProductService`.
- Build: yarn + gulp (`gulpfile.mjs` → `build/gulpfile.ts`), esbuild primary, rspack/vite present, electron via `@vscode/gulp-electron`.
- Layers: `src/vs/{base,platform,editor,workbench,code}`. Strict layering base→platform→editor→workbench, with `code` as process entry.
- Agent runtime ALREADY EXISTS in the engine: `src/vs/platform/agentHost/` + `src/vs/workbench/services/agentHost/`. Has an orchestrator, multi-chat architecture, Codex/Claude/Copilot harnesses, and a discoverable local Agent Host Protocol (AHP) WebSocket endpoint. GitCortex AI should plug into this, not reinvent it.
- MCP client exists: `src/vs/workbench/contrib/mcp` + `src/vs/platform/mcp`.
- Splash: `src/vs/workbench/contrib/splash`. Welcome: `welcomeGettingStarted`, `welcomeWalkthrough`, `welcomeOnboarding`, `welcomeBanner`.

## GitCortex conventions
- The `code-oss/` tree is an imported upstream snapshot — DO NOT edit it directly. Branding goes through `patches/` applied by `yarn gitcortex:brand` (build/gitcortex/brand.ts).
- Our product code lives in `src/`, `extensions/`, `product/`, `resources/`. Edit these freely.
- Identity target: nameShort=GitCortex, nameLong=GitCortex Studio, applicationName=gitcortex-studio, dataFolderName=GitCortexStudio, urlProtocol=gitcortex, darwinBundleIdentifier=studio.gitcortex.
- Color palette: bg #0b1120, surface #111a2e, accent #3b82f6, accent2 (AI) #8b5cf6, text #e2e8f0, muted #64748b.
- First-party extensions: `gitcortex-ai`, `gitcortex-theme`, `gitcortex-tools` under `extensions/`.
- Prefer the standard `vscode` extension contribution model (views/commands/menus/themes in package.json) over patching internal engine classes.

## Build reality
- Full Electron build needs Node 20+, Python 3, C++ toolchain, ~30–60+ min, and a display to launch the GUI. In headless CI, gate on TypeScript compile + extension tests + branding patch dry-run.
- The local sandbox (25GB disk, no display) cannot run the full GUI build — be honest about this in docs and commits.

## Branch / commit rules
- Work on branches off `main`; never push directly to `main`.
- Commit message format: `<area>: <imperative summary>` where area ∈ {brand, ui, ai, theme, tools, build, docs}.
- Co-author: openhands <openhands@all-hands.dev>.

## Status (as built)
- DONE: repo bootstrap, engine import (`code-oss/` @ 2c314930), branding engine (`brand.ts`: 25 patches apply, JSON valid), `gitcortex-theme` (Dark+Light), `gitcortex-tools` (Projects/Cloud/Marketplace views + deploy, `tsc` clean), `gitcortex-ai` (orchestrator + 7 tools + pluggable transport + chat webview, `tsc` clean, `test/smoke.ts` passes: 12 steps).
- Auth: push requires `GITHUB_PERSONAL_ACCESS_TOKEN`.
- PENDING: gitcortex-ai → native AHP migration, full engine build validation (sandbox-blocked), marketplace infra, first release.
