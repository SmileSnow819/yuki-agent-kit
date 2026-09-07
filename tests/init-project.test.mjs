import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync, statSync, symlinkSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const skill = resolve('skills/yuki-agent-kit');
const script = join(skill, 'scripts/init-project.sh');
const files = ['AGENTS.md', 'PRODUCT.md', '.agents/notes/README.md', '.agents/skills/README.md', '.githooks/commit-msg', '.githooks/pre-push'];

// 每个场景隔离 Git 配置；不读取或改动开发者的全局 hooks 设置。
function fixture(t) {
  const dir = mkdtempSync(join(tmpdir(), 'yuki-kit-test-'));
  const target = join(dir, 'project with spaces');
  mkdirSync(target);
  const env = { ...process.env, GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: '/dev/null' };
  for (const key of Object.keys(env)) {
    if (/^GIT_(DIR|WORK_TREE|COMMON_DIR|INDEX_FILE|CONFIG_COUNT|CONFIG_KEY_.*|CONFIG_VALUE_.*)$/.test(key)) delete env[key];
  }
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const git = (...args) => {
    const result = spawnSync('git', ['-C', target, ...args], { env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
  const run = (entry = script, ...args) => spawnSync('sh', [entry, ...(args.length ? args : [target])], { env, encoding: 'utf8' });
  return { dir, target, env, git, run };
}

test('单独复制 Skill 后可离线初始化，并且重复执行不改已有内容', t => {
  const { dir, target, git, run } = fixture(t);
  const installed = join(dir, 'standalone-skill');
  cpSync(skill, installed, { recursive: true });
  const entry = join(installed, 'scripts/init-project.sh');
  let result = run(entry);
  assert.equal(result.status, 0, result.stderr);
  for (const file of files) assert.ok(existsSync(join(target, file)), file);
  assert.equal(git('config', '--get', 'core.hooksPath'), '.githooks');
  assert.ok(statSync(join(target, '.githooks/commit-msg')).mode & 0o111);
  const before = files.map(file => readFileSync(join(target, file)));
  result = run(entry);
  assert.equal(result.status, 0, result.stderr);
  files.forEach((file, i) => assert.deepEqual(readFileSync(join(target, file)), before[i]));
  assert.match(result.stdout, /Keeping existing/);
});

test('已有规则、hook 内容、权限和自定义 hooksPath 全部保留', t => {
  const { target, git, run } = fixture(t);
  git('init');
  git('config', 'core.hooksPath', '.husky/_');
  mkdirSync(join(target, '.githooks'));
  writeFileSync(join(target, 'AGENTS.md'), '用户规则\n');
  writeFileSync(join(target, 'PRODUCT.md'), '用户产品\n');
  const hook = join(target, '.githooks/commit-msg');
  writeFileSync(hook, '# custom hook\n');
  chmodSync(hook, 0o600);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(target, 'AGENTS.md'), 'utf8'), '用户规则\n');
  assert.equal(readFileSync(join(target, 'PRODUCT.md'), 'utf8'), '用户产品\n');
  assert.equal(readFileSync(hook, 'utf8'), '# custom hook\n');
  assert.equal(statSync(hook).mode & 0o777, 0o600);
  assert.equal(git('config', '--get', 'core.hooksPath'), '.husky/_');
});

test('已有默认 Git hook 时不切换 hooksPath', t => {
  const { target, env, git, run } = fixture(t);
  git('init');
  const hook = join(target, '.git/hooks/pre-commit');
  writeFileSync(hook, '#!/bin/sh\nexit 0\n');
  chmodSync(hook, 0o755);
  assert.equal(run().status, 0);
  assert.equal(spawnSync('git', ['-C', target, 'config', '--get', 'core.hooksPath'], { env }).status, 1);
  assert.equal(readFileSync(hook, 'utf8'), '#!/bin/sh\nexit 0\n');
});

test('既有 .githooks 目录不会被意外激活', t => {
  const { target, env, run } = fixture(t);
  mkdirSync(join(target, '.githooks'));
  const result = run();
  assert.equal(result.status, 0);
  assert.equal(spawnSync('git', ['-C', target, 'config', '--get', 'core.hooksPath'], { env }).status, 1);
  assert.match(result.stdout, /发现 \.githooks，但当前未启用；如需启用，请运行 git config --local core\.hooksPath \.githooks/);
});

test('显式 --enable-hooks 才启用已有 .githooks', t => {
  const { target, git, run } = fixture(t);
  mkdirSync(join(target, '.githooks'));
  const result = run(script, '--enable-hooks', target);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git('config', '--get', 'core.hooksPath'), '.githooks');
  assert.match(result.stdout, /Enabled core\.hooksPath=\.githooks/);
});

test('空白 PRODUCT 和 AGENTS 模板会在结束时标记待填写', t => {
  const { run } = fixture(t);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /待填写：PRODUCT\.md/);
  assert.match(result.stdout, /待填写：AGENTS\.md/);
});

test('保留断开的文件符号链接，不沿目录符号链接写入外部', t => {
  const { dir, target, run } = fixture(t);
  const outside = join(dir, 'outside');
  mkdirSync(outside);
  symlinkSync(join(outside, 'missing.md'), join(target, 'AGENTS.md'));
  symlinkSync(outside, join(target, '.agents'));
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(join(outside, 'missing.md')), false);
  assert.equal(existsSync(join(outside, 'notes')), false);
  assert.equal(existsSync(join(outside, 'skills')), false);
});

test('在 worktree 中使用原有 .git 文件，不重新初始化', t => {
  const { dir, target, git, run } = fixture(t);
  git('init');
  git('-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '--allow-empty', '-m', 'initial');
  const worktree = join(dir, 'worktree');
  git('worktree', 'add', '--detach', worktree);
  const before = readFileSync(join(worktree, '.git'), 'utf8');
  const result = run(script, worktree);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(readFileSync(join(worktree, '.git'), 'utf8'), before);
  // 未启用 worktreeConfig 时 hooksPath 是共享配置，不应影响主工作区。
  assert.equal(git('config', '--local', '--list').includes('core.hookspath='), false);
});

test('拒绝不存在的目录和仓库子目录', t => {
  const { target, git, run } = fixture(t);
  assert.notEqual(run(script, join(target, 'missing')).status, 0);
  git('init');
  const nested = join(target, 'subdir');
  mkdirSync(nested);
  assert.notEqual(run(script, nested).status, 0);
  assert.equal(existsSync(join(nested, 'AGENTS.md')), false);
});
