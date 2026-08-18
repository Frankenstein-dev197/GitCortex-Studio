/*---------------------------------------------------------------------------------------------
 *  Copyright (c) GitCortex Studio. All rights reserved.
 *  Licensed under the MIT License.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IGitCortexAgentService, IGitCortexAgentBackend, IGitCortexAgentRequest, IGitCortexAgentResult, GitCortexBackendNotConnectedError } from './gitcortex.js';

/**
 * Default implementation of the GitCortex agent service.
 *
 * Honest behaviour: until a real backend is registered via `registerBackend`,
 * `isBackendConnected` is false and `run` returns a result with `connected: false`
 * carrying a clear message. It never fabricates an agent outcome.
 */
class GitCortexAgentService implements IGitCortexAgentService {
	declare readonly _serviceBrand: undefined;

	private readonly backends = new Map<string, IGitCortexAgentBackend>();

	get isBackendConnected(): boolean {
		return this.backends.size > 0;
	}

	registerBackend(backend: IGitCortexAgentBackend): void {
		if (this.backends.has(backend.id)) {
			throw new Error(`GitCortex agent backend '${backend.id}' is already registered.`);
		}
		this.backends.set(backend.id, backend);
	}

	async run(request: IGitCortexAgentRequest): Promise<IGitCortexAgentResult> {
		// Prefer the first registered backend. This keeps the surface minimal
		// while remaining extensible for multi-backend selection later.
		const backend = this.backends.values().next().value;
		if (!backend) {
			return {
				connected: false,
				error: new GitCortexBackendNotConnectedError().message,
			};
		}
		return backend.run(request);
	}
}

registerSingleton(IGitCortexAgentService, GitCortexAgentService, InstantiationType.Delayed);
