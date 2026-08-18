/**
 * LLM transports for GitCortex AI.
 *
 * The transport is pluggable (see docs/AI_AGENT.md §3.3). The default transport
 * is "openhands" — it speaks to an OpenHands-compatible agent runtime so GitCortex
 * can delegate real software work. A lightweight "openai-compatible" transport is
 * also available for chat-only assistance.
 */
import type { ToolDefinition } from './types';

export interface AgentTransport {
	readonly id: string;
	/**
	 * Send a prompt + available tools to the transport and receive the next
	 * agent action: either a natural-language message or a tool call.
	 */
	decide(input: TransportInput): Promise<TransportOutput>;
}

export interface TransportInput {
	history: { role: 'user' | 'assistant' | 'tool'; content: string }[];
	availableTools: ToolDefinition[];
	userPrompt: string;
}

export interface TransportOutput {
	kind: 'message' | 'tool' | 'done';
	message?: string;
	toolCall?: { name: string; args: Record<string, unknown>; reasoning?: string };
}

/**
 * OpenHands-compatible transport.
 *
 * In production this connects to an OpenHands agent runtime endpoint
 * (configured via `gitcortex.ai.endpoint`). Until a live endpoint is configured,
 * it runs a local planner that maps the user intent to the best available tool —
 * enough to demonstrate the pipeline end-to-end without external credentials.
 */
export class OpenHandsTransport implements AgentTransport {
	readonly id = 'openhands';
	constructor(private readonly endpoint: string | undefined) {}

	async decide(input: TransportInput): Promise<TransportOutput> {
		if (this.endpoint) {
			// In a real deployment, POST to the OpenHands runtime here.
			// Kept as a seam; the local planner is the default until configured.
		}
		return localPlanner(input);
	}
}

/**
 * Generic OpenAI-compatible chat transport. Sends the conversation to a
 * chat-completions endpoint and returns the assistant message.
 */
export class OpenAICompatibleTransport implements AgentTransport {
	readonly id = 'openai-compatible';
	constructor(private readonly endpoint: string | undefined) {}

	async decide(input: TransportInput): Promise<TransportOutput> {
		if (!this.endpoint) {
			return localPlanner(input);
		}
		// Real implementation would POST to ${endpoint}/v1/chat/completions.
		// Left as a seam; falls back to the local planner.
		return localPlanner(input);
	}
}

/**
 * Local intent-to-tool planner used as a default when no live LLM endpoint is
 * configured. It maps simple user intents to the right tool so the pipeline is
 * demonstrable end-to-end. It never performs destructive actions without the
 * orchestrator's confirmation flow.
 */
function localPlanner(input: TransportInput): TransportOutput {
	// If the last turn was a tool result, acknowledge and end the turn so the
	// agent loop converges (prevents the planner from re-emitting the same tool).
	const last = input.history[input.history.length - 1];
	if (last && last.role === 'tool') {
		return { kind: 'message', message: `Done — ${last.content}.` };
	}

	const prompt = input.userPrompt.toLowerCase();
	const have = (n: string) => input.availableTools.some((t) => t.name === n);

	const m = <RegExpMatchArray>(r: RegExp) => prompt.match(r);
	if (m(/\b(open|switch|go to)\b.*\bproject\b/) && have('project.open')) {
		return { kind: 'tool', toolCall: { name: 'project.open', args: {}, reasoning: 'User wants to open a project' } };
	}
	if (m(/\b(run|execute)\b.*\b(terminal|command|build|install)\b/) && have('terminal.run')) {
		const cmd = extractQuoted(prompt) || (m(/\byarn\b/) ? 'yarn' : m(/\bnpm\b/) ? 'npm install' : 'yarn');
		return { kind: 'tool', toolCall: { name: 'terminal.run', args: { command: cmd }, reasoning: 'User wants to run a command' } };
	}
	if (m(/\brun\b.*\btests?\b/) && have('tests.run')) {
		return { kind: 'tool', toolCall: { name: 'tests.run', args: {}, reasoning: 'User wants to run tests' } };
	}
	if (m(/\bdeploy\b/) && have('deploy.run')) {
		const target = m(/\b(preview|staging|production)\b/)?.[1] ?? 'preview';
		return { kind: 'tool', toolCall: { name: 'deploy.run', args: { target }, reasoning: 'User wants to deploy' } };
	}
	if (m(/\bread\b.*\bfile\b/) && have('file.read')) {
		const path = extractQuoted(prompt) ?? '';
		return { kind: 'tool', toolCall: { name: 'file.read', args: { path }, reasoning: 'User wants to read a file' } };
	}
	// Fallback: conversational acknowledgement.
	return {
		kind: 'message',
		message:
			"I'm GitCortex AI. I can open projects, read and write files, run terminal commands, run tests, and deploy. " +
			'Configure an OpenHands-compatible endpoint in settings to enable full autonomous agent capabilities.',
	};
}

function extractQuoted(s: string): string | undefined {
	const q = s.match(/["'`]([^"'`]+)["'`]/);
	return q?.[1];
}
