# GitCortex Studio — Branding Guide

This document defines how the product identity of GitCortex Studio is applied across the application so that the end user sees **GitCortex Studio** everywhere, not Visual Studio Code.

## 1. Identity

| Field | Value |
|-------|-------|
| Product name | GitCortex Studio |
| Short name | GitCortex |
| Application ID | `studio.gitcortex` |
| Data directory | `GitCortexStudio` |
| Publisher | GitCortex |
| User-facing strings | "GitCortex Studio" (full), "GitCortex" (short, space-constrained) |

## 2. Where branding is applied

### 2.1 Product configuration
`product/product.json` is the canonical branding file consumed at build and runtime:
- `nameApplication` → `GitCortex Studio`
- `applicationName` → `GitCortex Studio`
- `dataFolderName` → `GitCortexStudio`
- `urlProtocol` → `gitcortex://`
- `winMutexName` / `winAppId` → GitCortex identifiers
- Branding URLs (documentation, report-issue, privacy)

### 2.2 Package metadata
`package.json` (root) sets `name`, `displayName`, `description`, and `version` for the GitCortex product. `package.nls.*` files carry localized strings.

### 2.3 Window & UI
- Window title pattern: `«file» — GitCortex Studio` (active file) / `GitCortex Studio` (empty).
- Welcome page header and walkthrough titles use GitCortex Studio branding.
- Activity bar icons and the branding-specific views (Projects, GitCortex AI, Cloud Workspace, Marketplace) come from `resources/icons/`.

### 2.4 Splash & icons
- `resources/logos/gitcortex-logo.svg` — primary logo.
- `resources/logos/gitcortex-icon.png` — taskbar / dock icon (multi-resolution).
- Splash/loading screen uses the GitCortex logo on the GitCortex background color.

### 2.5 Themes
The default color theme is the GitCortex Dark theme shipped by `gitcortex-theme`. The GitCortex color palette:

| Token | Hex | Use |
|-------|-----|-----|
| `cortex.bg` | `#0b1120` | Workbench background |
| `cortex.surface` | `#111a2e` | Panels, sidebar |
| `cortex.accent` | `#3b82f6` | Accent / focus |
| `cortex.accent2` | `#8b5cf6` | Secondary accent (AI) |
| `cortex.text` | `#e2e8f0` | Foreground text |
| `cortex.muted` | `#64748b` | Muted text |
| `cortex.success` | `#22c55e` | Success |
| `cortex.warn` | `#f59e0b` | Warning |
| `cortex.error` | `#ef4444` | Error |

### 2.6 Internal strings
Any user-facing string that previously referenced "Visual Studio Code" / "VS Code" is remapped to "GitCortex Studio" via the patches in `patches/` applied at build time. Source-level strings are intentionally not edited in the upstream tree (kept pristine for sync); instead the build rewrites the compiled output.

## 3. Branding rules

1. Never show "Visual Studio Code" or "Code - OSS" to end users in any user-facing surface.
2. Keep the upstream tree's strings intact upstream (do not edit them in `code-oss/`) — branding is applied at build time so upstream sync stays trivial.
3. Attribution to the VS Code / Code-OSS project remains in `ThirdPartyNotices.txt` and the README acknowledgements — this is license compliance, not product branding.
4. The GitCortex AI surfaces (chat, agent panel) use the `cortex.accent2` purple to distinguish AI-driven UI from regular editor chrome.

## 4. Checklist for "user sees GitCortex everywhere"

- [ ] `product/product.json` carries GitCortex identity.
- [ ] Window title shows GitCortex Studio.
- [ ] Taskbar/dock icon is the GitCortex mark.
- [ ] Welcome page and walkthroughs are branded.
- [ ] Default theme is GitCortex Dark.
- [ ] No user-facing string reads "Visual Studio Code".
- [ ] About dialog shows GitCortex Studio.
- [ ] Documentation site and links point to GitCortex URLs.
