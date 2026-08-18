/**
 * Smoke test for the GitCortex AI pipeline (no live VS Code needed).
 *
 * Exercises the orchestrator + tool registry + local planner directly — these
 * modules don't import `vscode`, so we can run them headlessly. Asserts the
 * plan → act → observe → reflect loop produces the expected step sequence for
 * a "run tests" intent.
 *
 * Run: npx tsx ./test/smoke.ts
 */
import { toolRegistry } from '../src/toolRegistry';
import { OpenHandsTransport } from '../src/transport';
import { AgentOrchestrator } from '../src/orchestrator';
import type { AgentStep } from '../src/types';

// Register a fake destructive tool so we can assert the autonomy/confirm flow
// without touching the real vscode-dependent built-ins.
let terminalCalls = 0;
toolRegistry.register(
	{
		name: 'terminal.run',
		description: 'Run a shell command in the integrated terminal.',
		parameters: { command: { type: 'string', required: true } },
	},
	async (args) => {
		terminalCalls++;
		return { ok: true, summary: `Ran: ${args.command}`, confirmed: true };
	},
);
toolRegistry.register(
	{
		name: 'tests.run',
		description: 'Run the test suite.',
		parameters: { selector: { type: 'string' } },
	},
	async () => {
		return { ok: true, summary: 'Triggered test run' };
	},
);
toolRegistry.register(
	{
		name: 'deploy.run',
		description: 'Trigger a deployment flow.',
		parameters: { target: { type: 'string' } },
	},
	async (args) => ({ ok: true, summary: `Deployed to ${args.target}`, confirmed: true }),
);

const steps: AgentStep[] = [];
const orchestrator = new AgentOrchestrator(new OpenHandsTransport(undefined), () => 'auto-all', {
	onStep: (s) => steps.push(s),
});

async function main() {
	await orchestrator.run('please run the tests');

	const types = steps.map((s) => s.type);
	assert(types.includes('message'), 'user message emitted');
	assert(types.includes('act'), 'act step emitted');
	assert(types.includes('observe'), 'observe step emitted');
	assert(types.includes('reflect'), 'reflect step emitted');

	const actStep = steps.find((s) => s.type === 'act');
	assert(actStep?.toolCall?.name === 'tests.run', 'planner picked tests.run');

	// A second turn exercising the deploy intent + autonomy.
	await orchestrator.run('deploy to production');
	const deployObserve = [...steps].reverse().find((s) => s.type === 'observe');
	assert(deployObserve?.toolResult?.ok, 'deploy produced a successful result');
	assert(deployObserve?.toolCall?.args?.target === 'production', 'deploy target propagated as production');

	console.log(`Captured ${steps.length} steps across 2 turns.`);
	console.log('SMOKE TEST PASSED');
}

function assert(cond: unknown, msg: string): void {
	if (!cond) {
		console.error('ASSERT FAILED:', msg);
		console.error('Steps:', JSON.stringify(steps, undefined, 2));
		process.exit(1);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
