// clasp 3.x dropped built-in TypeScript transpilation (see docs/DECISIONS.md).
// Our source has no import/export (Apps Script has no module system), so a
// plain `tsc` emit is all the "bundling" this project needs — no Rollup/esbuild.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';

const tscBin = createRequire(import.meta.url).resolve('typescript/bin/tsc');
execFileSync(process.execPath, [tscBin], { stdio: 'inherit' });

mkdirSync('build', { recursive: true });
copyFileSync('src/appsscript.json', 'build/appsscript.json');
