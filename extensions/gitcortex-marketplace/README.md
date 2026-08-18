# GitCortex Marketplace

A curated entry surface into extension discovery for GitCortex Studio. Backed by
the engine's built-in **Extensions** view, which `build/gitcortex/brand.ts`
configures to point at [Open VSX](https://open-vsx.org) via `product.json`'s
`extensionsGallery` field.

## Why Open VSX

Open VSX serves VSIX packages in the same format as the Microsoft marketplace,
so existing VS Code extensions install and run unchanged. This keeps GitCortex
Studio open-source and license-clean (the Microsoft marketplace is restricted
to official VS Code builds).

## Commands

| Command | Effect |
|---------|--------|
| `GitCortex Marketplace: Browse Extensions` | Opens the engine Extensions view with a search. |
| `Install GitCortex AI / Tools / Theme` | Opens the first-party extension detail page. |

These delegate to the engine's own marketplace commands (`workbench.extensions.*`)
so the browsing/install UX stays the familiar VS Code one — no UI reinvention.
