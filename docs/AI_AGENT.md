# GitCortex AI Agent

GitCortex AI is the built-in agent that turns GitCortex Studio from an editor into an AI-driven development environment. It can plan, edit, run, test, and deploy software on behalf of the developer.

> **Status:** foundational implementation landed in `extensions/gitcortex-ai` (orchestrator + tool registry + 7 built-in tools + pluggable transport + chat UI + native editor integration + smoke test). The default transport is now the **native Agent Host Protocol (AHP)** — GitCortex AI talks to the engine's own agent host (the same server that powers the built-in AI), discovered via the local endpoint registry. OpenHands/OpenAI-compatible transports remain available as remote runtimes.

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
            │  - AHP (native)    │  ← default: engine's own agent host
            │  - OpenHands       │  ← remote runtime fallback
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
The transport is pluggable. **The default is now the native Agent Host Protocol (AHP)** — instead of reinventing an agent runtime, GitCortex AI connects to the engine's own agent host. The engine publishes a discoverable WebSocket endpoint in a per-instance registry file (`<userDataPath>/agent-host/local-endpoint/entries/<identity>.json`); the AHP transport enumerates it, opens the socket with the connection token (`?tkn=…`), performs the AHP `initialize` handshake (`protocolVersions: ["0.8.0"]`), creates a session, and dispatches the user message. The engine then runs the real agent (model, tools, terminal, file system) and streams its UI natively.

The AHP transport falls back gracefully to a local planner when no endpoint is discoverable (e.g. the editor's agent host is disabled), so the extension stays useful end-to-end without a live server.

Remote runtimes are still available for non-native deployments: `openhands` (OpenHands-compatible agent runtime) and `openai-compatible` (lighter-weight chat-completions transport).

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

## 7. Implementation map (as built)

| Component | File | Role |
|-----------|------|------|
| Orchestrator | `extensions/gitcortex-ai/src/orchestrator.ts` | Plan→act→observe→reflect loop, bounded to 8 iterations/turn. |
| Tool registry | `extensions/gitcortex-ai/src/toolRegistry.ts` | Definitions + handlers; invoke by name. |
| Built-in tools | `extensions/gitcortex-ai/src/tools.ts` | `project.open`, `file.read`, `file.write`, `file.search`, `terminal.run`, `tests.run`, `deploy.run`. |
| Transport | `extensions/gitcortex-ai/src/transport.ts` + `transport.ahp.ts` | `ahp` (default, native) / `openhands` / `openai-compatible`; local planner fallback. |
| Chat UI | `extensions/gitcortex-ai/src/chatView.ts` | Webview: conversation + run log, themed with `gitcortex.aiAccent`. |
| Types | `extensions/gitcortex-ai/src/types.ts` | `ToolDefinition`/`ToolResult`/`AgentStep`. |

## 8. Autonomy & safety

Destructive tools (`file.write`, `terminal.run`, `deploy.run`) prompt the user by default. `gitcortex.ai.autonomy` = `confirm` (default) | `auto-files` | `auto-all`.

## 9. Testing

`extensions/gitcortex-ai/test/smoke.ts` runs the orchestrator + registry + local planner headlessly and asserts the step sequence across two turns. Run: `npx tsx ./test/smoke.ts` (passes: 12 steps, plan→act→observe→reflect verified).
