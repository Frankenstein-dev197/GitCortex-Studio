/**
 * The GitCortex AI tool registry.
 *
 * Tools are the agent's capabilities (project / files / terminal / tests / deploy).
 * The registry holds tool definitions and their handlers, and lets other
 * extensions register custom tools through the public `gitcortex.ai` API.
 */
import type { ToolDefinition, ToolHandler } from './types';

class ToolRegistry {
	private readonly tools = new Map<string, { definition: ToolDefinition; handler: ToolHandler }>();

	register(definition: ToolDefinition, handler: ToolHandler): { dispose: () => void } {
		if (this.tools.has(definition.name)) {
			throw new Error(`GitCortex AI: tool "${definition.name}" is already registered`);
		}
		this.tools.set(definition.name, { definition, handler });
		return { dispose: () => this.tools.delete(definition.name) };
	}

	get(name: string): { definition: ToolDefinition; handler: ToolHandler } | undefined {
		return this.tools.get(name);
	}

	all(): ToolDefinition[] {
		return Array.from(this.tools.values(), (t) => t.definition);
	}

	async invoke(name: string, args: Record<string, unknown>): Promise<import('./types').ToolResult> {
		const entry = this.tools.get(name);
		if (!entry) {
			return { ok: false, summary: `Unknown tool: ${name}` };
		}
		try {
			return await entry.handler(args);
		} catch (err) {
			return {
				ok: false,
				summary: `Tool "${name}" threw: ${err instanceof Error ? err.message : String(err)}`,
			};
		}
	}
}

export const toolRegistry = new ToolRegistry();
