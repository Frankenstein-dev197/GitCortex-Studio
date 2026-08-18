/**
 * Public types for the GitCortex AI agent.
 */

export type ToolParameterType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface ToolParameter {
	type: ToolParameterType;
	description?: string;
	required?: boolean;
	items?: ToolParameter;
	properties?: Record<string, ToolParameter>;
}

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: Record<string, ToolParameter>;
}

export interface ToolResult {
	ok: boolean;
	/** Human-readable summary shown in the run log. */
	summary: string;
	/** Structured data returned to the orchestrator. */
	data?: unknown;
	/** If true, the tool call required and received user confirmation. */
	confirmed?: boolean;
}

export type ToolHandler = (args: Record<string, unknown>) => Promise<ToolResult>;

export interface ChatMessage {
	readonly role: 'user' | 'assistant' | 'tool';
	readonly content: string;
	readonly toolCall?: { name: string; args: Record<string, unknown>; result?: ToolResult };
}

export interface AgentStep {
	readonly type: 'plan' | 'act' | 'observe' | 'reflect' | 'message' | 'error';
	readonly summary: string;
	readonly detail?: string;
	readonly toolCall?: { name: string; args: Record<string, unknown> };
	readonly toolResult?: ToolResult;
}

export interface AgentRunOptions {
	/** Autonomy level for destructive tools. */
	autonomy: 'confirm' | 'auto-files' | 'auto-all';
}

/** Public API exposed to other extensions via `gitcortex.ai`. */
export interface GitCortexAIApi {
	registerTool(tool: ToolDefinition, handler: ToolHandler): unknown;
}
