# Contributing to GitCortex Studio

Thanks for contributing to GitCortex Studio! This guide keeps the project professional and the engine sync clean.

## 1. Repository etiquette

- Work on feature branches off `main`; never push directly to `main`.
- Open a pull request for review.
- Keep commits focused and write clear commit messages.
- Do not commit generated artifacts (`out/`, `dist/`, `*.vsix`, `node_modules/`).

## 2. The Code-OSS engine is a snapshot

- The `code-oss/` tree is an imported upstream snapshot. **Do not edit it directly.**
- Changes to upstream behavior go through `patches/` and are applied by `yarn gitcortex:brand`.
- Our product code lives in `src/`, `extensions/`, `product/`, `resources/`.

## 3. Where to put changes

| Change | Location |
|--------|---------|
| Branding, identity, product metadata | `product/product.json`, `patches/` |
| New developer UI / views | `src/workbench/` or a contribution in an extension `package.json` |
| AI agent behavior | `extensions/gitcortex-ai/` |
| Theme colors | `extensions/gitcortex-theme/` |
| Developer tools | `extensions/gitcortex-tools/` |
| Build scripts | `build/gitcortex/` |

## 4. Extension contributions

Prefer the standard `vscode` extension contribution model (`package.json` `contributes`: views, commands, menus, themes) over modifying internal engine classes. This keeps compatibility with the broader extension ecosystem and keeps upstream sync trivial.

## 5. Before you submit

- `yarn install`
- `yarn compile`
- `yarn test` (where applicable, per extension)
- Ensure no user-facing string reads "Visual Studio Code" — it should always be GitCortex Studio.

## 6. Commit message format

```
<area>: <imperative summary>

<body explaining why, not what>
```

Areas: `brand`, `ui`, `ai`, `theme`, `tools`, `build`, `docs`.

## 7. Code style

Follow the TypeScript conventions of the Code-OSS engine (4-space indent, semicolons, trailing commas in multiline). Run the linter before pushing.

## 8. License

By contributing, you agree your contributions are licensed under the project's MIT license.
