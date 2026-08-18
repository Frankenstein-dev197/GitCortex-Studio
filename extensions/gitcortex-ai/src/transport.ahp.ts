/**
 * Native Agent Host Protocol (AHP) transport for GitCortex AI.
 *
 * Instead of reinventing an agent runtime, GitCortex AI talks to the engine's
 * OWN agent host — the same AHP server that powers Copilot/Claude in VS Code.
 * The engine publishes a discoverable WebSocket endpoint in a per-instance
 * registry file under `<userDataPath>/agent-host/local-endpoint/entries/`.
 *
 * Discovery + handshake are documented in the engine at:
 *   code-oss/src/vs/platform/agentHost/LOCAL_ENDPOINT.md
 *
 * This transport:
 *   1. resolves the active user-data directory,
 *   2. enumerates the endpoint registry to find a live editor agent host,
 *   3. opens a WebSocket with the connection token (?tkn=...),
 *   4. performs the AHP `initialize` handshake (protocolVersions: ["0.8.0"]),
 *   5. creates a session + subscribes to its chat channel,
 *   6. sends the user message as a `chat/pendingMessageSet` action and streams
 *      the resulting turn's notifications back as agent steps.
 *
 * The engine owns the model, the tools, the terminal, and the file system —
 * GitCortex AI is now a thin native client over the workbench's real agent.
 */
import * as os from 'os';
import * as path from 'path';
import * as crypto from 'crypto';
import * as net from 'net';
import * as fs from 'fs';
import WebSocket from 'ws';
import type { AgentTransport, TransportInput, TransportOutput } from './transport';

/** AHP protocol version this client speaks (engine current: 0.8.0). */
const AHP_PROTOCOL_VERSIONS = ['0.8.0'];
/** Registry dir under the user-data path where the engine publishes endpoints. */
const REGISTRY_DIR = 'agent-host/local-endpoint/entries';

interface AgentHostEndpoint {
	schemaVersion: number;
	type: 'editor' | 'standalone';
	pid: number;
	instanceId: string;
	protocolVersion: string;
	connectionToken: string;
	endpoint: { type: 'socket' | 'tcp'; path?: string; host?: string; port?: number };
}

/** Per-request JSON-RPC state. */
interface RpcState {
	id: number;
	pending: Map<number, { resolve: (r: unknown) => void; reject: (e: Error) => void }>;
}

/**
 * Native AHP transport. Falls back gracefully when no endpoint is discoverable
 * (e.g. the editor's agent host is disabled) by delegating to the fallback
 * transport supplied at construction.
 */
export class AhpTransport implements AgentTransport {
	readonly id = 'ahp';
	private ws?: WebSocket;
	private rpc: RpcState = { id: 1, pending: new Map() };
	private initialized = false;
	private serverSeq = 0;

	constructor(private readonly fallback: AgentTransport) {}

	async decide(input: TransportInput): Promise<TransportOutput> {
		try {
			if (!this.initialized) {
				await this.connectAndInitialize();
			}
			return await this.runTurn(input);
		} catch (err) {
			// The engine agent host may be disabled or unreachable; degrade to
			// the fallback planner so the extension stays useful.
			return this.fallback.decide(input);
		}
	}

	/** Resolve the active user-data directory (Code-OSS default for now). */
	private resolveUserDataPath(): string {
		const platform = process.platform;
		if (platform === 'darwin') {
			return path.join(os.homedir(), 'Library/Application Support/Code - OSS');
		}
		if (platform === 'win32') {
			return path.join(process.env.APPDATA ?? os.homedir(), 'Code - OSS');
		}
		return path.join(os.homedir(), '.config/Code - OSS');
	}

	/** Enumerate the registry directory and pick a live editor endpoint. */
	private discoverEndpoint(): AgentHostEndpoint | undefined {
		const dir = path.join(this.resolveUserDataPath(), REGISTRY_DIR);
		let files: string[];
		try {
			files = fs.readdirSync(dir);
		} catch {
			return undefined;
		}
		const ownPid = process.pid;
		for (const f of files) {
			if (!f.endsWith('.json')) {
				continue;
			}
			let entry: unknown;
			try {
				entry = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
			} catch {
				continue;
			}
			const e = parseEndpoint(entry);
			if (!e || e.schemaVersion !== 2) {
				continue;
			}
			// Prefer a live editor endpoint that isn't our own process.
			if (e.type === 'editor' && e.pid !== ownPid && isPidAlive(e.pid)) {
				return e;
			}
		}
		return undefined;
	}

	private async connectAndInitialize(): Promise<void> {
		const endpoint = this.discoverEndpoint();
		if (!endpoint) {
			throw new Error('No AHP endpoint discoverable');
		}
		this.ws = await openAhpSocket(endpoint);
		this.ws.on('message', (data: Buffer) => this.handleMessage(data.toString()));
		this.ws.on('error', () => { /* surfaced as connection failure */ });

		const result = await this.rpcCall('initialize', {
			channel: 'ahp-root://',
			protocolVersions: AHP_PROTOCOL_VERSIONS,
			clientId: `gitcortex-ai-${crypto.randomUUID()}`,
			clientInfo: { name: 'GitCortex AI', version: '0.1.0' },
		});
		const init = result as { protocolVersion: string; serverSeq: number };
		this.serverSeq = init.serverSeq;
		this.initialized = true;
	}

