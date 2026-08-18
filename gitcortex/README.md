# GitCortex Studio — Product Layer (`gitcortex/`)

The proprietary product layer that sits **on top of** the Code-OSS workbench.
The workbench itself is never modified — all GitCortex value is delivered through
this layer using the engine's standard extension contribution model.

```
GitCortex Studio
       │
       ▼
Code-OSS Workbench (engine, preserved)          ← code-oss/  (pristine snapshot)
       │
       ▼
GitCortex Product Layer                          ← this directory
   ├── extensions/   (shipped as built-in extensions)
   │     ├── gitcortex-ai/      AI agent + editor integration
   │     ├── gitcortex-theme/   GitCortex identity themes
   │     ├── gitcortex-tools/   Projects / Cloud / Marketplace views
   │     └── gitcortex-marketplace/  curated GitCortex marketplace
   ├── product/       (canonical product.json overrides)
   ├── resources/     (logos, splash, themes, icons)
   └── build/         (brand.ts patcher, build.ts, import-upstream.sh)
```

## Why a separate layer

1. **Preserves the engine.** `code-oss/` stays a clean, upstream-syncable
   snapshot. We never hand-edit it; branding and configuration flow through
   `build/gitcortex/brand.ts` applied at build time.
2. **Standard contribution model.** Everything GitCortex adds — views,
   commands, themes, the AI panel — is expressed through `package.json`
   contribution points the workbench already understands. No internal class
   patching, no fork divergence on the workbench surface.
3. **Engine-native AI seam.** The engine already ships an Agent Host Protocol
   (AHP). GitCortex AI targets that seam rather than reinventing an agent
   runtime (see `docs/AI_AGENT.md`).

## Configuration seams (product.json, applied by `brand.ts`)

| Field | Purpose |
|-------|---------|
| `nameShort`/`nameLong`/`applicationName`/… | Product identity |
| `extensionsGallery` | Marketplace — Open VSX config (enables the built-in Extensions view) |
| `darwinBundleIdentifier`/`win32AppUserModelId` | OS-level identity |
| `onboardingThemes` | Default GitCortex theme on first run |

See `docs/BRANDING.md` for the full patch list.

## Build

Extensions are authored in TypeScript and compiled to `out/` per-extension.
At full build time, the extension folders are copied into the engine's
extensions directory so the workbench loads them as built-in extensions.
