# GitCortex Studio — Project Chronicle

> Permanent historical record of the project from its inception onward.

## Purpose

This document is the canonical chronological record of GitCortex Studio. It records the project's origin, decisions, architecture, research, implementation milestones, integrations, deployment strategy, major changes, problems, fixes, and future direction.

The goal is to preserve **why** the project was built, not only **what** was built.

## Project Identity

- **Project:** GitCortex Studio
- **Repository:** `Frankenstein-dev197/GitCortex-Studio`
- **Primary repository role:** product source code + permanent engineering documentation
- **Current editor foundation:** Code-OSS / VS Code architecture
- **AI direction:** GitCortex AI agents and agentic development workflows
- **Planned cloud platform direction:** Coder-based cloud development environments
- **Planned infrastructure direction:** Coder workspaces + custom product layer + custom CI/CD

## 2026-08-18 — GitCortex Studio Repository Foundation

GitCortex Studio was established as the project repository for a professional developer IDE built around the Code-OSS/VS Code engine, with a GitCortex AI agent, an extension platform, and a developer-first interface.

The repository already contains the main Code-OSS source, GitCortex-specific code, extensions, product material, resources, and a `docs/` directory.

## 2026-08-21 — Expansion Toward a Full Cloud Development Platform

The project direction expanded beyond a standalone code editor.

The target became a complete developer platform combining:

- a professional code editor;
- cloud development workspaces;
- Git and GitHub integration;
- AI coding agents;
- agent orchestration;
- custom CI/CD;
- build and test automation;
- preview environments;
- deployments;
- infrastructure management;
- security and observability;
- project and team management;
- future billing and marketplace capabilities.

## 2026-08-22 — Coder as the Cloud Workspace Foundation

The project direction was clarified: Coder is intended to provide the complete cloud development/workspace foundation rather than merely serving as visual inspiration.

The intended approach is to preserve the capabilities of Coder across its workspace, infrastructure, template, Terraform, IDE, terminal, API, administration, integrations, and AI capabilities, while building a distinct GitCortex product layer around them.

The platform is therefore envisioned as:

```text
GitCortex Studio
        |
        +-- GitCortex Product Layer
        |     +-- Product UX
        |     +-- AI orchestration
        |     +-- Custom CI/CD
        |     +-- Projects / Teams
        |     +-- Deployments
        |     +-- Security
        |     +-- Observability
        |     +-- Billing / Marketplace (future)
        |
        +-- Coder Foundation
              +-- Workspaces
              +-- Templates
              +-- Terraform
              +-- Infrastructure
              +-- IDE / Terminal
              +-- Agents
              +-- APIs / Administration
```

## Research Direction

The project research has examined and will continue to examine:

- Coder
- Code-OSS / VS Code
- OpenHands
- GitHub Copilot coding agents
- Replit Agent
- Jules
- cloud development environments
- AI software factories
- CI/CD systems
- deployment platforms
- Kubernetes and containerized workspaces
- Railway, Vercel, Supabase, and related infrastructure services

Research results must be captured in dedicated documentation instead of remaining only in conversations.

## Product Principles

1. **Build on proven infrastructure where practical.**
2. **Preserve the full capabilities of the chosen foundation rather than creating artificial feature limitations.**
3. **Make GitCortex's product layer independently valuable.**
4. **Treat AI as an engineering system, not only a chat interface.**
5. **Keep CI/CD under GitCortex control.**
6. **Document important decisions as they happen.**
7. **Keep a permanent chronological record of major changes.**
8. **Validate licensing and upstream obligations before redistributing or commercializing third-party components.**
9. **Prefer real, working functionality over mock implementations.**
10. **Design for a path from individual developer use to teams and enterprise environments.**

## Documentation Rule

Every major project event should be documented with:

- date;
- decision or change;
- reason;
- affected components;
- implementation status;
- validation/evidence;
- known limitations;
- next action.

## Status

This chronicle is a living document. It must be updated throughout the entire life of GitCortex Studio.
