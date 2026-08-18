/*---------------------------------------------------------------------------------------------
 *  Copyright (c) GitCortex Studio. All rights reserved.
 *  Licensed under the MIT License.
 *
 *  OpenHands integration interface.
 *
 *  This file defines a clean adapter contract so an external agent runtime
 *  (such as OpenHands, or any agent compatible with the workspace-tools model)
 *  can be plugged into GitCortex Studio WITHOUT copying OpenHands source into
 *  this repository. Concrete adapters ship separately (e.g. as an extension).
 *
 *  STATUS: interface only. No OpenHands code is vendored here.
 *--------------------------------------------------------------------------------------------*/

import { IGitCortexAgentBackend } from './gitcortex.js';

/**
 * Minimal descriptor for an external agent adapter.
 * A concrete adapter (shipped out-of-tree) implements IGitCortexAgentBackend
 * and bridges to the external runtime's native API.
 */
export interface IOpenHandsAdapterDescriptor {
	readonly id: string;
	readonly label: string;
	/**
	 * Base URL of the external agent's runtime API (e.g. an agent-server).
	 * Empty string means "not configured" — the adapter must then fail honestly.
	 */
	readonly runtimeBaseUrl: string;
	readonly apiKeyEnvVar?: string;
}

export const OPENHANDS_ADAPTER_ID = 'openhands';

/**
 * Factory contract for creating an OpenHands-backed IGitCortexAgentBackend.
 * The factory is implemented by the out-of-tree adapter; the core only
 * declares the shape so the GitCortex layer can remain runtime-agnostic.
 */
export interface IOpenHandsBackendFactory {
	create(descriptor: IOpenHandsAdapterDescriptor): IGitCortexAgentBackend;
}
