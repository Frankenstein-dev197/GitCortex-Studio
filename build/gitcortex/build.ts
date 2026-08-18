/**
 * Build wrappers for GitCortex Studio. These delegate to the Code-OSS build
 * (gulp) so we never duplicate the engine build — we orchestrate it.
 *
 * Scripts:
 *   yarn gitcortex:brand   → apply branding patches to code-oss/
 *   yarn compile           → gulp compile (engine + workbench)
 *   yarn compile:extensions→ build the three gitcortex extensions
 *   yarn launch            → launch the desktop app from the dev build
 *   yarn package           → produce a distributable with GitCortex branding
 */
import * as cp from 'child_process';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');
const CODE_OSS = path.join(ROOT, 'code-oss');

function run(cmd: string, args: string[], cwd: string): void {
	console.log(`$ ${cmd} ${args.join(' ')}  (cwd: ${path.relative(ROOT, cwd)})`);
	cp.spawnSync(cmd, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
}

const task = process.argv[2];

switch (task) {
	case 'install':
		run('yarn', ['install'], CODE_OSS);
		break;
	case 'compile':
		run('yarn', ['compile'], CODE_OSS);
		break;
	case 'compile-extensions':
		run('yarn', ['--cwd', 'extensions/gitcortex-ai', 'install'], ROOT);
		run('yarn', ['--cwd', 'extensions/gitcortex-ai', 'compile'], ROOT);
		run('yarn', ['--cwd', 'extensions/gitcortex-theme', 'install'], ROOT);
		run('yarn', ['--cwd', 'extensions/gitcortex-theme', 'compile'], ROOT);
		run('yarn', ['--cwd', 'extensions/gitcortex-tools', 'install'], ROOT);
		run('yarn', ['--cwd', 'extensions/gitcortex-tools', 'compile'], ROOT);
		break;
	case 'launch':
		// Launches the Electron app from the dev build. Mirrors Code-OSS's launch path.
		run('yarn', ['launch'], CODE_OSS);
		break;
	case 'package':
		run('yarn', ['run', 'gulp', 'vscode-darwin-x64'], CODE_OSS);
		break;
	default:
		console.error('Usage: node build/gitcortex/build.ts <install|compile|compile-extensions|launch|package>');
		process.exit(1);
}
