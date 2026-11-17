#!/usr/bin/env node
/**
 * Guard against undefined identifiers slipping into a build.
 *
 * `vite build` transpiles with esbuild and does NOT type-check, so a component
 * that references a variable it cannot see (for example a module-level component
 * calling a `t()` helper that only exists inside another component's scope) ships
 * fine and then throws `ReferenceError: t is not defined` at render time.
 *
 * This check runs TypeScript and fails on "Cannot find name" / "is not defined"
 * diagnostics only, so the repository's other pre-existing type issues do not
 * block a build while this whole class of runtime crash is caught.
 *
 *   node scripts/check-undefined-identifiers.mjs
 */

import { execSync } from 'node:child_process';

let output = '';
let failed = false;

try {
  output = execSync('npx tsc --noEmit --pretty false', {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 32 * 1024 * 1024
  });
} catch (error) {
  // tsc exits non-zero whenever any diagnostic exists; the output is what matters.
  output = `${error.stdout || ''}${error.stderr || ''}`;
}

const lines = output.split('\n').filter(Boolean);
const problems = lines.filter(line =>
  /error TS(2304|2552|2448|18004|18013):/.test(line) ||
  /Cannot find name/.test(line) ||
  /is not defined/.test(line)
);

if (problems.length > 0) {
  failed = true;
  console.error('Undefined identifier check FAILED:\n');
  problems.forEach(problem => console.error(`  - ${problem}`));
  console.error(
    '\nA component referenced a value it cannot see. If a shared helper such as the\n' +
      'i18n `t()` is used in a module-level component, that component needs its own\n' +
      'hook call (e.g. `const { t } = usePlatformLanguage();`) inside its body.'
  );
  process.exit(1);
}

console.log('Undefined identifier check passed (no "Cannot find name" diagnostics).');
