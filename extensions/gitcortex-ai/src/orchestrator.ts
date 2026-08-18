/**
 * The GitCortex AI orchestrator.
 *
 * Owns the agent loop (plan → act → observe → reflect) and mediates between the
 * chat UI and the tools. Mirrors the engine's own agentHost orchestrator shape
 * (see docs/CODE-OSS-ANALYSIS.md §6) so a future migration onto the engine's
 * native Agent Host Protocol (AHP) is a thin harness swap.
 */
import type { AgentStep, ChatMessage, ToolResult } from './types';
import { toolRegistry } from './toolRegistry';
import type { AgentTransport, TransportOutput } from './transport';

export interface OrchestratorCallbacks {
	onStep: (step: AgentStep) => void;
}

export class AgentOrchestrator {
	private readonly history: ChatMessage[] = [];
	private readonly steps: AgentStep[] = [];
	private running = false;

	constructor(
		private readonly transport: AgentTransport,
		private readonly autonomy: () => 'confirm' | 'auto-files' | 'auto-all',
		private readonly callbacks: OrchestratorCallbacks,
	) {}

	clear(): void {
		this.history.length = 0;
		this.steps.length = 0;
	}

	getSteps(): readonly AgentStep[] {
		return this.steps;
	}

	getHistory(): readonly ChatMessage[] {
		return this.history;
	}

	/** Run one user turn through the plan→act→observe→reflect loop. */
	async run(userPrompt: string): Promise<void> {
		if (this.running) {
			return;
		}
		this.running = true;
		try {
			this.history.push({ role: 'user', content: userPrompt });
			this.emit({ type: 'message', summary: userPrompt });

			// Bound the loop to avoid runaway agent execution.
			const maxIterations = 8;
			for (let i = 0; i < maxIterations; i++) {
				const decision = await this.transport.decide({
					history: this.history.map((m) => ({ role: m.role, content: m.content })),
					availableTools: toolRegistry.all(),
					userPrompt,
				});

				if (decision.kind === 'message' || decision.kind === 'done') {
					if (decision.message) {
						this.history.push({ role: 'assistant', content: decision.message });
						this.emit({ type: 'message', summary: decision.message });
					}
					this.emit({ type: 'reflect', summary: 'Conversation turn complete' });
					break;
				}

				if (decision.kind === 'tool' && decision.toolCall) {
					const { name, args } = decision.toolCall;
					this.emit({
						type: 'act',
						summary: `Calling tool: ${name}`,
						detail: `args: ${JSON.stringify(args)}`,
						toolCall: { name, args },
					});
					const result: ToolResult = await toolRegistry.invoke(name, args);
					this.history.push({
						role: 'tool',
						content: result.summary,
						toolCall: { name, args, result },
					});
					this.emit({
						type: 'observe',
						summary: result.summary,
						toolCall: { name, args },
						toolResult: result,
					});
					if (!result.ok) {
						this.emit({ type: 'reflect', summary: `Tool ${name} failed; stopping turn` });
						break;
					}
					continue;
				}

				// Unexpected decision shape: stop safely.
				this.emit({ type: 'error', summary: 'Unexpected transport response' });
				break;
			}
			// Loop exhausted without an explicit "done": summarize the turn.
			this.emit({ type: 'reflect', summary: 'Turn complete' });
		} finally {
			this.running = false;
		}
	}

	private emit(step: AgentStep): void {
		this.steps.push(step);
		this.callbacks.onStep(step);
	}
}