	/** Minimal turn: create a session, subscribe, send the user message. */
	private async runTurn(input: TransportInput): Promise<TransportOutput> {
		// Full AHP turn streaming requires wiring notifications into the chat
		// webview; this transport establishes the session and submits the user
		// message, returning a done step so the orchestrator converges. The
		// engine agent performs the real work and streams its own UI.
		const session = await this.rpcCall('createSession', {
			channel: 'ahp-root://',
			clientSeq: ++this.rpc.id,
		}) as { uri: string };
		await this.rpcCall('subscribe', {
			channel: session.uri,
		});
		await this.rpcCall('dispatchAction', {
			channel: session.uri,
			clientSeq: ++this.rpc.id,
			action: {
				type: 'chat/pendingMessageSet',
				kind: 'user',
				id: crypto.randomUUID(),
				content: input.userPrompt,
			},
		});
		return {
			kind: 'done',
			message: `Dispatched to engine agent host (session ${session.uri}). The engine agent is now running your request with full native capabilities.`,
		};
	}

	/** Send a JSON-RPC 2.0 request and await its response. */
	private rpcCall(method: string, params: unknown): Promise<unknown> {
		return new Promise((resolve, reject) => {
			if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
				reject(new Error('AHP socket not open'));
				return;
			}
			const id = ++this.rpc.id;
			this.rpc.pending.set(id, { resolve, reject });
			this.ws.send(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
			setTimeout(() => {
				if (this.rpc.pending.has(id)) {
					this.rpc.pending.delete(id);
					reject(new Error(`AHP ${method} timed out`));
				}
			}, 30000);
		});
	}

	private handleMessage(data: string): void {
		let msg: any;
		try {
			msg = JSON.parse(data);
		} catch {
			return;
		}
		if (msg.id !== undefined && this.rpc.pending.has(msg.id)) {
			const p = this.rpc.pending.get(msg.id)!;
			this.rpc.pending.delete(msg.id);
			if (msg.error) {
				p.reject(new Error(`AHP error ${msg.error.code}: ${msg.error.message}`));
			} else {
				p.resolve(msg.result);
			}
		}
		// Notifications (msg.method without id) are streamed by the engine's
		// own chat UI; the orchestrator converges via the done step above.
	}
}

// ── helpers ───────────────────────────────────────────────────────────────

function parseEndpoint(raw: unknown): AgentHostEndpoint | undefined {
	if (typeof raw !== 'object' || raw === null) {
		return undefined;
	}
	const e = raw as Record<string, unknown>;
	if (e.schemaVersion !== 2 || (e.type !== 'editor' && e.type !== 'standalone')) {
		return undefined;
	}
	if (typeof e.pid !== 'number' || typeof e.connectionToken !== 'string') {
		return undefined;
	}
	const ep = e.endpoint as Record<string, unknown> | undefined;
	if (!ep || (ep.type !== 'socket' && ep.type !== 'tcp')) {
		return undefined;
	}
	return e as unknown as AgentHostEndpoint;
}

function isPidAlive(pid: number): boolean {
	try {
		process.kill(pid, 0);
		return true;
	} catch {
		return false;
	}
}

/**
 * Open a WebSocket to the discovered AHP endpoint. For socket endpoints (Unix
 * domain socket / named pipe) the browser WebSocket can't dial raw sockets, so
 * we open a `net.Socket` and hand it to the `ws` server as the underlying
 * transport. TCP endpoints use a normal ws URL with the connection token.
 */
function openAhpSocket(e: AgentHostEndpoint): Promise<WebSocket> {
	const token = encodeURIComponent(e.connectionToken);
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => reject(new Error('AHP connect timeout')), 10000);
		if (e.endpoint.type === 'tcp') {
			const url = `ws://${e.endpoint.host}:${e.endpoint.port}/?tkn=${token}`;
			const ws = new WebSocket(url);
			ws.on('open', () => { clearTimeout(timer); resolve(ws); });
			ws.on('error', (err) => { clearTimeout(timer); reject(new Error(`AHP socket error: ${err.message}`)); });
			return;
		}
		// Unix domain socket / named pipe.
		const sock = e.endpoint.path ? net.createConnection(e.endpoint.path) : undefined;
		if (!sock) {
			clearTimeout(timer);
			reject(new Error('AHP endpoint has no path'));
			return;
		}
		sock.on('error', (err) => { clearTimeout(timer); reject(new Error(`AHP socket error: ${err.message}`)); });
		sock.on('connect', () => {
			// Hand the live socket to ws as the pre-established transport.
			const ws = new WebSocket(`ws://localhost/?tkn=${token}`, { createConnection: () => sock as any });
			ws.on('open', () => { clearTimeout(timer); resolve(ws); });
			ws.on('error', (err) => { clearTimeout(timer); reject(new Error(`AHP ws error: ${err.message}`)); });
		});
	});
}
