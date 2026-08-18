# GitCortex AI Agent

GitCortex AI is the built-in agent that turns GitCortex Studio from an editor into an AI-driven development environment. It can plan, edit, run, test, and deploy software on behalf of the developer.

## 1. Pipeline

```
User
  │
  ▼
GitCortex AI (orchestrator)
  │
  ▼
Project   ── open / create / inspect
  │
  ▼
Files     ── read / write / edit / search
  │
  ▼
Terminal  ── run commands, build, install
  │
  ▼
Tests     ── run test suites, parse results
  │
  ▼
Deploy    ── trigger deployment flows
```

Each stage is exposed to the agent as a **tool** (capability). The orchestrator decides which tool to call, in what order, to satisfy a high-level user request.

## 2. Architecture

```
┌───────────────────────────────────────────────────────┐
│ Workbench UI                                          │
│  ┌──────────────────────────────────────────────┐    │
│  │ GitCortex AI Panel (chat, plan, run log)     │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────┬─────────────────────────────────┘
                      │
            ┌─────────▼─────────┐
            │ AIOrchestrator   │  (workbench service)
            │  - plan          │
            │  - act (tools)   │
            │  - observe       │
            │  - reflect       │
            └─────────┬────────┘
                      │  tool calls
   ┌──────────────────┼──────────────────┐
   ▼                  ▼                  ▼
ProjectTools       FileTools         TerminalTools
(open, list,        (read, write,      (run, install,
 inspect)           edit, grep)        build)
   │                  │                  │
   ▼                  ▼                  ▼
TestTools                              DeployTools
(run, parse)                           (deploy flows)
                      │
                      ▼
            ┌─────────▼─────────┐
            │ LLM Transport     │  (pluggable)
            │  - OpenHands       │  ← default
            │  - generic OpenAI  │
            └───────────────────┘
```

## 3. Core abstractions

### 3.1 `AIOrchestrator`
The workbench-level service that owns the agent loop:
1. **Plan** — decompose the user request into steps.
2. **Act** — invoke tools to make changes.
3. **Observe** — read tool results and system state.
4. **Reflect** — decide next step or finish.

It is the single place that mediates between the chat UI and the tools.

### 3.2 Tools (capabilities)
Each tool is a typed, permissioned function the agent can call:

| Tool | Inputs | Effect |
|------|--------|--------|
| `project.open` | path | Opens a workspace in GitCortex |
| `project.create` | name, template | Scaffolds a new project |
| `file.read` | path | Returns file content |
| `file.write` | path, content | Writes a file |
| `file.edit` | path, diff | Applies a structured edit |
| `file.search` | query | Returns matches |
| `terminal.run` | command | Runs a command in the integrated terminal |
| `tests.run` | selector | Runs tests, returns parsed results |
| `deploy.run` | target | Triggers a deploy flow |

Every tool call is auditable and shown in the AI run log, so the developer stays in control.

### 3.3 LLM transport
The transport is pluggable. The default transport is **OpenHands-compatible**: GitCortex can delegate real software work to an OpenHands-style agent runtime. A generic OpenAI-compatible transport is also available for lighter-weight assistance.

Configuration lives in `product/product.json` under `gitcortex.ai`, allowing per-installation endpoints and credentials without code changes.

## 4. Safety model

- **Permissioned execution.** Destructive tools (`file.write`, `terminal.run`, `deploy.run`) require user confirmation by default. The user can grant per-session or per-project autonomy.
- **Auditability.** Every tool call and its result is recorded in the run log and reviewable.
- **Reversibility.** File edits go through the editor's undo stack and Git, so agent changes are reviewable and revertable.
- **Sandboxing.** Terminal tool runs in the project workspace; network egress for the agent is configurable.

## 5. OpenHands integration

GitCortex AI is designed to be OpenHands-compatible:

- The orchestrator's transport can speak to an OpenHands agent runtime.
- The tool surface mirrors the categories OpenHands agents use (file ops, terminal, tests, deploy), so an OpenHands agent can drive GitCortex directly.
- The chat UI surfaces OpenHands agent steps (plan/act/observe/reflect) as a readable timeline.

This makes GitCortex Studio a first-class front-end for agent-driven development.

## 6. Extension surface

The `gitcortex-ai` extension provides:
- The chat / run-log panel UI.
- The orchestrator host implementation.
- Tool registrations consumed by the orchestrator.
- A public API (`gitcortex.ai`) for other extensions to register custom tools or transports.

Registering a custom tool:

```ts
import * as vscode from 'vscode';
import { ai } from 'gitcortex-ai';

export function activate(ctx: vscode.ExtensionContext) {
  ai.registerTool({
    name: 'mytool.do',
    description: 'Does the thing',
    parameters: { value: { type: 'string' } },
    handler: async (args) => ({ ok: true, value: args.value }),
  });
}
```
