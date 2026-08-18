/*---------------------------------------------------------------------------------------------
 *  Copyright (c) GitCortex Studio. All rights reserved.
 *  Licensed under the MIT License.
 *
 *  GitCortex AI foundation layer. This is the integration surface for the
 *  GitCortex AI agent (User -> AI -> Project -> Files -> Terminal -> Tests -> Git -> Deploy).
 *
 *  STATUS: foundation only. The backend agent runtime is NOT yet connected.
 *  Implementations must NOT pretend to run an agent. Until a real backend is
 *  registered, operations throw GitCortexBackendNotConnectedError.
 *--------------------------------------------------------------------------------------------*/

import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';

export const IGitCortexAgentService = createDecorator<IGitCortexAgentService>('gitcortexAgentService');

/**
 * Capability flags describing what a registered backend can do.
 * Used so the UI can honestly reflect availability instead of faking success.
 */
export interface IGitCortexAgentCapabilities {
	readonly readsFiles: boolean;
	readonly writesFiles: boolean;
	readonly runsTerminal: boolean;
	readonly runsTests: boolean;
	readonly usesGit: boolean;
	readonly deploys: boolean;
}

/**
 * A request to run an agentic task within the workspace.
 * The backend is responsible for executing it against real workspace tools.
 */
export interface IGitCortexAgentRequest {
	readonly prompt: string;
	readonly workspaceRoot: string;
	readonly cancellationToken?: unknown;
}

/**
 * Streamed progress from the agent backend (honest: only emitted by a real backend).
 */
export interface IGitCortexAgentProgress {
	readonly stage: 'understand' | 'read' | 'search' | 'edit' | 'create' | 'execute' | 'test' | 'fix' | 'git' | 'deploy';
	readonly message: string;
}

/**
 * Result of an agent run. `connected: false` means no backend was registered.
 */
export interface IGitCortexAgentResult {
	readonly connected: boolean;
	readonly summary?: string;
	readonly error?: string;
}

/**
 * Contract for an external agent backend (e.g. OpenHands or any compatible agent).
 * Implementations live outside the core; the core only defines the interface.
 */
export interface IGitCortexAgentBackend {
	readonly id: string;
	readonly label: string;
	readonly capabilities: IGitCortexAgentCapabilities;
	readonly onProgress: Event<IGitCortexAgentProgress>;
	run(request: IGitCortexAgentRequest): Promise<IGitCortexAgentResult>;
	dispose(): void;
}

export class GitCortexBackendNotConnectedError extends Error {
	constructor() {
		super('GitCortex AI backend is not connected. Register an IGitCortexAgentBackend to enable agent operations.');
		this.name = 'GitCortexBackendNotConnectedError';
	}
}

export interface IGitCortexAgentService {
	readonly _serviceBrand: undefined;

	/**
	 * True only when a real backend has been registered.
	 */
	readonly isBackendConnected: boolean;

	/**
	 * Register an external agent backend (e.g. OpenHands integration).
	 * Throws if a backend with the same id is already registered.
	 */
	registerBackend(backend: IGitCortexAgentBackend): void;

	/**
	 * Run an agent request. If no backend is connected, returns a result with
	 * `connected: false` and a clear message — it does NOT fake a result.
	 */
	run(request: IGitCortexAgentRequest): Promise<IGitCortexAgentResult>;
}
