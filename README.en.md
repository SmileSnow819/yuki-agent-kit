# yuki-agent-kit

Let an AI agent add product context, Agent rules, decision records, Git Hooks, and companion skills to a new or existing project.

[中文](README.md)

## Quick start

Run this in the target project root to install the onboarding skill:

```sh
npx skills add SmileSnow819/yuki-agent-kit --skill yuki-agent-kit
```

Select your AI tool when prompted. Installation is project-local by default; add `--agent codex` to target Codex only. Requires Node.js 22.20.0 or later, npm, and Git (validated with `skills@1.5.24`). You do not need to clone this repository, install a global `yuki` command, or publish an npm package with this name; this uses the [skills installer](https://github.com/vercel-labs/skills).

Send this in the project's AI session (reopen the session if the new skill is not visible):

```text
Use yuki-agent-kit to add development conventions and companion skills to this project.
Keep existing files and only create missing content.
```

The agent inspects the project, runs the script bundled with the skill, installs missing companion skills, and reports created and preserved files.

> The GitHub command uses pushed repository content. To validate unpublished changes, maintainers can replace the repository name with the absolute path to their local checkout in a temporary project.

## Existing and new projects

Existing project: run the installation command above in the project root, then talk to your AI agent.

New project: create and enter an empty directory, then run the same installation command.

```sh
mkdir my-app
cd my-app
npx skills add SmileSnow819/yuki-agent-kit --skill yuki-agent-kit
```

Tell the agent the product goal, users, and technology stack so it can fill in newly created templates using your information. The initialization script runs `git init` if the directory has no Git repository.

## What gets added

- `PRODUCT.md`, `AGENTS.md`: product context and development rules.
- `.agents/notes/README.md`, `.agents/skills/README.md`: decision records and project skill guidance.
- `.githooks/commit-msg`: validates Chinese commit subjects with a type prefix.
- `.githooks/pre-push`: an empty template for project configuration; no build tool assumptions.
- Companion skills: `project-bootstrap`, `agent-notes`, `code-review`, `find-simplifications`, `trim-cot-leakage`. Full onboarding includes all five by default; you can request a subset.

The onboarding skill bundles its script and templates, so template initialization needs no network after installation. Companion skills are fetched from this repository by the installer. Their directory depends on the selected AI tool; Codex uses `.agents/skills/` for project installations.

## Existing content and updates

Existing files print `Keeping existing` and are skipped, preserving their contents and permissions. Existing companion skills with matching names are also kept. If hooks configuration, default Git hooks, a `.githooks/` directory, or a worktree already exists, hooks configuration is not switched automatically; the agent reports pending integration. Ordinary repositories without existing hooks enable `.githooks/`.

The installer maintains skill sources and update records. You can ask the agent to check for updates; updating a skill does not automatically update files already copied into the project. Reinitialization only fills missing files. Changes to existing product context, rules, and hooks require separate review.

## Repository layout

```text
skills/
  yuki-agent-kit/
    SKILL.md
    scripts/init-project.sh
    assets/templates/
    references/
  agent-notes/
  code-review/
  ...
starter/scripts/init-project.sh  Compatibility entrypoint for local source use
tests/                          Initialization behavior tests
```

To initialize from local source without an AI agent:

```sh
sh starter/scripts/init-project.sh /absolute/path/to/project
```

This command initializes templates only; it does not install companion skills.

## Optional: Superpowers

[Superpowers](https://github.com/obra/superpowers) can be installed independently. It is neither bundled nor automatically installed by this kit:

```sh
npx skills add obra/superpowers
```

## Development

Maintain templates and installation logic only in the onboarding skill so it remains self-contained after installation. Keep reusable methods here and project facts and decisions in the target project. Skills should have one responsibility, with conditional guidance under `references/`. Update both README translations together.

Initialization behavior tests require Node.js 18 or later; shell scripts remain POSIX `sh` compatible:

```sh
node --test tests/init-project.test.mjs
sh -n skills/yuki-agent-kit/scripts/init-project.sh
git diff --check
```
