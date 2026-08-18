# GitCortex Studio — Build & Validation

This document describes how to build GitCortex Studio from source.

## 1. Prerequisites

- **Node.js** 20.x or newer (LTS recommended)
- **Python** 3.10+ (for native build scripts and `node-gyp`)
- **Git**
- **C++ toolchain** (`build-essential` / Xcode CLT / MSVC build tools)
- **yarn** (the project uses the Code-OSS yarn-based build)

## 2. Repository layout

```
GitCortex-Studio/
├── code-oss/        # Code-OSS engine snapshot (imported, see CODE-OSS-UPSTREAM.md)
├── product/         # GitCortex product.json
├── resources/       # logos, icons, themes
├── src/             # GitCortex product source
├── extensions/      # gitcortex-ai, gitcortex-theme, gitcortex-tools
├── build/gitcortex/ # build wrappers
└── package.json     # top-level scripts
```

## 3. Build steps

### 3.1 Install dependencies
```bash
yarn install
```
This installs Code-OSS engine dependencies and GitCortex extension dependencies.

### 3.2 Apply branding patches
```bash
yarn gitcortex:brand
```
Applies the focused patches from `patches/` to the Code-OSS tree to install GitCortex branding at build time (the upstream tree stays pristine for sync).

### 3.3 Compile
```bash
yarn compile
```
Compiles the workbench, editor core, and GitCortex extensions.

### 3.4 Launch (dev)
```bash
yarn launch
```
Launches the desktop application from the dev build.

### 3.5 Package (distributable)
```bash
yarn package
```
Produces a distributable Electron build with GitCortex branding (icons, app metadata).

## 4. Validation checklist

A successful build must pass:

- [ ] `yarn install` completes without errors.
- [ ] `yarn compile` produces no compile errors.
- [ ] `yarn launch` opens the GitCortex Studio window.
- [ ] Window title shows "GitCortex Studio".
- [ ] Taskbar/dock icon is the GitCortex mark.
- [ ] Default theme is GitCortex Dark.
- [ ] GitCortex AI view is present in the activity bar.
- [ ] No user-facing string reads "Visual Studio Code".
- [ ] Built-in extensions (`gitcortex-ai`, `gitcortex-theme`, `gitcortex-tools`) load.

## 5. Sandbox / CI notes

In a headless CI environment the Electron GUI cannot render. For such environments, validate with:

- TypeScript compilation (`tsc -p .` on extension projects).
- Extension lint and unit tests (`yarn test` inside each extension).
- Branding patch dry-run to confirm patches apply cleanly to the expected upstream version.

These are the gates that can run without a display; the final visual checklist runs on a developer machine.
