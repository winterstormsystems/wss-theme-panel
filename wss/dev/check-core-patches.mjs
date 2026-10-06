#!/usr/bin/env node
// Upgrade guard for WSS core patches.
//
//   node wss/dev/check-core-patches.mjs [upstream-ref]     (default: origin/2.0-develop)
//
// For every entry in wss/core-patches.json it reports whether upstream changed the file since
// the patch was made (blob differs from upstreamBlob), and whether the WSS patch is still
// present in the working tree. It also lists upstream files modified in the working tree that
// are not registered. Exit code 1 when anything needs attention.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const ref = process.argv[2] ?? 'origin/2.0-develop';
const registry = JSON.parse(readFileSync(join(root, 'wss/core-patches.json'), 'utf8'));
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
const blobAt = (path) => {
    try {
        return git('rev-parse', `${ref}:${path}`);
    } catch {
        return null;
    }
};

let attention = 0;
console.log(`Checking ${registry.patches.length} WSS core patches against ${ref}\n`);
for (const patch of registry.patches) {
    const current = blobAt(patch.path);
    const source = readFileSync(join(root, patch.path), 'utf8');
    const applied = source.includes('@/wss');
    const upstream = current === null ? 'REMOVED upstream' : current === patch.upstreamBlob ? 'unchanged' : 'CHANGED upstream';
    const flag = upstream !== 'unchanged' || !applied;
    if (flag) attention++;
    console.log(`${flag ? '!!' : 'ok'}  ${patch.path}`);
    console.log(`    upstream: ${upstream}   patch present: ${applied ? 'yes' : 'NO'}   kind: ${patch.kind}   risk: ${patch.conflictRisk}`);
    if (upstream === 'CHANGED upstream') console.log(`    review:   git diff ${patch.upstreamBlob} ${current}`);
}

const registered = new Set(registry.patches.map((p) => p.path));
const modified = git('diff', '--name-only', ref, '--', '.', ':!wss', ':!themes', ':!resources/scripts/wss')
    .split('\n')
    .filter(Boolean);
const unregistered = modified.filter((path) => !registered.has(path));
if (unregistered.length) {
    attention++;
    console.log('\nUpstream files modified but not in wss/core-patches.json:');
    unregistered.forEach((path) => console.log(`    ${path}`));
}

console.log(attention ? `\n${attention} item(s) need attention.` : '\nAll WSS core patches are current.');
process.exitCode = attention ? 1 : 0;
